const express = require('express');
const router = express.Router();
const {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement
} = require('../controllers/requirementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All requirement routes require authentication

router.route('/')
  .post(authorize('buyer'), createRequirement)
  .get(getRequirements); // logic handles role-based filtering inside controller

router.route('/:id')
  .get(getRequirementById)
  .patch(authorize('buyer'), updateRequirement)
  .delete(authorize('buyer'), deleteRequirement);

module.exports = router;
