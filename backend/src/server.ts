import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch {
    console.error("Server startup failed");
    process.exit(1);
  }
};

startServer();