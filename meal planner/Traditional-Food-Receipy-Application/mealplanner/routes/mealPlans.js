const express = require('express');
const router = express.Router();
const {
  createMealPlan,
  getMealPlans,
  updateMealPlan,
  deleteMealPlan
} = 

router.post('/', createMealPlan);
router.get('/:userId', getMealPlans);
router.put('/:id', updateMealPlan);
router.delete('/:id', deleteMealPlan);

module.exports = router;