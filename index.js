const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { WordCount, countWords } = require('./wordcount');



// Connect to the database   mongodb://localhost:27017/wordcount
mongoose.connect('mongodb://hamras:hamras@ac-we0xb7o-shard-00-00.m90gwwc.mongodb.net:27017,ac-we0xb7o-shard-00-01.m90gwwc.mongodb.net:27017,ac-we0xb7o-shard-00-02.m90gwwc.mongodb.net:27017/?ssl=true&replicaSet=atlas-5uodst-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to database'))
    .catch(err => console.log(err));

const app = express();


// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Set up view engine
app.set('view engine', 'ejs');

// Set up routes
app.get('/', (req, res) => {
    const { error } = req.query;
    res.render('index', { error });
});


app.post('/wordcount', (req, res) => {
    const url = req.body.url;

    if (!url) {
        res.redirect('/?error=Please%20provide%20a%20valid%20URL');
        return;
    }

    countWords(url).then(count => {
            const search = new WordCount({
                url,
                count
            });
            search.save()
                .then(() => {
                    res.render('index', { url, count });
                })
                .catch(err => {
                    console.error('Error saving search to database:', err);
                    res.redirect(`/?error=${encodeURIComponent(err.message)}`);
                });
        })
        .catch(err => {
            console.error('Error counting words:', err);
            res.redirect(`/?error=${encodeURIComponent(err.message)}`);
        });
});

app.get('/history', async (req, res) => {
    try {
        // Get the search history from the database
        const searches = await WordCount.find().sort({ createdAt: -1 });

        res.render('history', { searches });
    } catch (error) {
        console.log(error);
        res.render('history', { searches: [] });
    }
});



// Start the server
app.listen(5000, () => console.log('Server started'));
