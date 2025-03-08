
const jsonHandler = require('./loadJson.JS');

const pokeObj = jsonHandler.data

const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });

    // HEAD requests don't get a body with their response.
    // Similarly, 204 status codes are "no content" responses
    // so they also do not get a response body.
    if (request.method !== 'HEAD' && status !== 204) {
        response.write(content);
    }
    response.end();
};

let shortForm = (obj) => {
    return {
        num: obj.num,
        name: obj.name,
        img: obj.img,
        type: obj.type
    }
}


//return all data showing poke: id,name.img,type
const getAllPokemon = (request, response) => {

    return respondJSON(request, response, 200, pokeObj.map(obj => shortForm(obj))
    );
}

//return an pokemon object showing: num, name, igm, type,height,weight and next evolutions(bool)

const showPokemon = (filterType, value) => {

    let newJson = pokeObj.filter(obj => { obj[filterType] == value })


    if (newJson.length !== 0) {
        newJson = newJson.map(obj =>
            obj = {
                num: obj.num,
                name: obj.name,
                img: obj.img,
                type: obj.type,
                height: obj.height,
                weight: obj.weight,
                next_evolution: obj.next_evolution

            });
    } else {
        newJson = null;
    }
    return newJson
}



const getPokemon = (request, response) => {

    let responseJSON = {
        message: 'Name or 3 digit id required.',
    };

    const { requestType, value } = request.body;

    if (!requestType || !value) {
        responseJSON.id = 'Error';
        return respondJSON(request, response, 500, responseJSON);
    }

    let responseCode = 200;

    responseJSON = showPokemon(requestType, value)

    return respondJSON(request, response, responseCode, responseJSON);

}

//return pokemon evolution family showing each family members from the next evolution property

const getPokeLife = (request, response) => {
    const { filterType, value } = request.body;

    let responseJSON = {
        message: 'Name or 3 digit id required.',
    };

    let pokeFamily = [];

    if (!filterType || !value) {
        responseJSON.id = 'Error';
        return respondJSON(request, response, 500, responseJSON);
    }

    let starterPokemon = showPokemon(filterType, value);
    //check for start of evolution


    pokeObj.forEach(pokemon => {
        if (pokemon.next_evolution)
            if (pokemon.next_evolution.some(evolveObj => evolveObj.num === starterPokemon.num)) {
                pokeFamily.push(showPokemon("num", pokemon.num));
            };
    });

    // add base of evolution
    pokeFamily.push(starterPokemon);
    // check for decendants 
    if (starterPokemon.next_evolution) {
        starterPokemon.next_evolution.forEach(obj => {
            pokeFamily.push(showPokemon("num", obj.num));
        }
        )
    }

    if (pokeFamily == []) {
        responseJSON.id = 'internalError';
        return respondJSON(request, response, 500, responseJSON);
    }

    return respondJSON(request, response, 200, pokeFamily);


}





//return list of pokemon with the matching type 
const getType = (request, response) => {

    const { poketype } = request.body;

    let responseJSON = {};


    if (!poketype) {
        responseJSON.id = 'InternalError';
        return respondJSON(request, response, 500, responseJSON);
    }

    let typeFamily = [];


    pokeObj.forEach(pokemon => {
        if (pokemon.type.some(type => type === poketype)) {
            typeFamily.push(shortForm(pokemon));
        }
    });



    if (typeFamily == []) {
        responseJSON.id = 'internalError';
        return respondJSON(request, response, 500, responseJSON);
    }

    return respondJSON(request, response, 200, typeFamily);

}


// Add a pokemon to the list of pokemon must include: num, name, img, type,height and weight
const addPokemon = (request, response) => {
    let isValid = true;
    let responseJSON = {
        message: ' a unique 3 digit Number, name, image link, type, height, and weight are all required.',
    };

    const { number, name, img, type, height, weight } = request.body;

    if (!number || !name || !img || !type || !height || !weight) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }


    pokeObj.forEach(pokemon => {
        if (pokemon.num == number)
            isValid = false
    })
    if (isValid) {
        pokeObj.push({
            num: number,
            name: name,
            img: img,
            type: type,
            height: height,
            weight: weight
        })

        responseJSON.id = `Success ${name} added to the Pokedex`;
        return respondJSON(request, response, 200, responseJSON);
    } else {
        responseJSON.id = 'ID already Used';
        return respondJSON(request, response, 400, responseJSON);
    }
}

// change an image of a pokemon must be a valid image link 
const changeImage = (request, response) => {
    let isValid = true;
    let responseJSON = {
        message: 'must be a valid link',
    };
    const { number, link } = request.body;
    if (!link|| number) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }
    pokeObj.forEach(pokemon => {
        if (pokemon.num == number)
            isValid = false
            pokemon.img = link;
    })
    if (isValid){        
        responseJSON.id = `Success pokemon ${number}'s image was updated`;
        return respondJSON(request, response, 200, responseJSON);
    } else {
        responseJSON.id = 'Number does not exist';
        return respondJSON(request, response, 400, responseJSON);
    }
}



module.exports = {
    getAllPokemon,
    getPokemon,
    getPokeLife,
    getType,
    addPokemon,
    changeImage
};