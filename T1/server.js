var http = require('http');
var https = require('https');
var fs = require('fs')
var querystring = require('querystring');
const { randomInt } = require('crypto');
var logs = []
var apiKey = "whyisthishere"
http.createServer(function (req, res) {
    
	if(req.url == '/'){
		res.writeHead(200, {'Content-Type': 'text/html'});
		html = fs.readFileSync('./index.html')
		res.write(html)
		res.end();
	}
	else{
        if(req.url == '/api/'){
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200, {'Content-Type': 'application/json'});
            var title1 = ""
            var randTitle1 = ""
            var startTime = Date.now();
            // service 1
            apiKey = JSON.parse(fs.readFileSync('apiKey.json').toString())["key"]
            const postData = JSON.stringify({
                "jsonrpc": "2.0",
                "method": "generateIntegers",
                "params": {
                    "apiKey": apiKey,
                    "n": 1,
                    "min": 0,
                    "max": 5,
                    "replacement": false,
                    "base": 10
                },
                "id": 32189
            });
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
              };
            const req2 = https.request('https://api.random.org/json-rpc/2/invoke', options, (res2) => {
                let data1 = '';

                // A chunk of data has been received.
                res2.on('data', (chunk1) => {
                  data1 += chunk1;
                });
                res2.on('end', function () {
                    var randInt = JSON.parse(data1);

                    //service 2
                    const req3 = https.get('https://swapi.dev/api/films/', (res3) => {
                        var data = '';

                        // A chunk of data has been received.
                        res3.on('data', (chunk) => {
                          data += chunk;
                        });
                        res3.on('end', function () {
                            films = JSON.parse(data);
                            title1 = films['results'][randInt['result']['random']['data'][0]]['title'];
                            // console.log(title1)

                            // service 3
                            const postData3 = JSON.stringify({
                                    "jsonrpc": "2.0",
                                    "method": "generateStrings",
                                    "params": {
                                    "apiKey": apiKey,
                                    "n": 1,
                                    "length": title1.length,
                                    "characters": title1,
                                    "replacement": false
                                },
                            "id": 8573
                            });
                            const options3 = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': postData3.length
                                }
                              };
                            const req4 = https.request('https://api.random.org/json-rpc/2/invoke', options3, (res4) => {
                                let data3 = '';

                                // A chunk of data has been received.
                                res4.on('data', (chunk) => {
                                  data3 += chunk;
                                });
                                res4.on('end', function () {
                                    
                                        randTitle = JSON.parse(data3);
                                        randTitle1 += randTitle['result']['random']['data'][0];
                                        // console.log(randTitle1);

                                        res.on('finish',()=>{
                                            latency = (Date.now() - startTime)/1000;
                                            logs.push({"request": req, "response": res, "latency": latency})
                                            // fs.readFile('logs.json', function(err, data4) {
                                            //     if (err) throw err;
                                            //     data4 = JSON.parse(data4)
                                            //     data4.push({"response": {"title": title1, "rand": randTitle1}, "latency": latency})
                                            //     fs.writeFile("logs.json", JSON.stringify(data4), (err) => {
                                            //         if (err) throw err;
                                            //     })
                                            // })
                                        })
                                        res.write(JSON.stringify({"title": title1, "rand": randTitle1}));
                                        res.end();
                                })
                            
                            })
                            req4.on('error', (e) => {
                                console.error(`problem with request: ${e.message}`);
                            });
                            req4.write(postData3);
                            req4.end();

                        });
                    })
                    req3.on('error', (e) => {
                        console.error(`problem with request: ${e.message}`);
                    });
                    
                });
            
            })
            req2.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            req2.write(postData);
            req2.end();
        }
		if(req.url == '/metrics/'){
				fs.readFile('logs.json', function(err, data) {
			    if (err) throw err;
			    res.write(JSON.stringify(JSON.parse(data)))
                res.end()
                });	
                //console.log(logs)
				
        }
	}
}).listen(8080);