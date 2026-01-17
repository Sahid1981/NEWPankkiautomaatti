// Tämä tiedosto on log -taulun CRUD-controller

// Importit
const AppError = require('../middleware/AppError');
const pool = require('../db');

// Apufunktiot
function parseId(value, fieldName) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(`${fieldName} must be a positive integer`, 400);
    return id;
}

function isMoney(n) {
    return typeof n === 'number' && Number.isFinite(n);
}

function mapLogRow(row) {
    return {
        idLog: row.idlog,
        idAccount: row.idaccount,
        time: row.time,
        balanceChange: Number(row.balancechange),
    };
}

// getLogById
// Lukee idLog URL-parametrista ja validoi sen
async function getLogById(req, res, next) {
    try {
        const idLog = parseId(req.params.idLog, 'idLog');
        
        const [rows] = await pool.execute(
            // Haetaan rivi
            'SELECT idlog, idaccount, time, balancechange FROM log WHERE idlog = ?',
            [idLog]
        );
        
        if (rows.length === 0) throw new AppError('Log not found', 404);
        
        res.status(200).json(mapLogRow(rows[0]));
    } catch (err) {
        next(err);
    }
}

// getAllLogs
// Hakee kaikki logit uusimmasta vanhimpaan
async function getAllLogs(req, res, next) {
    try {
        const [rows] = await pool.execute(
            'SELECT idlog, idaccount, time, balancechange FROM log ORDER BY idlog DESC'
        );
        
        res.status(200).json(rows.map(mapLogRow));
    } catch (err) {
        next(err);
    }
}

// createLog
// Validoi idAccount ja validoi balanceChange
async function createLog(req, res, next) {
    try {
        const { idAccount, balanceChange, time } = req.body ?? {};
        
        const accountId = parseId(idAccount, 'idAccount');
        if (!isMoney(balanceChange)) throw new AppError('balanceChange must be a number', 400);
        
        // Varmistaa, että tili on olemassa
        const [arows] = await pool.execute('SELECT idaccount FROM accounts WHERE idaccount = ?', [accountId]);
        if (arows.length === 0) throw new AppError('Account not found', 404);
        
        if (time !== undefined && (typeof time !== 'string' || time.trim().length === 0)) {
            throw new AppError('time must be a datetime string when provided', 400);
        }
        
        let result;
        if (time) {
            [result] = await pool.execute(
                // Jos time annettu, käytetään sitä -> muuten käytetään nykyhetkeä mikrosekunteineen
                'INSERT INTO log (idaccount, time, balancechange) VALUES (?, ?, ?)',
                [accountId, time, balanceChange]
            );
        } else {
            [result] = await pool.execute(
                'INSERT INTO log (idaccount, time, balancechange) VALUES (?, NOW(6), ?)',
                [accountId, balanceChange]
            );
        }
        
        const [rows] = await pool.execute(
            'SELECT idlog, idaccount, time, balancechange FROM log WHERE idlog = ?',
            [result.insertId]
        );
        
        res.status(201).json(mapLogRow(rows[0]));
    } catch (err) {
        next(err);
    }
}

// updateLog
// Lukee idLog URL-parametrista
// Bodyssa saa olla mikä tahansa kenttä, jos body on tyhjä -> 400
async function updateLog(req, res, next) {
    try {
        const idLog = parseId(req.params.idLog, 'idLog');
        const { idAccount, balanceChange, time } = req.body ?? {};
        
        if (idAccount === undefined && balanceChange === undefined && time === undefined) {
            throw new AppError('At least one field (idAccount, balanceChange, time) is required', 400);
        }
        
        const [currentRows] = await pool.execute(
            // Hakee ensin nykyisen login
            'SELECT idlog, idaccount, time, balancechange FROM log WHERE idlog = ?',
            [idLog]
        );
        if (currentRows.length === 0) throw new AppError('Log not found', 404);
        const current = currentRows[0];
        
        let newAccountId = current.idaccount;
        if (idAccount !== undefined) {
            newAccountId = parseId(idAccount, 'idAccount');
            const [arows] = await pool.execute('SELECT idaccount FROM accounts WHERE idaccount = ?', [newAccountId]);
            if (arows.length === 0) throw new AppError('Account not found', 404);
        }
        
        let newBalanceChange = Number(current.balancechange);
        if (balanceChange !== undefined) {
            if (!isMoney(balanceChange)) throw new AppError('balanceChange must be a number', 400);
            newBalanceChange = balanceChange;
        }
        
        let newTime = current.time;
        if (time !== undefined) {
            if (typeof time !== 'string' || time.trim().length === 0) {
                throw new AppError('time must be a datetime string', 400);
            }
            newTime = time;
        }
        
        await pool.execute(
            // Päivittää rivin
            'UPDATE log SET idaccount = ?, time = ?, balancechange = ? WHERE idlog = ?',
            [newAccountId, newTime, newBalanceChange, idLog]
        );
        
        const [rows] = await pool.execute(
            'SELECT idlog, idaccount, time, balancechange FROM log WHERE idlog = ?',
            [idLog]
        );
        
        res.status(200).json(mapLogRow(rows[0]));
    } catch (err) {
        next(err);
    }
}

// deleteLog
// Lukee idLog
async function deleteLog(req, res, next) {
    try {
        const idLog = parseId(req.params.idLog, 'idLog');
        
        // Poisto
        const [result] = await pool.execute('DELETE FROM log WHERE idlog = ?', [idLog]);
        
        if (result.affectedRows === 0) throw new AppError('Log not found', 404);
        
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getLogById,
    getAllLogs,
    createLog,
    updateLog,
    deleteLog,
};
