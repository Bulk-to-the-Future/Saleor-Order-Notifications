import { createClient } from "graphql-ws";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) return socket.disconnect();

    try {
      // Ensure SALEOR_API_URL is defined
      if (!process.env.SALEOR_API_URL) {
        throw new Error("SALEOR_API_URL environment variable is not set");
      }

      // Manually construct Saleor headers
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Saleor-Api-Url": process.env.SALEOR_API_URL,
      };

      const client = createClient({
        url: process.env.SALEOR_API_URL.replace("http", "ws"),
        connectionParams: headers,
      });

      const result = await new Promise<{
        data?: { channels: { id: string }[] } | undefined;
      }>((resolve) => {
        const dispose = client.subscribe(
          { query: "{ channels { id } }" },
          {
            next: (value: { data?: { channels: { id: string }[] } }) => {
              resolve(value);
            },
            error: (error) => {
              console.error("GraphQL subscription error:", error);
              resolve({ data: undefined });
            },
            complete: () => {},
          }
        );

        setTimeout(() => dispose(), 0);
      });

      const { data } = result;
      const channels = data?.channels || [];

      channels.forEach((ch: { id: string }) => {
        socket.join(`channel:${ch.id}`);
      });
    } catch (e) {
      console.error("Socket connection error:", e);
      socket.disconnect();
    }
  });

  return io;
};

export { io };