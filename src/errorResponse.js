// sends a json object
const respond = (request, response, type, status, content) => {
  response.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  // write the content string or buffer to response
  response.write(content);
  // send the response to the client
  response.end();
};

const getResponse = (request, response, status) => {
  const content = {};

  switch (status) {
    case 200:
      content.message = 'This is a successful response';
      break;
    case 400:
      content.message = 'Missing Valid query set to true';
      content.id = 'badRequest';
      break;
    case 401:
      content.message = 'Missing Valid login query set to yes';
      content.id = 'unauthorized';
      break;
    case 403:
      content.message = "You don't have access";
      content.id = 'forbidden';
      break;
    case 404:
      content.message = "The page your're looking for is not found";
      content.id = 'notFound';
      break;
    case 500:
      content.message = 'Something went wrong';
      content.id = 'internalError';
      break;
    case 501:
      content.message = "A get request hasn't been implemented for this page";
      content.id = 'notImplemented';
      break;
    default:
      content.message = "The page your're looking for is not found";
      content.id = 'notFound';
      break;
  }
  const acceptedTypes = request.headers.accept.split(',');

  if (acceptedTypes[0] === 'text/xml') {
    // create a valid XML string with name and age tags.
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${content.message}</message>`;
    if (content.id) { responseXML = `${responseXML} <id>${content.id}</id>`; }
    responseXML = `${responseXML} </response>`;

    // return response passing out string and content type
    return respond(request, response, 'text/xml', status, responseXML);
  }

  const contentString = JSON.stringify(content);

  return respond(request, response, 'application/json', status, contentString);
};

module.exports = {
  getResponse,
};
