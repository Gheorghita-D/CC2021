const express = require('express')
const app = express()
const port = 3000

const login = require('./api/login/controllers/auth');
const register = require('./api/register/controllers/register');
const users = require('./api/users/controllers/users');
const messages = require('./api/messages/controllers/messages');
const images = require('./api/images/controllers/images');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('client'));

app.post('/login', (req, res) => {

  login(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(400);
    res.send("Message: " + JSON.stringify(err.message));
  });

});

app.post('/register', (req, res) => {

  register(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(400);
    res.send("Message: " + JSON.stringify(err.message));
  });

});

app.post('/users', (req, res) => {

  users(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(err.status);
    res.send("Message: " + JSON.stringify(err.body.message));
  });

});

app.get('/messages', (req, res) => {

  messages(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(err.status);
    res.send("Message: " + JSON.stringify(err.body.message));
  });

});

app.post('/messages', (req, res) => {

  messages(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(err.status);
    res.send("Message: " + JSON.stringify(err.body.message));
  });

});

app.get('/images', (req, res) => {

  images(req).then((result) => {
    res.status(result.status);
    res.send(JSON.stringify(result.body));
  }).catch((err) => {
    res.status(err.status);
    res.send("Message: " + JSON.stringify(err.body.message));
  });

});

app.listen(port, () => {
    console.log('App listening on port ' + port)
})