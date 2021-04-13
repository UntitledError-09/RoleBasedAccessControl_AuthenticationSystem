const express = require('express');
const User = require('../../models/User');

const router = express.Router();

router.get('/all-users', async (req, res) => {
    const { role, limit } = req.query.role;
    if (!limit && isNumber(limit) === true) {
        return res.json({ msg: "Specify a numerical limit value" })
    }
    try {
        if (role) {
            const queryResult = await User.findAll({ role }).select['username', 'role'].limit(limit || 100);

            return res.json(queryResult);
        }

        const queryResult = await User.findAll({}).select['username', 'role'];

        return res.json(queryResult);

    } catch (e) {

    }
})

module.exports = router;