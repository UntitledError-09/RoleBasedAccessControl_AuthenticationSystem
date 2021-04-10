module.exports = (roles) => {

    return async (req, res, next) => {

        let flag = 0;
        await roles.forEach(role => {
            if (role === req.user.user_role) {
                flag = 1;
                next();
            }
        });

        if (flag === 0) {
            return res.status(403).json({ msg: "Access Denied! Go back and login with higher privileges!" });
        }
    }
}