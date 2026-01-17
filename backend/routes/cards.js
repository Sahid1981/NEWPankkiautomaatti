/* Tämä tiedosto on Express-reititin cards -resurssille. Tämä määrittelee korttien CRUD-endpointit ja ohjaa HTTP-pyynnöt oikeisiin controller-
funktioihin. */

// Express ja router
const express = require('express');
const router = express.Router();

// Controller-funktioiden tuonti
const {
    getCardById,
    createCard,
    updateCard,
    deleteCard,
} = require('../controllers/cardsController');

// CRUD-reitit
router.get('/:idCard', getCardById); // READ - hae kortti
router.post('/', createCard); // CREATE - luo kortti
router.put('/:idCard', updateCard); // UPDATE - päivitä kortti
router.delete('/:idCard', deleteCard); // DELETE - poista kortti

// Routerin export
module.exports = router;
