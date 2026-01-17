/* Tämä tiedosto on accounts-controller, joka toteuttaa CRUD-operaatiot accounts -taululle. Se tekee myös aika paljon järkevää validointia ja
käyttää stored procedureja kahdessa kohdassa */

const AppError = require('../middleware/AppError');
const pool = require('../db');

// Apufunktiot
function parseAccountId(req) {
    const id = Number(req.params.idAccount);
    if (!Number.isInteger(id) || id <= 0) throw new AppError('idAccount must be a positive integer', 400);
    return id;
}

// Tarkistaa, että arvo on oikeasti number ja äärellinen
function isMoney(n) {
    return typeof n === 'number' && Number.isFinite(n);
}

// mapAccountRow
// Muuntaa DB-rivin API-muotoon, muuttaa DECIMAL -> JS number, laskee tyypin creditLimit > 0 -> 'credit', muuten 'debit'
function mapAccountRow(row) {
    return {
        idAccount: row.idaccount,
        idUser: row.iduser,
        balance: Number(row.balance),
        creditLimit: Number(row.creditlimit),
        type: Number(row.creditlimit) > 0 ? 'credit' : 'debit',
    };
}

// getAccountById
// Validioi idAccount, hakee accountin, jos ei löydy -> 404, jos löytyy -> 200 + JSON
async function getAccountById(req, res, next) {
    try {
        const idAccount = parseAccountId(req);
        
        const [rows] = await pool.execute(
            'SELECT idaccount, iduser, balance, creditlimit FROM accounts WHERE idaccount = ?',
            [idAccount]
        );
        
        if (rows.length === 0) throw new AppError('Account not found', 404);
        
        res.status(200).json(mapAccountRow(rows[0]));
    } catch (err) {
        next(err);
    }
}

// createAccount
// Validioi body, kutsuu sp_add_account, hakee luodun accountin ja palauttaa sen
async function createAccount(req, res, next) {
    try {
        const { idUser, balance, creditLimit } = req.body ?? {};
        
        if (!idUser || typeof idUser !== 'string') throw new AppError('idUser is required (string)', 400);
        if (!isMoney(balance)) throw new AppError('balance must be a number', 400);
        if (!isMoney(creditLimit)) throw new AppError('creditLimit must be a number', 400);
        
        if (balance < 0) throw new AppError('balance cannot be negative', 400);
        if (creditLimit < 0) throw new AppError('creditLimit cannot be negative', 400);
        
        // Tietokantamuutos tehdään proseduurilla
        await pool.execute('CALL sp_add_account(?, ?, ?)', [idUser, balance, creditLimit]);
        
        const [rows] = await pool.execute(
            // Hakee luodun tilin takaisin
            'SELECT idaccount, iduser, balance, creditlimit FROM accounts WHERE iduser = ? ORDER BY idaccount DESC LIMIT 1',
            [idUser]
        );
        
        if (rows.length === 0) throw new AppError('Account created but not found', 500);
        
        res.status(201).json(mapAccountRow(rows[0]));
    } catch (err) {
        if (err.sqlState === '45000') {
            const msg = String(err.sqlMessage || err.message || '');
            if (msg.toLowerCase().includes('user not found')) return next(new AppError('User not found', 404));
            if (msg.toLowerCase().includes('balance')) return next(new AppError(msg, 400));
            if (msg.toLowerCase().includes('credit')) return next(new AppError(msg, 400));
            return next(new AppError(msg || 'Bad request', 400));
        }
        next(err);
    }
}

// updateAccount
// "Partial update" -henkinen vaikka on nimeltään update. Bodyssä voi olla mikä tahansa yhdistelmä kenttiä. Mutta vähintään yksi pitää olla.
// Validioi kentät, tarkistaa onko käyttäjä olemassa (jos idUser muutettu), päivittää tilin, hakee päivitetyn tilin ja palauttaa sen
async function updateAccount(req, res, next) {
    try {
        const idAccount = parseAccountId(req);
        const { idUser, balance, creditLimit } = req.body ?? {};
        
        if (idUser === undefined && balance === undefined && creditLimit === undefined) {
            throw new AppError('At least one field (idUser, balance, creditLimit) is required', 400);
        }
        
        if (balance !== undefined) {
            if (!isMoney(balance)) throw new AppError('balance must be a number', 400);
            if (balance < 0) throw new AppError('balance cannot be negative', 400);
        }
        
        if (creditLimit !== undefined) {
            if (!isMoney(creditLimit)) throw new AppError('creditLimit must be a number', 400);
            if (creditLimit < 0) throw new AppError('creditLimit cannot be negative', 400);
        }
        
        if (idUser !== undefined) {
            if (!idUser || typeof idUser !== 'string') throw new AppError('idUser must be a non-empty string', 400);
            const [urows] = await pool.execute('SELECT iduser FROM users WHERE iduser = ?', [idUser]);
            if (urows.length === 0) throw new AppError('User not found', 404);
        }
        
        const [currentRows] = await pool.execute(
            // Hakee nykyiset arvot
            'SELECT idaccount, iduser, balance, creditlimit FROM accounts WHERE idaccount = ?',
            [idAccount]
        );
        if (currentRows.length === 0) throw new AppError('Account not found', 404);
        
        const current = currentRows[0];
        const newIdUser = idUser ?? current.iduser;
        const newBalance = balance ?? Number(current.balance);
        const newCreditLimit = creditLimit ?? Number(current.creditlimit);
        
        await pool.execute(
            // Täyttää puuttuvat kentät vanhoilla arvoilla ja tekee UPDATE:n
            'UPDATE accounts SET iduser = ?, balance = ?, creditlimit = ? WHERE idaccount = ?',
            [newIdUser, newBalance, newCreditLimit, idAccount]
        );
        
        const [rows] = await pool.execute(
            'SELECT idaccount, iduser, balance, creditlimit FROM accounts WHERE idaccount = ?',
            [idAccount]
        );
        
        res.status(200).json(mapAccountRow(rows[0]));
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') return next(new AppError('User not found', 404));
        next(err);
    }
}

// deleteAccount
// Käytetään proseduuria
async function deleteAccount(req, res, next) {
    try {
        const idAccount = parseAccountId(req);
        
        await pool.execute('CALL sp_delete_account(?)', [idAccount]);
        
        res.status(204).end();
    } catch (err) {
        if (err.sqlState === '45000') {
            const msg = String(err.sqlMessage || err.message || '');
            if (msg.toLowerCase().includes('not found')) return next(new AppError('Account not found', 404));
            if (msg.toLowerCase().includes('cannot delete account with existing cards')) {
                return next(new AppError('Account cannot be deleted because it has linked cards', 409));
            }
            return next(new AppError(msg || 'Bad request', 400));
        }
        next(err);
    }
}

module.exports = {
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
};
