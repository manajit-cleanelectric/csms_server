const express = require('express');
const { getAllChargePoints, getPendingRequests, startcharging, stopcharging } = require('../controllers/chargepointController');

const router = express.Router();

router.get('/chargepoints', (req, res) => {
  const chargePoints = getAllChargePoints();
  return res.json(chargePoints);
});
router.get('/pendingrequests',  (req, res) => {
  const pendingRequests = getPendingRequests();
  return res.json(pendingRequests);
});
router.post('/chargepoints/:id/startcharging', (req, res) => {
  const chargePointId = req.params.id;
  const result = startcharging(chargePointId);
  return res.json(result);
}
);
router.post('/chargepoints/:id/stopcharging', (req, res) => {
  const chargePointId = req.params.id;
  const result = stopcharging(chargePointId);
  return res.json(result);
});

module.exports = router;
