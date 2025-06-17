const express = require('express');
const { getAllChargePoints, getChargePoint, sendCommand } = require('../controllers/chargepointController');

const router = express.Router();

router.get('/', getAllChargePoints);
router.get('/:id', getChargePoint);
router.post('/:id/commands/:command', sendCommand);

module.exports = router;
