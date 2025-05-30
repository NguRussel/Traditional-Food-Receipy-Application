import { Router } from "express";
import { createMealPlan, getMealPlans, getMealPlanById, updateMealPlan, deleteMealPlan } from "../controllers/mealPlanner.controller";

const router = Router();

router.post("/", createMealPlan);
router.get("/", getMealPlans);
router.get("/:id", getMealPlanById);
router.put("/:id", updateMealPlan);
router.delete("/:id", deleteMealPlan);

export default router;