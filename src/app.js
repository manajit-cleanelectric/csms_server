const express = require('express');
const cors = require('cors');
const chargepointRoutes = require('./routes/chargepoints');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/chargepoints', chargepointRoutes);

module.exports = app;
