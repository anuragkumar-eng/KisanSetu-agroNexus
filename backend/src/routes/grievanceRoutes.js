const express = require('express');
const router = express.Router();
const { createGrievance, getGrievances, getGrievanceById } = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createGrievance);
router.get('/', getGrievances);
router.get('/:id', getGrievanceById);

module.exports = router;
