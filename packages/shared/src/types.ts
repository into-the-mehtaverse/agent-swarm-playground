export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  roomId: string;
}

export type WSClientMessage =
  | { type: "auth"; token: string }
  | { type: "chat"; text: string }
  | { type: "join_room"; roomId: string }
  | { type: "leave_room" };

export type WSServerMessage =
  | { type: "message"; message: ChatMessage }
  | { type: "error"; message: string }
  | { type: "room_joined"; roomId: string; roomName: string }
  | { type: "room_left" };
