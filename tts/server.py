import os
import re
from io import BytesIO

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from kokoro import KPipeline


app = FastAPI()

pipeline = None
pipeline_error = None


def get_pipeline():
    global pipeline, pipeline_error

    if pipeline is not None:
        return pipeline

    if pipeline_error is not None:
        raise RuntimeError(f"Kokoro initialization previously failed: {pipeline_error}")

    print("========== INITIALIZING KOKORO ==========", flush=True)

    try:
        pipeline = KPipeline(lang_code="b")
        print("========== KOKORO READY ==========", flush=True)
        return pipeline

    except Exception as error:
        pipeline_error = str(error)
        print("========== KOKORO INIT ERROR ==========", flush=True)
        print(repr(error), flush=True)
        print("========================================", flush=True)
        raise

class TTSRequest(BaseModel):
    text: str


def clean_for_speech(text: str) -> str:
    """Remove Markdown formatting that should not be spoken aloud."""

    # Bold: **text** -> text
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text, flags=re.DOTALL)

    # Italic: *text* -> text
    text = re.sub(r"(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)", r"\1", text)

    # Inline code: `text` -> text
    text = re.sub(r"`([^`]*)`", r"\1", text)

    # Markdown headings: ### Heading -> Heading
    text = re.sub(r"^\s*#{1,6}\s*", "", text, flags=re.MULTILINE)

    # Bullet points: - item / * item / + item -> item
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)

    # Numbered lists: 1. item -> item
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)

    # Markdown links: [text](url) -> text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)

    # Remove remaining standalone asterisks
    text = text.replace("*", "")

    # Remove underscores commonly used for Markdown emphasis
    text = re.sub(r"(?<!\w)_([^_]+)_(?!\w)", r"\1", text)

    # Collapse excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)

    return text.strip()


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/debug")
def debug():
    return {
        "status": "ok",
        "pipeline_loaded": pipeline is not None,
        "pipeline_error": pipeline_error,
    }

@app.post("/tts")
def tts(request: TTSRequest):
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text is required",
            )

        speech_text = clean_for_speech(request.text)

        if not speech_text:
            raise HTTPException(
                status_code=400,
                detail="No speakable text found",
            )

        print("Kokoro TTS:")
        print(speech_text)

        pipeline = get_pipeline()

        generator = pipeline(
            speech_text,
            voice="bm_lewis",
        )

        chunks = []

        for _, _, audio in generator:
            chunks.append(audio)

        if not chunks:
            raise RuntimeError("Kokoro produced no audio")

        audio = np.concatenate(chunks)

        buffer = BytesIO()

        sf.write(
            buffer,
            audio,
            24000,
            format="WAV",
        )

        audio_bytes = buffer.getvalue()

        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Length": str(len(audio_bytes)),
            },
        )

    except HTTPException:
        raise

    except Exception as error:
        print("========== KOKORO TTS ERROR ==========")
        print(error)
        print("======================================")

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8880)),
    )