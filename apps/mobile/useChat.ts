import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatMessage, WSClientMessage, WSServerMessage } from "@repo/shared";

const WS_URL = "ws://localhost:3000/ws";

export function useChat(token: string | null, roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<{ id: string; name: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token || !roomId) return;

    setMessages([]);
    setCurrentRoom(null);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const authMsg: WSClientMessage = { type: "auth", token };
      ws.send(JSON.stringify(authMsg));
      // Join room after auth
      setTimeout(() => {
        const joinMsg: WSClientMessage = { type: "join_room", roomId };
        ws.send(JSON.stringify(joinMsg));
      }, 100);
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WSServerMessage;
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "room_joined") {
        setCurrentRoom({ id: data.roomId, name: data.roomName });
      } else if (data.type === "room_left") {
        setCurrentRoom(null);
        setMessages([]);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, roomId]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg: WSClientMessage = { type: "chat", text };
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { messages, connected, currentRoom, sendMessage };
}
