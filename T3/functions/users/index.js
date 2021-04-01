const {Datastore} = require('@google-cloud/datastore');
const crypto = require('crypto');

const datastore = new Datastore({
	projectId: 'simplechat-308917',
	keyFilename: 'simplechat-308917-4ef087404854.json'
});

const kindName = 'user';
exports.users = (req, res) => {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Content-Type', 'application/json');
	
	async function listUsers() {
		const query = datastore.createQuery(kindName).order('username');
		const [users] = await datastore.runQuery(query);
		var list = users.map(user => ({id: user[datastore.KEY]["id"], username: user.username}));

		res.status(200).send(JSON.stringify(
			{
				results: list
			}
		));
	}

	async function addUser(){
		let usernameValue = req.body.username || '';
		let passwordValue = req.body.password || '';

        let passwordHash = crypto.createHash('md5').update(passwordValue).digest("hex");

		let checkQuery = datastore.createQuery(kindName).filter('username', '=', usernameValue);
		let [results] = await datastore.runQuery(checkQuery);

		if(results.length <= 0){
			await datastore.save({
				key: datastore.key(kindName),
				data:  {
					username : usernameValue,
					password : passwordHash,
				}
			})
			.catch(err => {
				console.error('ERROR:', err);
				res.status(500).send(err);
				return;
			});

			let query = datastore.createQuery(kindName).filter('username', '=', usernameValue);
			let [userRes] = await datastore.runQuery(query);
			let list = userRes.map(user => ({id: user[datastore.KEY]["id"], username: user.username}));

			res.status(200).send(JSON.stringify({result:list}));
		}else{
			res.status(400).send(JSON.stringify({error: "User already exists"}));
		}

	
	}

	async function deleteUser() {
		userId = Number(req.body.userId);
		const userKey = datastore.key(['user', userId]);
		await datastore.delete(userKey);

		res.status(200).send("deleted");
  	}

  	async function modifyUser() {
  	 	let userId = req.body.userId;
  	 	let usernameValue = req.body.username;
	    const transaction = datastore.transaction();
	    const userKey = datastore.key(['user', userId]);
	    try {
	      await transaction.run();
	      const [user] = await transaction.get(userKey);
	      user.username = usernameValue;
	      transaction.save({
	        key: userKey,
	        data: user,
	      });
	      await transaction.commit();
	      res.status(200).send("modified")
	    } catch (err) {
	      await transaction.rollback();
	      throw err;
	    }
    }

	switch (req.method) {
		case 'GET':
			listUsers();
			break;
		case 'POST':
			addUser();
			break;
		case 'DELETE':
  			deleteUser();
			break;
		case "PUT":
			modifyUser();
			break;
		default:
			listUsers();
			break;
	}

};


