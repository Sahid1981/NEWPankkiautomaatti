const express = require('express');
const router = express.Router();

const {
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
} = require('../controllers/accountsController');

router.get('/:idAccount', getAccountById);
router.post('/', createAccount);
router.put('/:idAccount', updateAccount);
router.delete('/:idAccount', deleteAccount);

module.exports = router;
