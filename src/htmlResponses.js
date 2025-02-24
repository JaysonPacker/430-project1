const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const getPage = (request, response, page, type) => {
  response.writeHead(200, { 'Content-Type': type });
  response.write(page);
  response.end();
};

const getIndex = (request, response) => {
  getPage(request, response, index, 'text/html');
};

const getCSS = (request, response) => {
  getPage(request, response, css, 'text/html');
};

module.exports = {
  getIndex,
  getCSS,
};
