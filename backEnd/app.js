const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

mongoose.connect("mongodb+srv://steph:vcmp@cluster0.wlqxa.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority",
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.post('/api/sauces', (req, res, next) => {
    console.log(req.body);
    res.status(201).json({
        message: 'Objet créé !'
    });
});

app.use('/api/sauces', (req, res, next) => {
    const sauces = [
        {
            id: "string",
            password: "string",
            userID: "string",
            name: "string",
            manufacturer: "string",
            description: "string",
            mainPepper: "string",
            imgUrl: "imageUrl",
            heat: "",
            likes: "",
            dislikes: "",
            usersLiked: "",
            usersDisliked: ""
        }
    ];
    res.status(200).json(sauces);
});

module.exports = app;
