const Sequelize = require('sequelize');
const sequelize = require('../db');

const Messages = sequelize.define('Message', {
        Sender: Sequelize.STRING,
        Receiver: Sequelize.STRING,
        Text: Sequelize.STRING,
        Date: Sequelize.DATE,
        IsImage: Sequelize.BOOLEAN
    },
    {
        timestamps: false,

        createdAt: false,

        updatedAt: false,
    }
);

module.exports = {
     Messages
 }