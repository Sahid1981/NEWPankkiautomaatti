/* Tämä tiedosto on cardsController, se toteuttaa CRUD-operaatiot cards -taululle ja hoitaa samalla PIN-koodin käsittelyn turvallisesti.
Lisäksi se validioi syötteet ja muuntaa tietokannan rivit siistiksi JSON-vastaukseksi. */

// Alun importit
const AppError = require('../middleware/AppError');
const pool = require('../db');
const bcrypt = require('bcrypt');

// mapCardRow, muuntaa DB-rivin API-muotoon
function mapCardRow(row) {
    return {
        idCard: row.idcard,
        idUser: row.iduser,
        isLocked: Boolean(row.is_locked),
    };
}

// Validiointiapurit
function requireNonEmptyString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new AppError(`${fieldName} is required (non-empty string)`, 400);
    }
}

// Varmistaa, että PIN on tasan 4 numeroa
function requirePinFormat(pin) {
    requireNonEmptyString(pin, 'pin');
    if (!/^\d{4}$/.test(pin)) throw new AppError('pin must be exactly 4 digits', 400);
}

// getCardById
// Lukee :idCard URL:sta ja hakee kortin
async function getCardById(req, res, next) {
    try {
        const idCard = req.params.idCard;
        requireNonEmptyString(idCard, 'idCard');
        
        const [rows] = await pool.execute(
            'SELECT idcard, iduser, is_locked FROM cards WHERE idcard = ?',
            [idCard]
        );
        
        if (rows.length === 0) throw new AppError('Card not found', 404);
        
        res.status(200).json(mapCardRow(rows[0]));
    } catch (err) {
        next(err);
    }
}

// createCard
// Validioi idCard, idUser ja pin
async function createCard(req, res, next) {
    try {
        const { idCard, idUser, pin } = req.body ?? {};
        
        requireNonEmptyString(idCard, 'idCard');
        requireNonEmptyString(idUser, 'idUser');
        requirePinFormat(pin);
        
        // Tarkistaa, että käyttäjä löytyy
        const [urows] = await pool.execute('SELECT iduser FROM users WHERE iduser = ?', [idUser]);
        if (urows.length === 0) throw new AppError('User not found', 404);
        
        // Hashaa PINin
        const pinHash = await bcrypt.hash(pin, 10);
        
        await pool.execute(
            // Lisää kortin tietokantaan
            'INSERT INTO cards (idcard, cardPIN, iduser, is_locked) VALUES (?, ?, ?, 0)',
            [idCard, pinHash, idUser]
        );
        
        const [rows] = await pool.execute(
            'SELECT idcard, iduser, is_locked FROM cards WHERE idcard = ?',
            [idCard]
        );
        
        res.status(201).json(mapCardRow(rows[0]));
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return next(new AppError('Card already exists', 409));
        next(err);
    }
}

// updateCard
// Sallii muuttaa kortista yhden tai useamman kentän
async function updateCard(req, res, next) {
    try {
        const idCard = req.params.idCard;
        requireNonEmptyString(idCard, 'idCard');
        
        const { idUser, pin, isLocked } = req.body ?? {};
        // Vähintään yksi kenttä pakollinen
        if (idUser === undefined && pin === undefined && isLocked === undefined) {
            throw new AppError('At least one field (idUser, pin, isLocked) is required', 400);
        }
        
        const [currentRows] = await pool.execute(
            // Varmistaa, että kortti on olemassa
            'SELECT idcard FROM cards WHERE idcard = ?',
            [idCard]
        );
        if (currentRows.length === 0) throw new AppError('Card not found', 404);
        
        if (idUser !== undefined) {
            requireNonEmptyString(idUser, 'idUser');
            const [urows] = await pool.execute('SELECT iduser FROM users WHERE iduser = ?', [idUser]);
            if (urows.length === 0) throw new AppError('User not found', 404);
        }
        
        let pinHash = null;
        if (pin !== undefined) {
            requirePinFormat(pin);
            // Jos pin annetaan -> validioi + hash
            pinHash = await bcrypt.hash(pin, 10);
        }
        
        let lockedVal = null;
        if (isLocked !== undefined) {
            if (typeof isLocked !== 'boolean' && isLocked !== 0 && isLocked !== 1) {
                throw new AppError('isLocked must be boolean (true/false) or 0/1', 400);
            }
            // Jos isLocked annetaan -> hyväksyy boolean tai 0/1
            lockedVal = Boolean(isLocked) ? 1 : 0;
        }
        
        const sets = [];
        const params = [];
        
        if (idUser !== undefined) {
            sets.push('iduser = ?');
            params.push(idUser);
        }
        if (pin !== undefined) {
            sets.push('cardPIN = ?');
            params.push(pinHash);
        }
        if (isLocked !== undefined) {
            sets.push('is_locked = ?');
            params.push(lockedVal);
        }
        
        params.push(idCard);
        
        // Rakentaa dynaamisen UPDATE-lauseen
        await pool.execute(`UPDATE cards SET ${sets.join(', ')} WHERE idcard = ?`, params);
        
        const [rows] = await pool.execute(
            'SELECT idcard, iduser, is_locked FROM cards WHERE idcard = ?',
            [idCard]
        );
        
        res.status(200).json(mapCardRow(rows[0]));
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') return next(new AppError('User not found', 404));
        next(err);
    }
}

// deleteCard
// Jos mitään ei poistunut -> 404, jos kortti on linkitetty accounts_cards -tauluun, FK estää poiston
// Onnistuu -> 204 No Content
async function deleteCard(req, res, next) {
    try {
        const idCard = req.params.idCard;
        requireNonEmptyString(idCard, 'idCard');
        
        const [result] = await pool.execute('DELETE FROM cards WHERE idcard = ?', [idCard]);
        
        if (result.affectedRows === 0) throw new AppError('Card not found', 404);
        
        res.status(204).end();
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return next(new AppError('Card cannot be deleted because it is linked to accounts', 409));
        }
        next(err);
    }
}

module.exports = {
    getCardById,
    createCard,
    updateCard,
    deleteCard,
};
