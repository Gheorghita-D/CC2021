'use strict';
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const express = require('express');
const app = express();

app.use("/public", express.static('./public'));

app.use(express.urlencoded());

app.use(express.json());

app.use(cookieParser());

app.set("view engine", "ejs"); 

app.set("views", __dirname + "/views"); 

app.use(session({
    key: 'userId',
    secret: 'j9e32jeEEDEFr34reREser',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.userId) {
        res.redirect('/chat');
    } else {
        next();
    }    
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/views/signup.html');
    })
    .post((req, res) => {

		let usernameValue = req.body.username || '';
		let passwordValue = req.body.password || '';
		let passwordConfirmValue = req.body.confirmPassword || '';

		if(passwordValue !== passwordConfirmValue){
			res.redirect('/signup?error_code=1');
		}else{
			var options = {
				uri: 'https://europe-west1-simplechat-308917.cloudfunctions.net/users',
				body: JSON.stringify({username: usernameValue, password : passwordValue}),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}

			request(options, (error, response) => {
				let err = JSON.parse(response.body).error || '';
				let resp =  JSON.parse(response.body);
				if(err.trim().length > 0){
					res.redirect('/signup?error_code=2');
				}else{
					req.session.user = {id : resp.result[0].id, username : usernameValue};
					res.redirect('/chat');
				}
			});
		}
    });

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/views/login.html');
    })
    .post((req, res) => {
		let usernameValue = req.body.username || '';
		let passwordValue = req.body.password || '';

		var options = {
			uri: 'https://europe-west1-simplechat-308917.cloudfunctions.net/login',
			body: JSON.stringify({username: usernameValue, password : passwordValue}),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}

		request(options, (error, response) => {
			let err = JSON.parse(response.body).error || '';
			let resp =  JSON.parse(response.body);
			if(err.trim() != ''){
				res.redirect('/login?error_code=1');
			}else{
				req.session.user = {id : resp.result[0].id, username : usernameValue};
				res.redirect('/chat');
			}
		});
	});

app.get('/chat', (req, res) => {
    if (req.session.user && req.cookies.userId) {
        res.render( 'chat', {currentId:req.session.user.id, currentUsername: req.session.user.username});
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.userId) {
        res.clearCookie('userId');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.use(function (req, res, next) {
  res.status(404).send("Page not found")
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  	console.log(`App listening on port ${PORT}`);
  	console.log('Press Ctrl+C to quit.');
});

module.exports = app;
