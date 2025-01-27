const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const _ = require("lodash");
const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");

const app = express();

// Load self-signed certificate files
const privateKey = fs.readFileSync("privkey.pem", "utf8");
const certificate = fs.readFileSync("fullchain.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

const io = new Server(httpsServer, {
  cors: {
    origin: "*",
  },
});

// Add Azure Web PubSub configuration
const webPubSubConnectionString = "YOUR_AZURE_WEB_PUBSUB_CONNECTION_STRING";
const hub = "YOUR_HUB_NAME";

// Apply Azure Web PubSub middleware
useAzureSocketIO(io, {
  connectionString: webPubSubConnectionString,
  hub: hub,
}).catch((err) => {
  console.error("Failed to connect to Azure Web PubSub:", err);
});

// Rest of your Socket.IO logic remains the same
io.on("connection", (socket) => {
  console.log("a user connected");
  // ... rest of your event handlers
});

const PORT = process.env.PORT || 8080;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});
