const api = 'http://api.weatherstack.com/current';
const apiKey = '#################';

let defaultLocation = 'Zelenec,Czech Republic';
let callback = 'callback=processData';

navigator.geolocation.getCurrentPosition(setLocation, locationError);

function doFetch(location) {
    fetch(api + '?access_key=' + apiKey + '&query=' + location + '&units=m', {
        credentials: 'omit'
    })
    .then(response =>  response.json())
    .then(data => processData(data))
    .catch((error) => {
        console.error('Error:', error);
    });
}

function processData(data) {
    console.log('PROCESSDATA--------------------');
    console.log(data);
    console.log('--------------------PROCESSDATA');
}

function setLocation(position) {
    console.log(position.coords.latitude + ',' + position.coords.longitude);
    doFetch(position.coords.latitude + ',' + position.coords.longitude);
}

function locationError() {
    // retrun
    // alert('Browser geolocation failed. Using default values of "' + location + '"');
    console.log(defaultLocation);
    doFetch(defaultLocation);
}
