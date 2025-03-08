const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const errorHandler = require('./errorResponse.js');
const jsonHandler = require('./jsonRequests.js')
const port = process.env.PORT || process.env.NODE_PORT || 3000;


const parseBody = (request, response, handler) => {
  body =[]

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
    request.body = query.parse(bodyString);
    handler(request, response);
  });
}
const handlePost = (request, response, parsedUrl) => {
  // If they go to /addUser
  if (request.url === '/addPokemon') {
    
    parseBody(request, response, jsonHandler.addPokemon);
  }
  if (request.url === '/changeImage') {
  
    parseBody(request, response, jsonHandler.changeImage);
  }
};

const handleGet =(request, response, parsedUrl) =>{
 switch (request.url) {
    case '/':
      htmlHandler.getIndex(request, response);
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
 
 if (request.method === 'POST') {
  handlePost(request, response);
} else {
  handleGet(request, response);
}
};




http.createServer(onRequest).listen(port, () => {
 // console.log(`Listening on 127.0.0.0:${port}`);
});
