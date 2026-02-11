import { useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ChatMessage } from "@repo/shared";
import { useChat } from "./useChat";

interface Props {
  token: string;
  userName: string;
  roomId: string;
  onBack: () => void;
}

export function ChatScreen({ token, userName, roomId, onBack }: Props) {
  const { messages, connected, currentRoom, sendMessage } = useChat(token, roomId);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText("");
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isMe = item.userName === userName;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.userName}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentRoom?.name ?? "Chat"}</Text>
        <Text style={[styles.status, connected ? styles.online : styles.offline]}>
          {connected ? "Online" : "Offline"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { color: "#007AFF", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  status: { fontSize: 12 },
  online: { color: "#34C759" },
  offline: { color: "#FF3B30" },
  messageList: { flex: 1, paddingHorizontal: 16 },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#E9E9EB",
    alignSelf: "flex-start",
  },
  senderName: { fontSize: 12, color: "#666", marginBottom: 2 },
  messageText: { fontSize: 16 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
