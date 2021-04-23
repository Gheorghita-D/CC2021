var imagesController = require('./controllers/images');

module.exports = async function (context, req) {
    await imagesController(req).then((result) => {
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