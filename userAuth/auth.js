const User = require('../models/User');
const jwt = require('./jwtPack');

module.exports = () => {
    return async (req, res, next) => {
        try {
            let accessToken = req.cookies["Authorization"].split('Bearer ')[1];
            let refreshToken = req.cookies["refresh-token"];
            // console.log(accessToken, refreshToken);
            if (accessToken && refreshToken) {
                const decodedAccessToken = await jwt.verifyJWT(accessToken, process.env.jwt_accessKey);
                // console.log({ decodedAccessToken });
                if (decodedAccessToken) {
                    req.user = decodedAccessToken;          // Stores decoded access token in req for all other function to use the same info
                    next();
                } else {
                    // access token has expired

                    const decodedRefreshToken = await jwt.verifyJWT(refreshToken, process.env.jwt_refreshKey);
                    // console.log({ decodedRefreshToken });

                    if (decodedRefreshToken) {
                        // refresh token is valid
                        var user = User.findById(decodedRefreshToken.user_id);

                        if (user) {

                            if (user.refreshToken === refreshToken) {       // verifying if the refresh token in the userDB is the same as the one received here

                                const newTokens = await jwt.generateJWT(user);

                                user.refreshToken = newTokens.refreshToken;
                                await user.save();

                                res.cookie("Authorization", `Bearer ${newTokens.accessToken}`, config.cookie_options);
                                res.cookie("refresh-token", newTokens.refreshToken, config.cookie_options);


                                next();
                            }
                        }
                    }
                    // refresh token has expired, refresh token does not match with the same from userDB, 
                    return res.redirect("/auth/logout?redirect=" + req.originalUrl);
                }
            } else {
                return res.redirect("/auth/login?redirect=" + req.originalUrl);
            }

        } catch (e) {
            // console.error(e);
            return res.redirect("/auth/login?redirect=" + req.originalUrl);
        }
    }
}