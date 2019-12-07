require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MOVIEDEX = require('./movies-data-small.json');

const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    console.log('validate bearer token middleware')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }
    next()
})

//search for Movies by genre, country, or avg_vote
app.get('/movie', function handleGetMovies (req, res) {
    let response = MOVIEDEX;

    const { genre, country, avg_vote } = req.query;
    
    
    if (genre) {
        const distinctGenres = [...new Set(response.map( movie => movie.genre.toLowerCase()))];
        const searchedGenre = genre.toLowerCase();
        if (!distinctGenres.includes(searchedGenre)){
            return res.status(400).send('Genre not found. Please try again.')
        }
        
        response = response.filter( movie =>
            movie.genre.toLowerCase().includes(genre.toLowerCase())
        )
    }
    if (country) {
        const distinctCountries = [...new Set(response.map( movie => movie.country.toLowerCase()))];
        const searchedCountry = country.toLowerCase();
        if (!distinctCountries.includes(searchedCountry)){
            return res.status(400).send('Country not found. Please try again')
        }
        response = response.filter( movie => 
            movie.country.toLowerCase().includes(country.toLowerCase())
        )
    }

    if (avg_vote) {
        const numVote = parseFloat(avg_vote);

        if (isNaN(numVote)){
            return res.status(400).send('Value for average vote must be numeric.')
        }

        if (numVote < 0){
            return res.status(400).send('Rating must be above 0')
        }

        response = response.filter( movie =>
            Number(movie.avg_vote) >= Number(avg_vote)
        )
    }

    res.json(response);
})

const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})