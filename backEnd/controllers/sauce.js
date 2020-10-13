const fs = require('fs');
const Sauce = require('../models/sauce');

//création d'une nouvelle sauce
exports.createSauce = (req, res) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Post saved successfully!'}))
        .catch((error) => res.status(400).json({error}))
};
//récuperation d'une sauce grace à l'id reçu en paramètre
exports.getOneSauce = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({error}))
};

//modification d'une sauce existante
exports.modifySauce = (req, res) => {
    // si une nouvelle image est reçu, supprime l'ancienne image du dossier images
    if (req.file) {
        Sauce.findOne({_id: req.params.id})
            .then(sauce => {
                const fileName = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${fileName}`, (err => {
                    if (err) console.log(err);
                    else {
                        console.log("\nDeleted file: " + fileName);
                    }
                }))
            })
    }
    // ajoute le contenu à sauceObjet en fonction de ce qui est reçu
    const sauceObjet = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body}
    // met a jours la base de données
    Sauce.updateOne({_id: req.params.id}, {...sauceObjet, _id: req.params.id})
        .then(() => res.status(200).json({message: "Sauce modifié"}))
        .catch((error) => res.status(400).json({error}))
}

//supprime la sauce en fonction de l'id reçu en paramètre
exports.deleteSauce = (req, res) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            //supprime l'image du dossier images
            const fileName = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimé!'}))
                    .catch((error) => res.status(400).json({error}))
            })
        })
};
// récupère tout les sauces
exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({error}));
};
// gestion des like
exports.like = (req, res) => {
    const like = req.body.like;
    const user = req.body.userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (like === 1 && !sauce.usersLiked.includes(user)) {
                //si l'utilisateur aime la sauce, vérifie qu'il n'existe pas déjà dans le tableau "usersliked"
                // incrémente +1 à "like" et l'ajoute au tableau "usersLiked"
                Sauce.updateOne({_id: req.params.id}, {
                    $inc: {likes: 1},
                    $push: {usersLiked: user}
                }, {_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce liké!'}))
                    .catch(error => res.status(400).json({error}))
            } else if (like === -1 && !sauce.usersDisliked.includes(user)) {
                //si l'utilisateur n'aime pas la sauce, vérifie qu'il n'existe pas déjà dans le tableau "usersDisiked"
                // incrémente +1 à "dislike" et l'ajoute au tableau "usersDisliked"
                Sauce.updateOne({_id: req.params.id}, {
                    $inc: {dislikes: 1},
                    $push: {usersDisliked: user}
                }, {_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce disliké!'}))
                    .catch(error => res.status(400).json({error}))
            } else if (like === 0) {
                // si l'utilisateur retire son avis, verifie dans quel tableau il se trouve
                // puis supprime 1 like ou dislike et le supprime du tableau correspondant
                if (sauce.usersLiked.includes(user)) {
                    Sauce.updateOne({_id: req.params.id}, {
                        $inc: {likes: -1},
                        $pull: {usersLiked: user}
                    }, {_id: req.params.id})
                        .then(() => res.status(200).json({message: 'avis retiré!'}))
                        .catch(error => res.status(400).json({error}))
                } else if (sauce.usersDisliked.includes(user)) {
                    Sauce.updateOne({_id: req.params.id}, {
                        $inc: {dislikes: -1},
                        $pull: {usersDisliked: user}
                    }, {_id: req.params.id})
                        .then(() => res.status(200).json({message: 'avis retiré!'}))
                        .catch(error => res.status(400).json({error}))
                }
            }
        })
        .catch(error => {
            res.status(400).json({error})
        })
}


