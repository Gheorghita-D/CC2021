var usersController = require('./controllers/users');

module.exports = async function (context, req) {
    await usersController(req).then((result) => {
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