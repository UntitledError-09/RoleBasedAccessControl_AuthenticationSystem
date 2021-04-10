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
                    req.user = decodedAccessToken;
                    next();
                } else {
                    const decodedRefreshToken = await jwt.verifyJWT(refreshToken, process.env.jwt_refreshKey);
                    // console.log({ decodedRefreshToken });

                    if (decodedRefreshToken) {
                        var user = User.findById(decodedRefreshToken.user_id);

                        if (user) {

                            if (user.refreshToken === refreshToken) {

                                const newTokens = await jwt.generateJWT(user);

                                user.refreshToken = null;
                                await user.save();

                                res.cookie("Authorization", `Bearer ${newTokens.accessToken}`, config.cookie_options);
                                res.cookie("refresh-token", newTokens.refreshToken, config.cookie_options);


                                next();
                            }
                        }
                    }
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