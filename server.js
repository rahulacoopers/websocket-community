const express = require("express");
const { Server } = require("socket.io");
const _ = require("lodash");

const app = express();
const server = require("http").createServer(app);

// Remove HTTPS specific code since Azure handles SSL
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.info("a user connected");

  socket.on("messageupdated", (message) => {
    console.info("mensagem recebida", message);
    const recipientId = _.get(message, "recipientId", 0);
    const senderId = _.get(message, "senderId", 0);
    io.emit("messageupdated", { recipientId, senderId });
  });

  socket.on("disconnect", (reason) => {
    console.info("user disconnected", reason);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});
