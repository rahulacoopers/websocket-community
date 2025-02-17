const express = require("express");
const { Server } = require("socket.io");
const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");
const _ = require("lodash");

const app = express();
const server = require("http").createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

// Azure Web PubSub configuration
const connectionString = "Endpoint=https://comm-pubsub-socket.webpubsub.azure.com;AccessKey=xNKGQNuKF+kVU66EvdGCvl3ntdWsxF/21rPbXoWl7e8=;Version=1.0;";
const hubName = "Hub";

// Setup Azure Web PubSub integration
async function setupAzureWebPubSub() {
  try {
    await useAzureSocketIO(io, {
      hub: hubName,
      connectionString: connectionString,
    });
    console.info("Azure Web PubSub integration successful");
  } catch (error) {
    console.error("Azure Web PubSub integration failed:", error);
  }
}

// Initialize Azure Web PubSub
setupAzureWebPubSub();

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.info("a user connected");

  socket.on("messageupdated", (message) => {
    console.info("message received", message);
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
