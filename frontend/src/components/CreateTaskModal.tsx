import { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { TaskType, TaskPriority, CreateTaskInput } from "../types/task";
import { createTask } from "../services/taskApi";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const TASK_TYPES: { label: string; value: TaskType }[] = [
  { label: "Task", value: "task" },
  { label: "Deadline", value: "deadline" },
  { label: "Reminder", value: "reminder" },
];

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function CreateTaskModal({ visible, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueAt, setDueAt] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setType("task");
    setPriority("medium");
    setDueAt("");
    setReminderAt("");
    setError("");
  };

  const handleCreate = async () => {
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      priority,
      dueAt: dueAt.trim() || undefined,
      reminderAt: reminderAt.trim() || undefined,
    };

    setSaving(true);

    try {
      await createTask(input);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>New Task</Text>

          <ScrollView>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              style={styles.input}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional details"
              style={[styles.input, styles.multiline]}
              multiline
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {TASK_TYPES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    type === option.value && styles.chipActive,
                  ]}
                  onPress={() => setType(option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === option.value && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.row}>
              {PRIORITIES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    priority === option.value && styles.chipActive,
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priority === option.value && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Due date (optional)</Text>
            <TextInput
              value={dueAt}
              onChangeText={setDueAt}
              placeholder="YYYY-MM-DD or ISO timestamp"
              style={styles.input}
            />

            <Text style={styles.label}>Reminder (optional)</Text>
            <TextInput
              value={reminderAt}
              onChangeText={setReminderAt}
              placeholder="YYYY-MM-DD or ISO timestamp"
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <Button title="Cancel" onPress={handleClose} />
              <Button
                title={saving ? "Saving..." : "Create"}
                onPress={handleCreate}
                disabled={saving}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipText: {
    color: "#333",
  },
  chipTextActive: {
    color: "#fff",
  },
  error: {
    color: "red",
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
});
