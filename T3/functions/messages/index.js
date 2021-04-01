const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'simplechat-308917',
	keyFilename: 'simplechat-308917-4ef087404854.json'
});

const kindName = 'message';
exports.messages = (req, res) => {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Content-Type', 'application/json');

	async function listMessages() {
		let id1 = req.query.id1 || 0;
		let id2 = req.query.id2 || 0;
		const query = datastore.createQuery(kindName).order('date');
		const [messages] = await datastore.runQuery(query);
		res.status(200).send(JSON.stringify(
			{
				results: messages.filter(msg => (msg.sender == id1 && msg.receiver == id2) || (msg.sender == id2 && msg.receiver == id1))
			}
		));
	}

	function addMessage(){
		let senderData = req.body.sender || 0;
		let receiverData = req.body.receiver || 0;
		let textData = req.body.text || '';
		let isImageData = req.body.isImage || false;


	datastore.save({
      key: datastore.key(kindName),
      data:  {
      	date: new Date(),
        sender : datastore.int(senderData),
      
      receiver : datastore.int(receiverData),
      
        text : textData,
        seen: false,
        isImage: isImageData
      }
    })
		.catch(err => {
		    console.error('ERROR:', err);
		    res.status(500).send(err);
		    return;
		});

		res.status(200).send(JSON.stringify({success: "True"}));
	
	}

	async function deleteMessage() {
		messageId = Number(req.body.messageId);
		const messageKey = datastore.key(['message', messageId]);
		await datastore.delete(messageKey);

		res.status(200).send("deleted");
  	}

  	async function modifyMessage() {
  	 	let messageId = req.body.messageId;
  	 	let textData = req.body.text;
	    const transaction = datastore.transaction();
	    const messageKey = datastore.key(['message', messageId]);
	    try {
	      await transaction.run();
	      const [message] = await transaction.get(messageKey);
	      message.text = textData;
	      transaction.save({
	        key: messageKey,
	        data: message,
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
			listMessages();
			break;
		case 'POST':
			addMessage();
			break;
		case 'DELETE':
  			deleteMessage();
			break;
		case "PUT":
			modifyMessage();
			break;
		default:
			listMessages();
			break;
	}


	
};


