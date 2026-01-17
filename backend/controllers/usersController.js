// Tämä tiedosto on users-controller. Toteuttaa CRUD-operaatiot users-taululle ja yhdistää HTTP-pyynnöt, MySQL-tietokannan ja virheenkäsittelyn

// Importit
const AppError = require('../middleware/AppError');
const pool = require('../db');

// mapUserRow
// Muotoilee tietokantarivin API-vastaukseksi
function mapUserRow(row) {
    return {
        idUser: row.iduser,
        firstName: row.fname,
        lastName: row.lname,
        streetAddress: row.streetaddress,
    };
}

// getUserById
// Lukee käyttäjän idUser:n perusteella, tarkistaa, että se on olemassa, tekee SELECTin ja palauttaa käyttäjän tai 404
async function getUserById(req, res, next) {
    try {
        const idUser = req.params.idUser;
        if (!idUser) throw new AppError('idUser is required', 400);
        
        const [rows] = await pool.execute(
            'SELECT iduser, fname, lname, streetaddress FROM users WHERE iduser = ?',
            [idUser]
        );
        
        if (rows.length === 0) throw new AppError('Customer not found', 404);
        
        res.status(200).json(mapUserRow(rows[0]));
    // Virheiden kulku    
    } catch (err) {
        next(err);
    }
}

// createUser
// Lukee bodyn, validioi kentät, INSERT users ja palauttaa 201
async function createUser(req, res, next) {
    try {
        const { idUser, firstName, lastName, streetAddress } = req.body ?? {};
        if (!idUser) throw new AppError('idUser is required', 400);
        if (!firstName || !lastName || !streetAddress) {
            throw new AppError('firstName, lastName and streetAddress are required', 400);
        }
        
        await pool.execute(
            'INSERT INTO users (iduser, fname, lname, streetaddress) VALUES (?, ?, ?, ?)',
            [idUser, firstName, lastName, streetAddress]
        );
        
        res.status(201).json({ idUser, firstName, lastName, streetAddress });
    // Virheiden kulku
    } catch (err) {
        // Duplicate-virhe käsitellään
        if (err.code === 'ER_DUP_ENTRY') return next(new AppError('Customer already exists', 409));
        next(err);
    }
}

// updateUser
// Lukee id URL:sta, lukee bodyn, UPDATE users ja tarkistaa löytyikö käyttäjä
async function updateUser(req, res, next) {
    try {
        const idUser = req.params.idUser;
        if (!idUser) throw new AppError('idUser is required', 400);
        
        const { firstName, lastName, streetAddress } = req.body ?? {};
        if (!firstName || !lastName || !streetAddress) {
            throw new AppError('firstName, lastName and streetAddress are required', 400);
        }
        
        const [result] = await pool.execute(
            'UPDATE users SET fname = ?, lname = ?, streetaddress = ? WHERE iduser = ?',
            [firstName, lastName, streetAddress, idUser]
        );
        
        if (result.affectedRows === 0) throw new AppError('Customer not found', 404);
        
        res.status(200).json({ idUser, firstName, lastName, streetAddress });
    // Virheiden kulku
    } catch (err) {
        next(err);
    }
}

// deleteUser
// Lukee id, DELETE users ja tarkistaa FK-virheet
async function deleteUser(req, res, next) {
    try {
        const idUser = req.params.idUser;
        if (!idUser) throw new AppError('idUser is required', 400);
        
        const [result] = await pool.execute('DELETE FROM users WHERE iduser = ?', [idUser]);
        
        if (result.affectedRows === 0) throw new AppError('Customer not found', 404);
        
        res.status(204).end();
    // Virheiden kulku
    } catch (err) {
        // FK-virheen käsittely
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return next(new AppError('Customer cannot be deleted because it has accounts', 409));
        }
        next(err);
    }
}

module.exports = { getUserById, createUser, updateUser, deleteUser };
