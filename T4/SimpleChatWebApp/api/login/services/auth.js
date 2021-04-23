const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/users').User;
const config =  require('../config');

const authenticate = params => {
      return Users.findOne({
          where: {
              username: params.username
          },
     }).then(user => {
          if (!user)
              throw new Error('Authentication failed. User not found.');

          if (!bcrypt.compareSync(params.password || '', user.Password))
              throw new Error('Authentication failed. Wrong password.');

          const payload = {
              username: user.Username,
              time: new Date()
          };
          var token = jwt.sign(payload, config.jwtSecret, {
              expiresIn: config.tokenExpireTime
          });
          return token;
      });
}

module.exports = {
    authenticate
}