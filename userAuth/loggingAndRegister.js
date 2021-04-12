const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('./jwtPack');
const config = require('../config/config');
const path = require('path');

const router = express.Router();

router.get('/logout', async (req, res) => {
    res.cookie("Authorization", "", config.cookie_options);
    res.cookie("refresh-token", "", config.cookie_options);

    await User.findByIdAndUpdate(req.user_id, { refreshToken: null });

    if (req.query.redirect) {
        return res.redirect('/auth/login?redirect=' + req.query.redirect);
    } else {
        return res.redirect('/auth/login');
    }
})

router.get('/login', async (req, res) => {
    const response = await checkLoggedIn(req, res);

    if (response) {
        return res.redirect(response);
    }

    return res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/register', async (req, res) => {
    const response = await checkLoggedIn(req, res);

    if (response) {
        return response;
    }

    return res.sendFile(path.join(__dirname, 'register.html'));
});

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect('/auth/login?errors=All fields are mandatory!');
    }

    var user = await User.findOne({ username });

    if (user) {
        try {
            const verified = await bcrypt.compare(password, user.password);

            if (verified) {
                const newTokens = await jwt.generateJWT(user);

                res.cookie("Authorization", `Bearer ${newTokens.accessToken}`, config.cookie_options);
                res.cookie("refresh-token", newTokens.refreshToken, config.cookie_options);

                return res.redirect((req.query.redirect == undefined) ? req.query.redirect : "/private/member/dashboard");
            } else {
                return res.redirect('/auth/login?errors=Invalid Credentials!');
            }
        } catch (e) {
            console.error(e);
            return res.redirect('/auth/login?errors=Please try again!');
        }
    }

    return res.redirect('/auth/login?errors=Invalid Credentials!');

});

router.post('/register', async (req, res) => {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
        return res.redirect('/auth/register?errors=All fields are mandatory!');
    }

    let user = await User.findOne({ username });

    if (user) {
        // console.log(user);
        return res.redirect('/auth/register?errors=Username already taken;');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, name });

    await newUser.save();
    const newTokens = await jwt.generateJWT(newUser);

    res.cookie("Authorization", `Bearer ${newTokens.accessToken}`, config.cookie_options);
    res.cookie("refresh-token", newTokens.refreshToken, config.cookie_options);


    return res.redirect('/private/member/dashboard?alerts=Welcome! Your profile has been created!;');
})

module.exports = router;

async function checkLoggedIn(req, res) {
    try {
        let accessToken = req.cookies["Authorization"].split('Bearer ')[1];
        let refreshToken = req.cookies["refresh-token"];
        // console.log({ accessToken, refreshToken });
        if (accessToken && refreshToken) {
            const decodedAccessToken = await jwt.verifyJWT(accessToken, process.env.jwt_accessKey);
            console.log({ decodedAccessToken });
            if (decodedAccessToken) {
                req.user = decodedAccessToken;
                return req.query.redirect || "/private/member/dashboard";
            } else {
                const decodedRefreshToken = await jwt.verifyJWT(refreshToken, process.env.jwt_refreshKey);
                console.log({ decodedRefreshToken });

                if (decodedRefreshToken) {
                    var user = User.findById(decodedRefreshToken.user_id);

                    if (user) {

                        if (user.refreshToken === refreshToken) {

                            const newTokens = await jwt.generateJWT(user);

                            user.refreshToken = null;
                            await user.save();

                            res.cookie("Authorization", `Bearer ${newTokens.accessToken}`, config.cookie_options);
                            res.cookie("refresh-token", newTokens.refreshToken, config.cookie_options);


                            return req.query.redirect || "/private/member/dashboard";
                        }
                    }
                }
            }
        }
        return null
    } catch (e) {
        console.error("checkLoggedIn:" + e)
        return null;
    }
    return null;
}