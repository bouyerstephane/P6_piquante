const express = require('express');
const router = express.Router();

const limiterModif = require("../middleware/rateLimiterModif")
const sauceCTRL = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, sauceCTRL.getAllSauces);
router.post('/', auth, multer, sauceCTRL.createSauce);
router.post('/:id/like', auth, sauceCTRL.like);
router.get('/:id', auth, sauceCTRL.getOneSauce);
router.put('/:id', auth, limiterModif, multer, sauceCTRL.modifySauce);
router.delete('/:id', auth, sauceCTRL.deleteSauce);

module.exports = router;
