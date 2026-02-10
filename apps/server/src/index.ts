import type { User } from "@repo/shared";

const mockUser: User = {
  id: "1",
  email: "alice@example.com",
  name: "Alice",
  createdAt: new Date("2025-01-01T00:00:00Z"),
};

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/user") {
      return Response.json(mockUser);
    }

    return new Response("Agent Swarm Playground API", { status: 200 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
