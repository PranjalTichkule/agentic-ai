import express from "express";
import Message from "../models/Message";

const router = express.Router();

// Add a message to a conversation
router.post("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { role, content } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Create message error:", error);

    res.status(500).json({
      message: "Failed to create message",
      error: error instanceof Error ? error.message : error,
    });
  }
});

// Get messages for a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
      error: error instanceof Error ? error.message : error,
    });
  }
});

export default router;