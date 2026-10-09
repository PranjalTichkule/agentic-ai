import express from "express";
import Conversation from "../models/Conversation";

const router = express.Router();

// Create a new conversation
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;

        const conversation = await Conversation.create({
            title,
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error("Create conversation error:", error);

        res.status(500).json({
            message: "Failed to create conversation",
            error: error instanceof Error ? error.message : error,
        });
    }
});

// Get all conversations
router.get("/", async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ createdAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch conversations",
            error,
        });
    }
});

export default router;