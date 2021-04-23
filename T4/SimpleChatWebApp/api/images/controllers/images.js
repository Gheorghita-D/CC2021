const config =  require('../config');
const jwt = require('jsonwebtoken');
const imagesService = require('../services/images');

async function checkAuth(req) {
    var token = req.headers['token'];
    if (!token)
        return { status: 403, body : { auth: false, message: "No token provided"}};
    
    var result =  await jwt.verify(token, config.jwtSecret, (err, decoded) => {
          if (err)
               return { status: 500, body : { auth: false, message: "Failed to authenticate token"}};
         
          let user = {
               username: decoded.username,
               queryTerm: req.query.queryTerm || ''
          };

          return {status: 200, body: {auth: true, data: user}}

    });

    return result;
}

module.exports = function (req){

     return new Promise((resolve, reject) => {

          checkAuth(req).then((auth) => {
               if(auth.body.auth == true){

                    if(auth.body.data.queryTerm.trim().length <= 0){
                         reject({
                              status: 400,
                              body: {
                                   success: false,
                                   message: "Query missing"
                              }
                         });
                    }
                    
                    resolve(imagesService.getImages(auth.body.data.queryTerm)
                         .then(all => {
                              if (all){
                                   return { status: 200, body : {
                                        success: true,
                                        urls: JSON.stringify(all)
                                   }};
                              }
                         }).catch(()=>{
                              reject({
                                   status: 500,
                                   body: {
                                        success: false,
                                        message: "Internal server error"
                                   }
                              });
                         }));

               }else{
                    reject(auth);
               }
          }).catch((err) => {
               reject(err);
          });

     });
};
