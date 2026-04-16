import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// 🔍 Debug (check env loaded)
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

const startServer = async () => {
  try {
    // ✅ DB connect
    await connectDB();
    console.log("MongoDB Connected ✅");

    // ✅ Root route (IMPORTANT for Render)
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "🚀 Backend is running successfully",
      });
    });

    // ✅ Server start
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });

  } catch (error) {
    console.error("Failed to start server ❌:", error.message);
    process.exit(1);
  }
};

startServer();