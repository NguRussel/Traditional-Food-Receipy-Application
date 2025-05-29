const MealPlan = require

// Create a new meal plan
exports.createMealPlan = async (req, res) => {
  try {
    const mealPlan = new MealPlan(req.body);
    await mealPlan.save();
    res.status(201).json(mealPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all meal plans for a user
exports.getMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.params.userId });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a meal plan
exports.updateMealPlan = async (req, res) => {
  try {
    const updated = await MealPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a meal plan
exports.deleteMealPlan = async (req, res) => {
  try {
    await MealPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};