

const jsonHandler = require('./loadJson.js');

const pokeObj = jsonHandler.data
const URL = require('url');



const readURL = (request) => {

    let obj = URL.parse(request.url, true).query;
    return obj;


}
const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });


    if (request.method !== 'HEAD' && status !== 204) {
        response.write(content);
    }
    response.end();
};

let shortForm = (obj) => {
    return {
        num: obj.num,
        name: obj.name,
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

    if (filterType === "id") {
        value = parseInt(value)
    }
    let newJson = pokeObj.filter(obj => {
        // console.log(obj[filterType])
        // console.log(typeof obj[filterType])
        obj[filterType]
        if (obj[filterType] == value) {
            return (obj);
        }

    })


    if (newJson.length !== 0 && newJson) {
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
        message: 'Name or id required.',
    };

    const input = readURL(request);

   // console.log(input.type + " and " + input.value)

    if (!input.type || !input.value) {
        responseJSON.id = 'Error';
        return respondJSON(request, response, 400, responseJSON);
    }

    let responseCode = 200;
    responseJSON = showPokemon(input.type, input.value)

    if (!responseJSON) {
        let newResponseJSON = {
            id: 'No content',
            message: "No Pokemon with paramers"
        }
        return respondJSON(request, response, 204, newResponseJSON);
    }
   // console.log(responseJSON)
    return respondJSON(request, response, responseCode, responseJSON);

}

//return pokemon evolution family showing each family members from the next evolution property

const getPokeLife = (request, response) => {


    let pokeFamily = [];

    let responseJSON = {
        message: 'Name or id required.',
    };

    const input = readURL(request);
    let filterType = input.type
    let value = input.value
    //console.log(input.type + " and " + input.value)

    if (!input.type || !input.value) {
        responseJSON.id = 'Error';
        return respondJSON(request, response, 400, responseJSON);
    }


    let starterPokemon = showPokemon(filterType, value);
    if (!starterPokemon) {
        let newResponseJSON = {
            id: 'No content',
            message: "No Pokemon with paramers"
        }
        return respondJSON(request, response, 204, newResponseJSON);
    }
    starterPokemon = starterPokemon[0]

    //console.log(starterPokemon)
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

    const input = readURL(request);

    let responseJSON = {};


    if (!input) {
        responseJSON.id = 'InternalError';
        return respondJSON(request, response, 500, responseJSON);
    }

    let typeFamily = [];


    pokeObj.forEach(pokemon => {
        if (pokemon.type.some(type => type === input.value)) {
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
        message: ' a unique 3 digit Number, name, image link, and type are all required.',
    };
    const input = request.body;
    const { num, name, img, type } = input
    //console.log(num, name, img, type)

    if (!num || !name || !img || !type) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }
    

    pokeObj.forEach(pokemon => {
        if (pokemon.id == num) {
            isValid = false
        }
    })

    if (isValid) {
        pokeObj.push({
            id: parseInt(num),
            num: num,
            name: name,
            img: img,
            type: type
        })
        responseJSON.id = "Created"
        responseJSON.message = `Success ${name} added to the Pokedex`;
        return respondJSON(request, response, 201, responseJSON);
    } else {
        responseJSON.id = 'ID already Used';
        return respondJSON(request, response, 400, responseJSON);
    }
}

// change an image of a pokemon must be a valid image link 
const changeImage = (request, response) => {
    let isValid = false;
    let pokeRefNum
    let responseJSON = {
        message: 'missing params',
    };


    const input = request.body;
    const { inputType, value, link } = input
    //console.log(inputType);

    if (!inputType || !value || !link) {
        responseJSON.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }
    pokeObj.forEach((pokemon) => {
        if (pokemon[inputType] == value) {
            isValid = true
            pokeRefNum = pokemon.num
            pokemon.img = link;
        }
    })

   // console.log("vlaid" + isValid)

    if (isValid) {
        
        responseJSON.id = "Created"
        responseJSON.message = `Success pokemon ${pokeRefNum}'s image was updated`;
        return respondJSON(request, response, 201, responseJSON);
    }    
        responseJSON.id = 'No content'
        responseJSON.message =  "No Pokemon with paramers"
    
   //    console.log("hehe")
    return respondJSON(request, response, 204, responseJSON);
}



module.exports = {
    getAllPokemon,
    getPokemon,
    getPokeLife,
    getType,
    addPokemon,
    changeImage
};