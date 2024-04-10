import express, { Request, Response, NextFunction } from "express";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import  userRoute  from "./routes/userRoute";
import postRoute from "./routes/postRoute";
import followRoute from "./routes/followRoute";
import commentAndLikeRoute from "./routes/commentandLikeRoute";


// Initializing Firebase Cloud Messaging Service
const FCM = require('fcm-node')
const serverKey = process.env.FCM_KEY
const fcmAgent = new FCM(serverKey);

const app = express();
const port = process.env.PORT || 3001;
const uri:any = process.env.MONGO_DB;

// Establishing mongoose connection
mongoose
  .connect(uri)
  .then(() => console.log(`Connected to Mongo Database`))
  .catch((err) =>
    console.log(`Failed to establish connection to Mongo Database, ${err}`)
  );

// App Middlewares
app.use(express.json());
app.use(cors());

// Default Api Route
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("<Div>Welcome to KadMedia Backend</div>");
});

// Initiating Real-time Notifications connection using Websockets
const server = http.createServer(app);
const io = new SocketServer(server);

io.on("connection", (socket) => {
  console.log("A user is connected");
});


// Middleware to pass socket io to the controller
const notificationInstance = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as any).socketIo = io;
  (req as any).fcmAdmin = fcmAgent;
  next();
};

// Apis
app.use("/api/user", userRoute);
app.use("/api/post", notificationInstance, postRoute);
app.use("/api/follow", notificationInstance, followRoute);
app.use("/api/comment", notificationInstance, commentAndLikeRoute);
app.use("/api/like", notificationInstance, commentAndLikeRoute);

// Establishing server connection
var serverInstance: any
try {
   serverInstance = server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error("Failed to connect to server:", error);
}


//Shutting down the server
process.on("SIGINT", () => {
  console.log("Server is shutting down");
  serverInstance.close(() => {
    console.log("Server is closed");
    process.exit(0);
  });
});
