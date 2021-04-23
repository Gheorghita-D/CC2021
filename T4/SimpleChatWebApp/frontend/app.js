const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const express = require('express');
const config = require('./config');

const app = express();

app.use("/public", express.static('./public'));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.set("view engine", "ejs"); 

app.set("views", __dirname + "/views"); 

app.use(session({
    key: 'userId',
    secret: config.sessionKey,
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
				uri: config.apiBaseUrl + "register",
				body: JSON.stringify({username: usernameValue, password : passwordValue}),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}

			request(options, (error, response) => {
				let resp =  JSON.parse(response.body);
				if(!resp.success){
					res.redirect('/signup?error_code=2');
				}else{
					// req.session.user = {username : usernameValue};
					res.redirect('/login');
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
			uri: config.apiBaseUrl + "login",
			body: JSON.stringify({username: usernameValue, password : passwordValue}),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}

		request(options, (error, response) => {
			response = JSON.parse(response.body);

			if(!response.success){
				res.redirect('/login?error_code=1');
			}else{
				req.session.user = {username : usernameValue, token: response.data.token};
				res.redirect('/chat');
			}
		});
	});

app.get('/chat', (req, res) => {
    if (req.session.user && req.cookies.userId) {
        res.render( 'chat', {currentUsername: req.session.user.username, currentToken : req.session.user.token});
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

module.exports = app;
