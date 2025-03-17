const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const errorHandler = require('./errorResponse.js');
const jsonHandler = require('./jsonRequests.js')
const port = process.env.PORT || process.env.NODE_PORT || 3000;


const parseBody = (request, response, handler) => {
  let body =[]

  request.on('error', (err) => {
    console.log(err)
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = url.parse(bodyString, true).query;
   // console.log("Body:"+ request.body)
   //console.log(request.body);
    handler(request, response);
  });
}


const handlePost = (request, response, parsedUrl) => {
  // If they go to /addUser
  if (parsedUrl.pathname === '/addPokemon') {
    
    parseBody(request, response, jsonHandler.addPokemon);
  }
  if (parsedUrl.pathname === '/changeImage') {
  
    parseBody(request, response, jsonHandler.changeImage);
  }
};

const handleGet =(request, response, parsedUrl) =>{
 switch (parsedUrl.pathname) {
    case '/':
    case '/client.html':
      htmlHandler.getIndex(request, response);
      break;
    case '/client2.html':
      htmlHandler.getPage2(request, response);
      break;
    case '/style.css':
      htmlHandler.getCSS(request, response);
      break;
      case '/getAllPokemon':
        jsonHandler.getAllPokemon(request, response)
        break;
      case '/getPokemon':
         jsonHandler.getPokemon(request, response)
        break;
      case '/getPokeLife':
        jsonHandler.getPokeLife(request, response)
        break;
      case '/getType':
        jsonHandler.getType(request, response)
        break;
         default:
              errorHandler.getResponse(request, response, 404);
              break;
    }
}


const onRequest = (request, response) => {
 
 // console.log("Request:"+request.url)
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  
//console.log(parsedUrl.pathname)
  
if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }


};




http.createServer(onRequest).listen(port, () => {
 //console.log(`Listening on 127.0.0.0:${port}`);
});
