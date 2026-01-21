// Tämä tiedosto on Express-reititin log-resurssille

// Express ja router
const express = require('express');
const router = express.Router();

// Controller-funktioiden tuonti
const { getLogsByAccount } = require('../controllers/logController');

// Reittien määrittely
router.get('/:idAccount', getLogsByAccount); // READ - hakee tilin tapahtumalogit

// Routerin export
module.exports = router;
