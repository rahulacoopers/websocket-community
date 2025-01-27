const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const _ = require("lodash");

const app = express();

// Load self-signed certificate files
const privateKey = fs.readFileSync("privkey.pem", "utf8");
const certificate = fs.readFileSync("fullchain.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

const io = new Server(httpsServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity, adjust as needed
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("messageupdated", (message) => {
    console.log("mensagem recebida", message);

    // RecipientId
    const recipientId = _.get(message, "recipientId", 0);
    const senderId = _.get(message, "senderId", 0);
    // const message = _.get(message, "message", "");

    io.emit("messageupdated", { recipientId, senderId });
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected", reason);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

const PORT = process.env.PORT || 8080;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});
