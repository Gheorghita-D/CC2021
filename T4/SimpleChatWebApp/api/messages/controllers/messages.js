const config =  require('../config');
const jwt = require('jsonwebtoken');
const messagesService = require('../services/messages');
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

                    let username = auth.body.data.username || '';

                    if(req.method == 'GET'){

                         let user = req.query.user || '';

                         resolve(messagesService.getMessages(username, user)
                         .then(all => {

                              if (all){
                                   return { status: 200, body : {
                                        success: true,
                                        messages: JSON.stringify(all)
                                   }};
                              }
                         }).catch((err) => {
                              return {
                                   status: 500,
                                   body: {
                                        messages: JSON.stringify(err)
                                   }
                              }
                         }));

                    }else if(req.method == 'POST'){

                         let errors = [];

                         if(req.body.user.length < 1){
                              errors.push("Invalid user");
                         }

                         if(req.body.text.length < 1){
                              errors.push("Invalid message");
                         }

                         if(req.body.isImage !== true && req.body.isImage !== false){
                              errors.push("Invalid isImage");
                         }

                         usersService.getUser(req.body.user|| '')
                              .then(exists => {
                                   if (exists){

                                        if(errors.length > 0){
                                             reject({
                                                  status: 400,
                                                  body: {
                                                       success: false,
                                                       message: errors
                                                  }
                                             });
                                        }
                                                       
                                        var message = {
                                             Sender: username,
                                             Receiver: req.body.user,
                                             Text: req.body.text,
                                             IsImage: req.body.isImage
                                        }

                                        resolve(messagesService.addMessage(message)
                                        .then(success => {

                                             if (success){
                                                  return { 
                                                       status: 200, 
                                                       body : {
                                                            success: true
                                                       }
                                                  };
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
                                        reject({
                                             status: 404,
                                             body: {
                                                  success: false,
                                                  message: "The user does not exist"
                                             }
                                        });
                                   }
                              }).catch((err) => {
                                   reject({
                                        status: 500,
                                        body: {
                                             success: false,
                                             message: "Internal server error"
                                        }
                                   });
                              });

                    }

               }else{
                    reject(auth);
               }
          }).catch((err) => {
               reject(err);
          });

     });
};
