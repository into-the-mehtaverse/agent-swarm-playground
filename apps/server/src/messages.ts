import type { ChatMessage } from "@repo/shared";
import { db } from "./db";

const MAX_MESSAGES = 50;

interface MessageRow {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
  room_id: string | null;
}

const insertMessage = db.prepare(
  "INSERT INTO messages (id, user_id, user_name, text, timestamp, room_id) VALUES (?, ?, ?, ?, ?, ?)"
);
const recentMessages = db.prepare<MessageRow, [number]>(
  "SELECT id, user_id, user_name, text, timestamp FROM messages ORDER BY timestamp DESC LIMIT ?"
);
const recentRoomMessages = db.prepare<MessageRow, [string, number]>(
  "SELECT id, user_id, user_name, text, timestamp, room_id FROM messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT ?"
);

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    text: row.text,
    timestamp: row.timestamp,
    roomId: row.room_id!,
  };
}

export function addMessage(message: ChatMessage): void {
  insertMessage.run(message.id, message.userId, message.userName, message.text, message.timestamp, message.roomId);
}

export function getRecentMessages(roomId: string): ChatMessage[] {
  const rows = recentRoomMessages.all(roomId, MAX_MESSAGES);
  return rows.reverse().map(toMessage);
}
