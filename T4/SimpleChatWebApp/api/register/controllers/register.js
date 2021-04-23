const config =  require('../config');
const registerService = require('../services/register');
const bcrypt = require('bcrypt');

module.exports = function (req){
     return registerService.getUserByLogin(req.body.username || '')
     .then(exists => {
          if (exists){
               return { status: 409, body : {
                    success: false,
                    message: 'Registration failed. User with this username already registered.'
                }};
          }
          var user = {
               Username: req.body.username,
               Password: bcrypt.hashSync(req.body.password, config.saltRounds)
           }

          return registerService.addUser(user)
          .then(() => {
               return { status: 200, body : { success: true} };
          });
     });
};
