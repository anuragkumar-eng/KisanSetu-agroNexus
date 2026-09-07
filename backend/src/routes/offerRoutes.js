const express = require('express');
const router = express.Router();
const {
  createOffer,
  getFarmerOffers,
  getBuyerOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  counterOffer
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All offer routes require authentication

router.route('/')
  .post(authorize('buyer'), createOffer);

router.route('/farmer')
  .get(authorize('farmer', 'admin'), getFarmerOffers);

router.route('/buyer')
  .get(authorize('buyer', 'admin'), getBuyerOffers);

router.route('/:id')
  .get(getOfferById);

router.route('/:id/accept')
  .patch(authorize('farmer'), acceptOffer);

router.route('/:id/reject')
  .patch(authorize('farmer'), rejectOffer);

router.route('/:id/counter')
  .patch(authorize('farmer'), counterOffer);

module.exports = router;
