const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const User = require("../models/user")

const passwordValidator = require('password-validator');
const schema = new passwordValidator();
schema
    .is().min(4)         //min 4 caractères
    .is().max(20)      //max 20 caractères
    //.has().digits(1)   // min 1 chiffre
    .has().not().spaces()   // ne doit pas contenir d'espace
    //.has().symbols(1)    // min 1 caractère spécial

//création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    if (schema.validate(req.body.password)) {
        // si la validation du mot de passe par passwordValidator est ok, encrypte le mot de passe avant de l'envoyer a la BDD
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
                    .catch(error => res.status(400).json({error}));
            })
            .catch(error => res.status(500).json({error}));
    } else {
        res.status(500).json({message: "veuillez rentrer un mot de passe valide"})
    }
};

//connection à l'application
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).json({error: 'Utilisateur non trouvé !'});
            }
            // si l'email utilisateur correspond à un email dans la bdd, alors bcrypt vérifie si le mot de passe correspond
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({error: 'Mot de passe incorrect !'});
                    }
                    res.status(200).json({
                        // retourne l'id utilisateur, et un token encodé
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

