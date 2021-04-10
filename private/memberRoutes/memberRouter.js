const express = require('express');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    res.json({ User: req.user });
})

module.exports = router;