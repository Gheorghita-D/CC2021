const Sequelize = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
        Username: {
            primaryKey : true,
            type: Sequelize.STRING
        },
        Password: Sequelize.STRING,
    },
    {
        timestamps: false,

        createdAt: false,

        updatedAt: false,
    }
);

module.exports = {
     User
 }