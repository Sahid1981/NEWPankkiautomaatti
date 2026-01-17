// Tämä tiedosto on Express-reititin users-resurssille. Se yhdistää HTTP-endpointit -> usersControllerin funktioihin

// Express ja router
const express = require('express');
const router = express.Router();

// Controller-funktioiden tuonti
const { getUserById, createUser, updateUser, deleteUser } = require('../controllers/usersController');

// Reittien määrittely
router.get('/:idUser', getUserById); // READ - GET
router.post('/', createUser); // CREATE - POST
router.put('/:idUser', updateUser); // UPDATE - PUT
router.delete('/:idUser', deleteUser); // DELETE - DELETE

// Routerin export
module.exports = router;
