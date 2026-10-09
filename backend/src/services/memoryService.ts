import Memory from "../models/Memory";

async function saveMemory(
  userId: string,
  key: string,
  value: string
) {
  return await Memory.findOneAndUpdate(
    {
      userId,
      key,
    },
    {
      userId,
      key,
      value,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function getMemory(
  userId: string,
  key: string
) {
  return await Memory.findOne({
    userId,
    key,
  });
}

async function getAllMemories(
  userId: string
) {
  return await Memory.find({
    userId,
  }).sort({
    updatedAt: -1,
  });
}

async function deleteMemory(
  userId: string,
  key: string
) {
  return await Memory.findOneAndDelete({
    userId,
    key,
  });
}

export default {
  saveMemory,
  getMemory,
  getAllMemories,
  deleteMemory,
};