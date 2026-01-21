// This file is cardsController, fully procedural version with bcrypt for PIN

// Imports
const AppError = require('../middleware/AppError');
const pool = require('../db');
const bcrypt = require('bcrypt');
const config = require('../config');

// Map database row to API format
function mapCardRow(row) {
    return {
        idCard: row.idcard,
        idUser: row.iduser,
        isLocked: Boolean(row.is_locked)
    };
}

// Error mapper for card procedures
function mapProcedureSignalToHttp(err) {
    const raw = err?.sqlMessage || err?.message || '';
    const msg = raw.toLowerCase();

    if (msg.includes('card not found')) return new AppError('Card not found', 404);
    if (msg.includes('card already exists')) return new AppError('Card already exists', 409);
    if (msg.includes('user not found')) return new AppError('User not found', 404);
    
    if (msg.includes('cannot be null') ||
        msg.includes('cannot be null or empty') ||
        msg.includes('must be greater than') ||
        msg.includes('invalid')) {
        return new AppError(raw, 400);
    }
    
    if (err?.code === 'ER_SIGNAL_EXCEPTION') return new AppError(raw || 'Bad Request', 400);
    
    return null;
}

// CREATE: Create a new card with hashed PIN
async function createCard(req, res, next) {
    try {
        const { idCard, idUser, cardPIN } = req.body;
        
        if (!idCard || !idUser || !cardPIN) {
            throw new AppError('idCard, idUser and cardPIN are required', 400);
        }

        // Add pepper to PIN and hash using bcrypt
        const pepperedPIN = cardPIN + config.pinPepper;
        const hashedPIN = await bcrypt.hash(pepperedPIN, 10);
        
        // Call stored procedure with hashed PIN
        await pool.execute('CALL sp_create_card(?, ?, ?)', [idCard, idUser, hashedPIN]);
        
        res.status(201).json({
            idCard,
            idUser,
            isLocked: false
        });
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// READ: Get card by ID 
async function getCardById(req, res, next) {
    try {
        const idCard = req.params?.idCard;
        if (!idCard) throw new AppError('Card ID is required', 400);

        const [results] = await pool.execute('CALL sp_read_card_info(?)', [idCard]);
        const rows = results[0] || [];

        if (!rows.length) throw new AppError('Card not found', 404);

        res.status(200).json(mapCardRow(rows[0]));
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// READ ALL:Get all cards 
async function getAllCards(req, res, next) {
    try {
        const [results] = await pool.execute('CALL sp_read_all_cards()');
        const rows = results[0] || [];

        res.status(200).json(rows.map(mapCardRow));
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// UPDATE - Update card PIN 
async function updateCardPIN(req, res, next) {
    try {
        const idCard = req.params?.idCard;
        const { cardPIN } = req.body;
        
        if (!idCard) throw new AppError('Card ID is required', 400);
        if (!cardPIN) throw new AppError('cardPIN is required', 400);

        // Add pepper to PIN and hash the new PIN
        const pepperedPIN = cardPIN + config.pinPepper;
        const hashedPIN = await bcrypt.hash(pepperedPIN, 10);
        
        await pool.execute('CALL sp_update_card_pin(?, ?)', [idCard, hashedPIN]);
        
        res.status(200).json({ message: 'Card PIN updated successfully' });
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// DELETE - Delete card 
async function deleteCard(req, res, next) {
    try {
        const idCard = req.params?.idCard;
        if (!idCard) throw new AppError('Card ID is required', 400);

        await pool.execute('CALL sp_delete_card(?)', [idCard]);
        
        res.status(204).send();
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// LOCK - Lock a card 
async function lockCard(req, res, next) {
    try {
        const idCard = req.params?.idCard;
        if (!idCard) throw new AppError('Card ID is required', 400);

        await pool.execute('CALL sp_card_lock(?)', [idCard]);
        
        res.status(200).json({ message: 'Card locked successfully' });
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

// UNLOCK - Unlock a card 
async function unlockCard(req, res, next) {
    try {
        const idCard = req.params?.idCard;
        if (!idCard) throw new AppError('Card ID is required', 400);

        await pool.execute('CALL sp_card_unlock(?)', [idCard]);
        
        res.status(200).json({ message: 'Card unlocked successfully' });
    } catch (err) {
        const appError = mapProcedureSignalToHttp(err);
        if (appError) return next(appError);
        next(err);
    }
}

module.exports = { createCard, getCardById, getAllCards, updateCardPIN, deleteCard, lockCard, unlockCard };
