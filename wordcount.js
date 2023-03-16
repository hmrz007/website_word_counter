const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WordCount = mongoose.model('WordCount', searchSchema);

function countWords(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }

            const $ = cheerio.load(body);
            const text = $('body').text();
            const words = text.trim().split(/\s+/);
            const count = words.length;

            resolve(count);
        });
    });
}

module.exports = { WordCount, countWords };
