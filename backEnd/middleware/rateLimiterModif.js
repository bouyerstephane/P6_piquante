const rateLimit = require("express-rate-limit");

const limiterModif = rateLimit({
    windowMs:  10 * 1000, // 10sec
    max : 1,
    message : "Veuillez attendre 10 secondes pour effectuer une nouvelle modification"
});

module.exports = limiterModif
