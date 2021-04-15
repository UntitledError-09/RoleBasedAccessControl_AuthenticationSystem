module.exports = (acceptedRoles) => {               // acceptedRoles is an array containing all roles that are to be allowed

    return async (req, res, next) => {

        let hasMatched = false;

        await acceptedRoles.forEach(role => {
            if (role === req.user.user_role) {      // Checking each allowed role with user role
                hasMatched = true;
                next();
            }
        });

        if (hasMatched === false) {
            if (!res.headersSent) {             // Checking if headers have been sent
                return res.status(403).json({ msg: "Access Denied! Go back and login with higher privileges!" });
            }
        }
    }
}