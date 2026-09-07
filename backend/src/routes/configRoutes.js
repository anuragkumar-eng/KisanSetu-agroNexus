const express = require('express');
const router = express.Router();
const { getCrops, getQualityGrades } = require('../controllers/configController');

router.get('/crops', getCrops);
router.get('/quality-grades', getQualityGrades);

module.exports = router;
