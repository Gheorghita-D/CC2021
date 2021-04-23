var messagesController = require('./controllers/messages');

module.exports = async function (context, req) {
    await messagesController(req).then((result) => {
        context.res = {
            status: result.status,
            body: JSON.stringify(result.body)
        };
    }).catch((err) => {
        context.res = {
            status: err.status,
            body: {
                message: err.body.message
            }
        }
    });
}