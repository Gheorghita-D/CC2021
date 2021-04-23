const { Op } = require("sequelize");
const Messages = require('../models/messages').Messages;
const getMessages = (user1, user2) => Messages.findAll(
    {where: 
        {
            [Op.or]: 
            [
                {
                    [Op.and] : 
                    [
                        {Sender: user1},
                        {Receiver: user2}
                    ]
                },
                {
                    [Op.and] : 
                    [
                        {Sender: user2},
                        {Receiver: user1}
                    ]
                }
            ]
        }
    });

const addMessage = message => Messages.create(message);

module.exports = {
    getMessages,
    addMessage
}