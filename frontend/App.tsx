import { useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskDashboard from "./src/components/TaskDashboard";
import ChatScreen from "./src/components/ChatScreen";
import CreateTaskModal from "./src/components/CreateTaskModal";

type Screen = "dashboard" | "chat";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen("dashboard")}>
          <Text
            style={[
              styles.headerTitle,
              screen === "dashboard" && styles.headerTitleActive,
            ]}
          >
            AURA
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTabs}>
          <TouchableOpacity
            style={styles.headerTab}
            onPress={() => setScreen("dashboard")}
          >
            <Text
              style={[
                styles.headerTabText,
                screen === "dashboard" && styles.headerTabTextActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerTab}
            onPress={() => setScreen("chat")}
          >
            <Text
              style={[
                styles.headerTabText,
                screen === "chat" && styles.headerTabTextActive,
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {screen === "dashboard" && (
        <View style={styles.screen}>
          <TaskDashboard key={refreshKey} onRefresh={handleRefresh} />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowCreateTask(true)}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === "chat" && <ChatScreen />}

      <CreateTaskModal
        visible={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreated={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  headerTitleActive: {
    color: "#000",
  },
  headerTabs: {
    flexDirection: "row",
  },
  headerTab: {
    marginRight: 20,
    paddingBottom: 6,
  },
  headerTabText: {
    fontSize: 15,
    color: "#888",
  },
  headerTabTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  screen: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },
});
