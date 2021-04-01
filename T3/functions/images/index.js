const escapeHtml = require('escape-html');

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */

  // Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const visionClient = new vision.ImageAnnotatorClient();

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client using Application Default Credentials
const storage = new Storage();

const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore({
	projectId: 'simplechat-308917',
	keyFilename: 'simplechat-308917-c1625338d8e8.json'
});

const kindName = 'image';

// Creates a client from a Google service account key
// const storage = new Storage({keyFilename: 'key.json'});

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// The ID of your GCS bucket
const bucketName = 'simplechat';

async function listBucket(callback) {
	var baseURL = "https://storage.googleapis.com/simplechat/";

    // Lists files in the bucket
    const [files] = await storage.bucket(bucketName).getFiles();

    var images = [];

    files.forEach(file => {
      images.push(baseURL + file.name);
    });

    return images;
}

async function getLabels(image){
	// Performs label detection on the image file
	var [visionLabels] = await visionClient.labelDetection(image);
	var labels = visionLabels.labelAnnotations;

	var result = [];

	labels.forEach((label) => {
		result.push(label.description);
	});

	return result;
}

async function getAllLabels(list){

	var result = [];

	// list = [list[0]];

	for(var image of list){
		var labels = await getLabels(image);
		result.push({"image_src" : image, "labels" : labels});
	}

	return result;
}

async function getImages(){

	var res = await listBucket().then((images) => {

		return getAllLabels(images).then((result) => {
			return result;
		});

	});

	return res;
}

async function searchByLabel(string){

	string = string.toLowerCase().trim();

	const query = datastore.createQuery('image');

	const [images] = await datastore.runQuery(query);

	var results = [];

	for(var image of images){
		let image_labels = image.labels;
		
		for(var label of image_labels.labels){
			label = label.toLowerCase().trim();

			if(label === string){
				results.push(image.url);
				break;
			}
		}
	}

	return results;
}

async function saveLabels(){

	var images = await getImages().then((result) => {
		return result;
	});

	for(var image of images){
		datastore
		.upsert({
			key: datastore.key(kindName),
			data: {
				url: image.image_src,
				labels: {labels : image.labels},
			}
		})
		.catch(err => {
			console.error('ERROR:', err);
		});	
	}

}

exports.images = (req, res) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	res.setHeader('Content-Type', 'application/json');
	
	if(req.query.label){
		searchByLabel(req.query.label).then((results) => {
			var output = {};
			output['results'] = results;
			res.end(JSON.stringify(output));
		});
	}else if(req.query.save){
		saveLabels().then(() => {
			var output = {};
			output.success = 'True';
			res.end(JSON.stringify(output));
		});
	}else{
		var output = {};
		output['results'] = []
		res.end(JSON.stringify(output));
	}

};
