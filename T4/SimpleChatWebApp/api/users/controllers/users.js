const config =  require('../config');
const jwt = require('jsonwebtoken');
const usersService = require('../services/users');

async function checkAuth(req) {
    var token = req.headers['token'];
    if (!token)
        return { status: 403, body : { auth: false, message: "No token provided"}};
    
    var result =  await jwt.verify(token, config.jwtSecret, (err, decoded) => {
          if (err)
               return { status: 500, body : { auth: false, message: "Failed to authenticate token"}};
         
          let user = {
               username: decoded.username,
          };

          return {status: 200, body: {auth: true, data: user}}

    });

    return result;
}

module.exports = function (req){

     return new Promise((resolve, reject) => {

          checkAuth(req).then((auth) => {
               if(auth.body.auth == true){
                    let username = auth.body.data.username;
                    resolve(usersService.getUsers(username || '')
                         .then(all => {
                              if (all){
                                   return { status: 200, body : {
                                        success: true,
                                        users: JSON.stringify(all)
                                   }};
                              }
                         }).catch((err) => {
                              return {
                                   status: 500,
                                   body: {
                                        success: false,
                                        message: JSON.stringify(err)
                                   }
                              }
                         }));

               }else{
                    reject(auth);
               }
          }).catch((err) => {
               reject(err);
          });;

     });
};
