import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { User, Room } from "@repo/shared";
import { login, register, fetchRooms, createRoom } from "./api";
import { ChatScreen } from "./ChatScreen";

type Screen = "login" | "register" | "home" | "rooms" | "chat";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  async function handleLogin() {
    setError("");
    try {
      const res = await login(email, password);
      setToken(res.token);
      setUser(res.user);
      setScreen("home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  }

  async function handleRegister() {
    setError("");
    try {
      const res = await register(email, password, name);
      setToken(res.token);
      setUser(res.user);
      setScreen("home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setRooms([]);
    setSelectedRoom(null);
    setScreen("login");
  }

  async function loadRooms() {
    if (!token) return;
    try {
      const list = await fetchRooms(token);
      setRooms(list);
      setScreen("rooms");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rooms");
    }
  }

  async function handleCreateRoom() {
    if (!token || !newRoomName.trim()) return;
    try {
      const room = await createRoom(token, newRoomName.trim());
      setRooms((prev) => [...prev, room]);
      setNewRoomName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    }
  }

  if (token && user && screen === "chat" && selectedRoom) {
    return (
      <ChatScreen
        token={token}
        userName={user.name}
        roomId={selectedRoom.id}
        onBack={() => setScreen("rooms")}
      />
    );
  }

  if (token && user && screen === "rooms") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chat Rooms</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => {
                setSelectedRoom(item);
                setScreen("chat");
              }}
            >
              <Text style={styles.roomName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.roomList}
        />
        <View style={styles.createRoomRow}>
          <TextInput
            style={styles.createRoomInput}
            placeholder="New room name"
            value={newRoomName}
            onChangeText={setNewRoomName}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setScreen("home")}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (token && user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.name}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <TouchableOpacity style={styles.button} onPress={loadRooms}>
          <Text style={styles.buttonText}>Chat Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (screen === "register") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setError(""); setScreen("login"); }}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { setError(""); setScreen("register"); }}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#007AFF",
    fontSize: 14,
  },
  error: {
    color: "#FF3B30",
    marginBottom: 12,
    textAlign: "center",
  },
  roomList: {
    width: "100%",
    maxHeight: 300,
    marginBottom: 16,
  },
  roomItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  roomName: {
    fontSize: 18,
  },
  createRoomRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  createRoomInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
