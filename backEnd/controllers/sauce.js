const fs = require('fs');
const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {

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

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({error}))
};

exports.modifySauce = (req, res, next) => {
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

    const sauceObjet = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body}

    Sauce.updateOne({_id: req.params.id}, {...sauceObjet, _id: req.params.id})
        .then(() => res.status(200).json({message: "Sauce modifié"}))
        .catch((error) => res.status(400).json({error}))

}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const fileName = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimé!'}))
                    .catch((error) => res.status(400).json({error}))
            })
        })

};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({error}));
};

exports.like = (req, res, next) => {
    const like = req.body.like;
    const user = req.body.userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (like === 1 && !sauce.usersLiked.includes(user)) {

                Sauce.updateOne({_id: req.params.id}, {
                    $inc: {likes: 1},
                    $push: {usersLiked: user}
                }, {_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce liké!'}))
                    .catch(error => res.status(400).json({error}))
            } else if (like === -1 && !sauce.usersDisliked.includes(user)) {
                Sauce.updateOne({_id: req.params.id}, {
                    $inc: {dislikes: 1},
                    $push: {usersDisliked: user}
                }, {_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce disliké!'}))
                    .catch(error => res.status(400).json({error}))
            } else if (like === 0) {
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


