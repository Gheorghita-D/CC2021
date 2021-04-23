const Users = require('../models/users').User;
const getUser = username => Users.findOne({where: {username}});

module.exports = {
    getUser
}