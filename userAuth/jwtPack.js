const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function generateJWT(user) {
    try {
        const accessToken = jwt.sign({ user_id: user.id, user_role: user.role, user_name: user.name }, process.env.jwt_accessKey, { expiresIn: "10m" });
        const refreshToken = jwt.sign({ user_id: user.id }, process.env.jwt_refreshKey, { expiresIn: "10d" });

        let userFromDB = await User.findById(user.id);

        if (userFromDB) {
            userFromDB.refreshToken = refreshToken;

            userFromDB.markModified('refreshToken');
            await userFromDB.save();
            console.log({ id: userFromDB.id, refreshToken });

            return { accessToken, refreshToken };
        }

    } catch (e) {
        console.error(e);
        return null;
    }
}

async function verifyJWT(token, key) {
    try {
        const verified = jwt.verify(token, key);

        if (verified) {
            return verified;
        } else {
            return null;
        }
    } catch (e) {
        // console.error(e);
        return null;
    }
}

module.exports = { generateJWT, verifyJWT };