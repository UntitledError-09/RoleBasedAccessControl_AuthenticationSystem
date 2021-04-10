const express = require('express');
const auth = require('../userAuth/auth');
const roleCheck = require('../userAuth/roleCheck');
const User = require('../models/User');

const router = express.Router();

router.use(auth());

router.get('/', (req, res) => {
    return res.redirect('/member/dashboard');
})

router.use('/admin', roleCheck(['admin']), require("./adminRoutes/adminRouter"));
router.use('/moderator', roleCheck(['admin', 'moderator']), require("./moderatorRoutes/moderatorRouter"));
router.use('/member', roleCheck(['admin', 'moderator', 'member']), require("./memberRoutes/memberRouter"));


module.exports = router;