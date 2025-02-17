const express = require("express");
const { WebPubSubServiceClient } = require("@azure/web-pubsub");
const _ = require("lodash");

const app = express();
const server = require("http").createServer(app);

// Azure Web PubSub configuration
const connectionString = "Endpoint=https://comm-pubsub-regular.webpubsub.azure.com;AccessKey=8AZnyDaPgicpvKrCzajByFRdZ7DYVWCWG0RxpemaZ1tCHhNipf7vJQQJ99BBAC5RqLJXJ3w3AAAAAWPSGX9b;Version=1.0;";
const hubName = "Hub";

// Initialize Web PubSub service client
const serviceClient = new WebPubSubServiceClient(connectionString, hubName);

// Endpoint for clients to get connection token
app.get("/negotiate", async (req, res) => {
  try {
    const token = await serviceClient.getClientAccessToken();
    res.json({ url: token.url });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Handle WebPubSub events
serviceClient.on("connected", (event) => {
  console.info("Client connected:", event.connectionId);
});

serviceClient.on("disconnected", (event) => {
  console.info("Client disconnected:", event.connectionId);
});

serviceClient.on("message", async (event) => {
  try {
    const message = JSON.parse(event.data);
    console.info("Message received:", message);

    const recipientId = _.get(message, "recipientId", 0);
    const senderId = _.get(message, "senderId", 0);

    // Broadcast message to all clients
    await serviceClient.sendToAll({
      recipientId,
      senderId,
    });
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});
