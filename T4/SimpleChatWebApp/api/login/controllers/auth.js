const authService = require('../services/auth');

module.exports = function login(req){
     return authService.authenticate(req.body)
     .then(token => {
          return { status: 200, body : { success: true, data: { token } } };
     })
     .catch(err => {
          return { status: 400, body: { success: false, message: err.message} };
     })
};
