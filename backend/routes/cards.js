// Express router for card CRUD operations

const express = require('express');
const router = express.Router();

// Controller function imports
const {createCard, getCardById, getAllCards, updateCardPIN, deleteCard, lockCard, unlockCard } = require('../controllers/cardsController');

// Route definitions
router.post('/', createCard);                    // CREATE - Create new card with PIN
router.get('/', getAllCards);                    // READ ALL - Get all cards
router.get('/:idCard', getCardById);             // READ - Get card by ID
router.put('/:idCard/pin', updateCardPIN);       // UPDATE - Update card PIN
router.delete('/:idCard', deleteCard);           // DELETE - Delete card
router.post('/:idCard/lock', lockCard);          // LOCK - Lock card
router.post('/:idCard/unlock', unlockCard);      // UNLOCK - Unlock card

// Router export
module.exports = router;
