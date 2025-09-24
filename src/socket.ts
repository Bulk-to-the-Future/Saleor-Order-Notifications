import { Server } from "socket.io";
import { createClient } from "graphql-ws";
import { getSaleorHeaders } from "@saleor/app-sdk/handlers/next";

let io: Server;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) return socket.disconnect();

    try {
      const headers = getSaleorHeaders({ authToken: token });
      const client = createClient({ url: process.env.SALEOR_API_URL.replace("http", "ws"), connectionParams: { ...headers } });
      const { data } = await new Promise((resolve) => {
        client.subscribe(
          { query: "{ channels { id } }" },
          { next: resolve, error: () => resolve(null), complete: () => {} }
        );
      });

      const channels = data?.channels || [];
      channels.forEach((ch) => socket.join(`channel:${ch.id}`));
    } catch (e) {
      socket.disconnect();
    }
  });

  return io;
};

export { io };
