const Users = require('../models/users').User;
const addUser = user => Users.create(user);
const getUserByLogin = username => Users.findOne({where: {username}});

module.exports = {
    addUser,
    getUserByLogin
}