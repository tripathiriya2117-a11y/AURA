import { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function App() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const sendMessage = async () => {
    if (!message.trim() || status === "sending") {
      return;
    }

    const text = message.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setStatus("sending");

    try {
      const response = await fetch(
        "http://10.97.213.135:3000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Server error: ${response.status}`
        );
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setStatus("success");
    } catch (error) {
      console.error("Fetch failed:", error);

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Couldn't reach Aura's brain. Try again.",
      };

      setMessages((previous) => [...previous, errorMessage]);
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Aura</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.role === "user"
                ? styles.userMessage
                : styles.assistantMessage,
            ]}
          >
            <Text style={styles.role}>
              {item.role === "user" ? "You" : "Aura"}
            </Text>

            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />

      {status === "sending" && (
        <Text style={styles.thinking}>Aura is thinking...</Text>
      )}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Talk to Aura..."
        style={styles.input}
      />

      <Button
        title={status === "sending" ? "Thinking..." : "Send"}
        onPress={sendMessage}
        disabled={status === "sending" || !message.trim()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  message: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },

  userMessage: {
    alignSelf: "flex-end",
    maxWidth: "80%",
  },

  assistantMessage: {
    alignSelf: "flex-start",
    maxWidth: "80%",
  },

  role: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 16,
  },

  thinking: {
    marginBottom: 8,
    fontStyle: "italic",
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});