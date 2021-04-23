const db = require('../../data/dbConfig');

function checkBodyValidation(req, res, next) {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(422).json({
            message: 'username and password required'
        });
    }else if(typeof password !== 'string') {
        res.status(422).json({
            message: 'password must be a string'
        });
    }else {
        next();
    }
}

async function checkUsernameUnique(req, res, next) {
    const { username } = req.body;
    const user = await db('users')
        .where('username', username)
        .first();
    if(user) {
        res.status(422).json({
            message: 'username taken'
        });
    }else {
        next();
    }
}

module.exports = {
    checkBodyValidation,
    checkUsernameUnique
}
