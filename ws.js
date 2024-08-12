import { UserRespository } from "@/respositories/index.js";
import { WebSocketServer } from "ws";
import "dotenv/config";
const server = new WebSocketServer({
  port: process.env.WEBSOCKET_PORT,
});

const clients = {};

server.on("connection", async (ws, req) => {
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const uid = req.headers["sec-websocket-protocol"];
  const liveId = urlParams.get("liveId");
  let user;

  try {
    user = await UserRespository.getOneById(uid);
  } catch (error) {
    ws.close();
    return;
  }

  if (!liveId && !user) {
    ws.close();
    return;
  }

  if (!clients[liveId]) {
    clients[liveId] = [];
  }
  clients[liveId].push(ws);

  ws.on("message", (message) => {
    if (clients[liveId]) {
      clients[liveId].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              user: user.displayName,
              avatar: user.avatar,
              message: message,
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    clients[liveId] = clients[liveId].filter((client) => client !== ws);
    if (clients[liveId].length === 0) {
      delete clients[liveId];
    }
  });
});

console.log(
  `WebSocket server is running on ws://localhost:${process.env.WEBSOCKET_PORT}`
);
