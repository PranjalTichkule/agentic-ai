import { Router } from "express";
import agentService from "../agents/agentService";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {   userId, conversationId, message } = req.body;

    if (!userId || !conversationId || !message) {
      return res.status(400).json({
        message: "conversationId and message are required",
      });
    }

    const result = await agentService.processMessage(
      userId,
      conversationId,
      message
    );

    return res.json(result);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Agent failed",
      error: error.message,
    });
  }
});

export default router;