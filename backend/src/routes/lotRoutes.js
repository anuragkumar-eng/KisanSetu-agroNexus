const express = require('express');
const router = express.Router();
const {
  createLot,
  getMarketplaceLots,
  getMyLots,
  getLotById,
  updateLot,
  deleteLot
} = require('../controllers/lotController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All lot routes require authentication

// /api/lots
router.route('/')
  .get(getMarketplaceLots)
  .post(authorize('farmer'), createLot);

// /api/lots/my
router.route('/my')
  .get(authorize('farmer'), getMyLots);

// /api/lots/:id
router.route('/:id')
  .get(getLotById)
  .patch(authorize('farmer'), updateLot)
  .delete(authorize('farmer'), deleteLot);

module.exports = router;
