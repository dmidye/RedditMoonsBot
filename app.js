const { CommentStream } = require("snoostorm");
const fs = require('fs');

require('dotenv').config();
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const KARMA_MOON_RATIO = 0.267;
const FILE_NAME = "round_16_proposed.csv"
var usersRepliedTo = 0;

var data = fs.readFileSync(FILE_NAME)
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map(e => e.trim()) // remove white spaces for each line
    .map(e => e.split(',').map(e => e.trim())); // split each line to array

// retrieve a user
const getUserMoons = (username, userList) => {
    var username;
    for(const user of userList) {
        if(user[0] === username) {
            return user[3] * KARMA_MOON_RATIO;
        }
    }
    return null;
}

const r = new Snoowrap({
	userAgent: 'HowManyMoonsBot',
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	username: process.env.REDDIT_USER,
	password: process.env.REDDIT_PASS
});

const stream = new CommentStream(r, { subreddit: "CryptoCurrency", results: 25 });

stream.on("item", comment => {
    var body = comment.body.trim();

    if(body.includes('HowManyMoonsBot u/')) {
        const array = body.split(' ');
        if(array.length == 2) {
            var username = array[1];
            console.log("Getting data for ", username, "....");
            var userMoons = getUserMoons(username, data);
            if(userMoons) {
                comment.reply(username + " will receive around " + userMoons.toFixed(2) + " moons in the upcoming round." );
                usersRepliedTo++;
                console.log("Users replied to successfully: ", usersRepliedTo);
            } else {
                console.log("User not in csv.")
                comment.reply("Could not find " + username + " in this month's moon proposal.");
            }
        } else {
            console.log("Comment contained HowManyMoonsBot but was not in correct format.")
        }
    } 
})