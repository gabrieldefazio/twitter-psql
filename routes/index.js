'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');
const client = require('../db');


module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
      client.query('SELECT name, content, tweets.id FROM tweets JOIN users ON user_id = users.id', function (err, result) {
          if (err) return next(err); // pass errors to Express
          var tweets = result.rows;
          res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT * FROM users JOIN tweets ON users.id = user_id WHERE name = $1', [req.params.username], (err, result)=>{
      if (err) return next(err);
      let usersTweets = result.rows;
      res.render('index', {title: 'Twitter.js', tweets: usersTweets, showForm: true });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1', [req.params.id],  (err, result) => {
      if(err) return next(err);
      let idTweets = result.rows;
      console.log(idTweets);
      res.render('index', {title: 'Twitter.js', tweets: idTweets, showForm: true});
    } )

  });


  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT user_id FROM tweets JOIN users ON user_id = users.id WHERE users.name = $1 GROUP BY user_id', [req.body.name], (err, result)=>{
      if(err) return next (err);
        if (result.rows.length){
          client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [result.rows[0].user_id, req.body.content], (err, result) => {
            if(err) return next(err);
            res.redirect('/');
          })
        } else {
            client.query('INSERT INTO users (name) VALUES ($1)', [req.body.name], (err, result) => {
                if (err) return next(err);
                client.query('SELECT users.id FROM users LEFT JOIN tweets ON users.id = tweets.user_id WHERE users.name = $1', [req.body.name], (err, result) => {
                    if (err) return next(err);
                    client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [result.rows[0].id, req.body.content], (err, result) => {
                        res.redirect('/');
                    })
                })
            })
        }
  })
});



  // // replaced this hard-coded route with general static routing in app.js
    // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
