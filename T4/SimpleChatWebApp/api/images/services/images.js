const ImageSearchClient = require('@azure/cognitiveservices-imagesearch');
const CognitiveServicesCredentials = require('@azure/ms-rest-azure-js').CognitiveServicesCredentials;
const config =  require('../config');

const getImages = searchTerm => {
    //instantiate the image search client
    let credentials = new CognitiveServicesCredentials(config.imageSearchKey);
    let imageSearchApiClient = new ImageSearchClient.ImageSearchClient(credentials, {
        endpoint: "https://api.bing.microsoft.com"
    });
    imageSearchApiClient.baseUri = "{Endpoint}/v7.0"
    
    //a helper function to perform an async call to the Bing Image Search API
    const sendQuery = async () => {
        return await imageSearchApiClient.images.search(searchTerm);
    };
    
    return sendQuery().then(imageResults => {
        if (imageResults) {
            let n = imageResults.value.length
            if (n>10) n=10
            let firstNImages = imageResults.value.slice(0,n).map(i=>i.thumbnailUrl);
            return firstNImages;
        }
      })

};

module.exports = {
    getImages
}