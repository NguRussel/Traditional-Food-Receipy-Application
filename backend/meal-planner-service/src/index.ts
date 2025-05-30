import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import mealPlannerRoutes from "./routes/mealPlanner.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4009;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mealplanner";

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "Meal Planner Service is healthy" });
});

app.use("/api/meal-plans", mealPlannerRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Meal Planner Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });