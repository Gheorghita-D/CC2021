var registerController = require('./controllers/register');

module.exports = async function (context, req) {
    await registerController(req).then((result) => {
        context.res = {
            status: result.status,
            body: JSON.stringify(result.body)
        };
    }).catch((err) => {
        context.res = {
            status: 400,
            body: {
                message: err.message
            }
        }
    });
}