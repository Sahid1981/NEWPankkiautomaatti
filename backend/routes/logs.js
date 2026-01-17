// Express reititin logsille. Kytkee HTTP-endpointit logsControllerin CRUD-funktioihin

// Importit
const express = require('express');
const router = express.Router();

// Tuo CRUD-funktiot logsControllerista
const {
    getLogById,
    getAllLogs,
    createLog,
    updateLog,
    deleteLog,
} = require('../controllers/logsController');

// Reitit
router.get('/', getAllLogs); // READ - hakee kaikki logit
router.get('/:idLog', getLogById); // READ - hakee yhden login id:n perusteella
router.post('/', createLog); // CREATE - luo uuden log-rivin
router.put('/:idLog', updateLog); // UPDATE - päivittää olemassa olevan login
router.delete('/:idLog', deleteLog); // DELETE - poistaa login id:n perusteella

// Export
module.exports = router;
