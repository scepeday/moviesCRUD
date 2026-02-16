require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const ratingOptions = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

async function seedMoviesIfEmpty() {
  const count = await Movie.countDocuments();

  if (count === 0) {
    await Movie.insertMany([
      { title: 'The Lion King', year: 1994, rating: 'G' },
      { title: 'Inception', year: 2010, rating: 'PG-13' }
    ]);
  }
}

async function updateMovieRating(title, newRating) {
  return Movie.updateOne({ title }, { $set: { rating: newRating } });
}

async function deleteMoviesByRating(rating) {
  return Movie.deleteMany({ rating });
}

app.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ year: 1, title: 1 });

    res.render('index', {
      title: 'Movies CRUD',
      movies,
      message: req.query.message || '',
      ratingOptions
    });
  } catch (error) {
    res.status(500).send('Error loading movies.');
  }
});

app.post('/movies/add', async (req, res) => {
  const { title, year, rating } = req.body;

  try {
    if (!title || !year || !rating) {
      return res.redirect('/?message=Please fill all fields to add a movie');
    }

    await Movie.create({ title: title.trim(), year: Number(year), rating });
    return res.redirect('/?message=Movie added');
  } catch (error) {
    return res.redirect('/?message=Could not add movie');
  }
});

app.post('/movies/update-rating', async (req, res) => {
  const { title, newRating } = req.body;

  try {
    if (!title || !newRating) {
      return res.redirect('/?message=Select a movie and rating');
    }

    const result = await updateMovieRating(title, newRating);

    if (result.matchedCount === 0) {
      return res.redirect('/?message=Movie not found');
    }

    return res.redirect('/?message=Rating updated');
  } catch (error) {
    return res.redirect('/?message=Could not update rating');
  }
});

app.post('/movies/delete-by-rating', async (req, res) => {
  const { ratingToDelete } = req.body;

  try {
    if (!ratingToDelete) {
      return res.redirect('/?message=Select a rating to delete');
    }

    const result = await deleteMoviesByRating(ratingToDelete);
    return res.redirect(`/?message=Deleted ${result.deletedCount} movie(s)`);
  } catch (error) {
    return res.redirect('/?message=Could not delete movies');
  }
});

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing in .env file');
    }

    await mongoose.connect(MONGO_URI);
    await seedMoviesIfEmpty();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting app:', error.message);
    process.exit(1);
  }
}

startServer();
