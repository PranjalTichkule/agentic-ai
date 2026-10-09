import express from "express";
import memoryService from "../services/memoryService";

const router = express.Router();

/*
  Save or update a memory
  POST /api/memories
*/
router.post("/", async (req, res) => {
  try {
    const { userId, key, value } = req.body;

    if (!userId || !key || !value) {
      return res.status(400).json({
        message: "userId, key and value are required",
      });
    }

    const memory = await memoryService.saveMemory(
      userId,
      key,
      value
    );

    res.status(201).json(memory);
  } catch (error) {
    console.error("Save memory error:", error);

    res.status(500).json({
      message: "Failed to save memory",
      error:
        error instanceof Error
          ? error.message
          : error,
    });
  }
});

/*
  Get all memories for a user
  GET /api/memories/:userId
*/
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const memories =
      await memoryService.getAllMemories(userId);

    res.json(memories);
  } catch (error) {
    console.error("Get memories error:", error);

    res.status(500).json({
      message: "Failed to fetch memories",
      error:
        error instanceof Error
          ? error.message
          : error,
    });
  }
});

/*
  Get one specific memory
  GET /api/memories/:userId/:key
*/
router.get(
  "/:userId/:key",
  async (req, res) => {
    try {
      const { userId, key } = req.params;

      const memory =
        await memoryService.getMemory(
          userId,
          key
        );

      if (!memory) {
        return res.status(404).json({
          message: "Memory not found",
        });
      }

      res.json(memory);
    } catch (error) {
      console.error(
        "Get memory error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch memory",
        error:
          error instanceof Error
            ? error.message
            : error,
      });
    }
  }
);

/*
  Delete a memory
  DELETE /api/memories/:userId/:key
*/
router.delete(
  "/:userId/:key",
  async (req, res) => {
    try {
      const { userId, key } = req.params;

      const memory =
        await memoryService.deleteMemory(
          userId,
          key
        );

      if (!memory) {
        return res.status(404).json({
          message: "Memory not found",
        });
      }

      res.json({
        message: "Memory deleted",
      });
    } catch (error) {
      console.error(
        "Delete memory error:",
        error
      );

      res.status(500).json({
        message: "Failed to delete memory",
        error:
          error instanceof Error
            ? error.message
            : error,
      });
    }
  }
);

export default router;