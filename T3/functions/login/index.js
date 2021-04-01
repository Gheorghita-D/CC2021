const {Datastore} = require('@google-cloud/datastore');
const crypto = require('crypto');

const datastore = new Datastore({
	projectId: 'simplechat-308917',
	keyFilename: 'simplechat-308917-4ef087404854.json'
});

const kindName = 'user';
exports.login = (req, res) => {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Content-Type', 'application/json');

	async function login(){

		let usernameValue = req.body.username || '';
		let passwordValue = req.body.password || '';

        let passwordHash = crypto.createHash('md5').update(passwordValue).digest("hex");

		let checkQuery = datastore.createQuery(kindName).filter('username', '=', usernameValue).filter('password', '=', passwordHash);
		let [results] = await datastore.runQuery(checkQuery);

		if(results.length > 0){ 

			let list = results.map(user => ({id: user[datastore.KEY]["id"], username: user.username}));
			res.status(200).send(JSON.stringify({result:list}));
		}else{
			res.status(400).send(JSON.stringify({error: "Incorrect username or password"}));
		}
	
	}

	login();
	
};


