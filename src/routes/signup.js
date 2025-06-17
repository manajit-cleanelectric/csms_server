const express = require('express');
const { signupUser } = require('../controllers/signupController');

const router = express.Router();

// Route to handle user signup
router.post('/signup', signupUser);

// Export the router to be used in the main app
module.exports = router;