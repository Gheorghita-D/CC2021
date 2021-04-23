const { Op } = require("sequelize");
const Users = require('../models/users').User;
const getUsers = name => Users.findAll({attributes: ['Username'], where: {username: {[Op.ne]: name}}});

module.exports = {
    getUsers
}