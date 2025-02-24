

const loadJSON=() =>{
const xhr = new XMLHttpRequest();
xhr.open('GET','./data/pokedex.json',true);

xhr.onload = function (){
    if(xhr.status === 200){
         let jsonData = JSON.parse(xhr.responseText);
        return jsonData;
    }else {
        console.error('Error loading Json');
    }
};

xhr.onerror = function (){
    console.error('JSON request failed')
}

xhr.send();

}

let data = loadJSON();

module.exports = {
   data
  };
  
