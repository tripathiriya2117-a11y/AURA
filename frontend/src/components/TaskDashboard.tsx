import { useState, useEffect, useCallback } from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { Task } from "../types/task";
import {
  getTodayTasks,
  getUpcomingTasks,
  completeTask,
  deleteTask,
} from "../services/taskApi";

type Tab = "today" | "upcoming";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#e74c3c",
  medium: "#f39c12",
  low: "#2ecc71",
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (!task.dueAt) continue;
    const date = new Date(task.dueAt);
    const key = date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return groups;
}

function TaskCard({
  task,
  onComplete,
  onDelete,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "#999";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{task.title}</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityColor },
          ]}
        >
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      {task.description ? (
        <Text style={styles.cardDescription}>{task.description}</Text>
      ) : null}

      <View style={styles.cardMeta}>
        {task.dueAt ? (
          <Text style={styles.cardMetaText}>
            Due: {formatDate(task.dueAt)}
          </Text>
        ) : null}
        {task.reminderAt ? (
          <Text style={styles.cardMetaText}>
            Reminder: {formatDate(task.reminderAt)}
          </Text>
        ) : null}
        <Text style={styles.cardType}>{task.type}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete(task.id)}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TaskDashboard({ onRefresh }: { onRefresh: () => void }) {
  const [tab, setTab] = useState<Tab>("today");
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [today, upcoming] = await Promise.all([
        getTodayTasks(),
        getUpcomingTasks(),
      ]);
      setTodayTasks(today);
      setUpcomingTasks(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (id: string) => {
    try {
      await completeTask(id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  };

  const currentTasks = tab === "today" ? todayTasks : upcomingTasks;
  const grouped = tab === "upcoming" ? groupByDate(currentTasks) : null;

  const renderItem = ({ item }: { item: Task | [string, Task[]] }) => {
    if (Array.isArray(item)) {
      const [date, tasks] = item;
      return (
        <View style={styles.dateGroup}>
          <Text style={styles.dateGroupHeader}>{date}</Text>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </View>
      );
    }

    return (
      <TaskCard
        task={item}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    );
  };

  const dataSource = grouped
    ? (Object.entries(grouped) as [string, Task[]][])
    : currentTasks;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>AURA</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "today" && styles.tabActive]}
          onPress={() => setTab("today")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "today" && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "upcoming" && styles.tabActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "upcoming" && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : dataSource.length === 0 ? (
        <Text style={styles.emptyState}>
          {tab === "today"
            ? "No tasks due today."
            : "No upcoming tasks."}
        </Text>
      ) : (
        <FlatList
          data={dataSource}
          keyExtractor={(item, index) =>
            Array.isArray(item) ? item[0] : item.id
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    marginTop: 30,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  cardDescription: {
    color: "#555",
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  cardMetaText: {
    fontSize: 13,
    color: "#666",
  },
  cardType: {
    fontSize: 12,
    color: "#888",
    textTransform: "capitalize",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  completeButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dateGroup: {
    marginBottom: 15,
  },
  dateGroupHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
});
