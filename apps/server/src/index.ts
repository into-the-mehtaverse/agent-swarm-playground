import "./db";
import { db } from "./db";
import type { AuthRequest, AuthResponse, ApiError, Room, ChatMessage, WSClientMessage, WSServerMessage } from "@repo/shared";
import { signToken, verifyToken } from "./auth";
import { register, authenticate } from "./users";
import { addMessage, getRecentMessages } from "./messages";

const listRooms = db.prepare<{ id: string; name: string; created_at: number }, []>("SELECT id, name, created_at FROM rooms ORDER BY created_at ASC");
const getRoom = db.prepare<{ id: string; name: string; created_at: number }, [string]>("SELECT id, name, created_at FROM rooms WHERE id = ?");
const insertRoom = db.prepare("INSERT INTO rooms (id, name, created_at) VALUES (?, ?, ?)");

function errorResponse(message: string, status: number): Response {
  return Response.json({ message } satisfies ApiError, { status });
}

interface WSData {
  userId?: string;
  userName?: string;
  authenticated: boolean;
  currentRoomId?: string;
}

const connections = new Map<string, import("bun").ServerWebSocket<WSData>>();

function broadcast(msg: WSServerMessage, roomId: string) {
  const data = JSON.stringify(msg);
  for (const ws of connections.values()) {
    if (ws.data.currentRoomId === roomId) {
      ws.send(data);
    }
  }
}

const server = Bun.serve<WSData>({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/auth/register" && req.method === "POST") {
      try {
        const body = (await req.json()) as AuthRequest & { name?: string };
        if (!body.email || !body.password) {
          return errorResponse("Email and password are required", 400);
        }
        const user = await register(body.email, body.password, body.name ?? "");
        const token = await signToken(user);
        return Response.json({ token, user } satisfies AuthResponse);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Registration failed";
        return errorResponse(msg, 400);
      }
    }

    if (url.pathname === "/auth/login" && req.method === "POST") {
      try {
        const body = (await req.json()) as AuthRequest;
        if (!body.email || !body.password) {
          return errorResponse("Email and password are required", 400);
        }
        const user = await authenticate(body.email, body.password);
        const token = await signToken(user);
        return Response.json({ token, user } satisfies AuthResponse);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Authentication failed";
        return errorResponse(msg, 401);
      }
    }

    if (url.pathname === "/user" && req.method === "GET") {
      try {
        const auth = req.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) {
          return errorResponse("Missing or invalid Authorization header", 401);
        }
        const token = auth.slice(7);
        const user = await verifyToken(token);
        return Response.json(user);
      } catch {
        return errorResponse("Invalid or expired token", 401);
      }
    }

    if (url.pathname === "/rooms" && req.method === "GET") {
      const rooms = listRooms.all().map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
      return Response.json(rooms);
    }

    if (url.pathname === "/rooms" && req.method === "POST") {
      try {
        const body = (await req.json()) as { name?: string };
        if (!body.name?.trim()) {
          return errorResponse("Room name is required", 400);
        }
        const id = crypto.randomUUID();
        const now = Date.now();
        insertRoom.run(id, body.name.trim(), now);
        return Response.json({ id, name: body.name.trim(), createdAt: now } satisfies Room);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create room";
        return errorResponse(msg, 400);
      }
    }

    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req, { data: { authenticated: false } as WSData });
      if (!upgraded) {
        return errorResponse("WebSocket upgrade failed", 400);
      }
      return undefined as unknown as Response;
    }

    return new Response("Agent Swarm Playground API", { status: 200 });
  },
  websocket: {
    async message(ws: import("bun").ServerWebSocket<WSData>, raw: string | Buffer) {
      const text = typeof raw === "string" ? raw : raw.toString();
      let parsed: WSClientMessage;
      try {
        parsed = JSON.parse(text) as WSClientMessage;
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" } satisfies WSServerMessage));
        return;
      }

      if (parsed.type === "auth") {
        try {
          const user = await verifyToken(parsed.token);
          ws.data.userId = user.id;
          ws.data.userName = user.name;
          ws.data.authenticated = true;
          connections.set(user.id, ws);
        } catch {
          ws.send(JSON.stringify({ type: "error", message: "Invalid token" } satisfies WSServerMessage));
        }
        return;
      }

      if (parsed.type === "join_room") {
        if (!ws.data.authenticated) {
          ws.send(JSON.stringify({ type: "error", message: "Not authenticated" } satisfies WSServerMessage));
          return;
        }
        const room = getRoom.get(parsed.roomId);
        if (!room) {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" } satisfies WSServerMessage));
          return;
        }
        ws.data.currentRoomId = parsed.roomId;
        // Send room message history
        for (const msg of getRecentMessages(parsed.roomId)) {
          ws.send(JSON.stringify({ type: "message", message: msg } satisfies WSServerMessage));
        }
        ws.send(JSON.stringify({ type: "room_joined", roomId: room.id, roomName: room.name } satisfies WSServerMessage));
        return;
      }

      if (parsed.type === "leave_room") {
        ws.data.currentRoomId = undefined;
        ws.send(JSON.stringify({ type: "room_left" } satisfies WSServerMessage));
        return;
      }

      if (parsed.type === "chat") {
        if (!ws.data.authenticated || !ws.data.userId) {
          ws.send(JSON.stringify({ type: "error", message: "Not authenticated" } satisfies WSServerMessage));
          return;
        }
        if (!ws.data.currentRoomId) {
          ws.send(JSON.stringify({ type: "error", message: "Not in a room" } satisfies WSServerMessage));
          return;
        }
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          userId: ws.data.userId,
          userName: ws.data.userName!,
          text: parsed.text,
          timestamp: Date.now(),
          roomId: ws.data.currentRoomId,
        };
        addMessage(message);
        broadcast({ type: "message", message }, ws.data.currentRoomId);
      }
    },
    close(ws: import("bun").ServerWebSocket<WSData>) {
      if (ws.data.userId) {
        connections.delete(ws.data.userId);
      }
    },
  },
});

console.log(`Server running at http://localhost:${server.port}`);
