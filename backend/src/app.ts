import express from "express";
import cors from "cors";
import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import agentRoutes from "./routes/agentRoutes";
import memoryRoutes from "./routes/memoryRoutes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/memories", memoryRoutes);
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

export default app;