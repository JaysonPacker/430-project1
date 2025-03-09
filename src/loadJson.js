
const fs = require('fs');

const json = fs.readFileSync(`${__dirname}/../data/pokedex.json`);



const loadJSON = () => {
   // console.log(JSON.parse(json))
   return JSON.parse(json)

}

let data = loadJSON();

module.exports = {
    data
};

