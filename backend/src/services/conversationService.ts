import Message from "../models/Message";

async function getMessages(conversationId: string) {
  return await Message.find({
    conversationId,
  }).sort({ createdAt: 1 });
}

async function saveUserMessage(
  conversationId: string,
  content: string
) {
  return await Message.create({
    conversationId,
    role: "user",
    content,
  });
}

async function saveAssistantMessage(
  conversationId: string,
  content: string
) {
  return await Message.create({
    conversationId,
    role: "assistant",
    content,
  });
}

export default {
  getMessages,
  saveUserMessage,
  saveAssistantMessage,
};