const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,    // limite le nombre de requête à 100 max par IP
    message : "vous avez dépassé la limite autorisé de 100 requêtes, veuillez attendre 15minutes"
});

module.exports = limiter
