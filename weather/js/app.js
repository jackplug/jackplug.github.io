const api = 'http://api.weatherstack.com/current';
const apiKey = '#################';
const weatherInfoContainer = document.getElementById('weatherInfo');

let defaultLocation = 'Zelenec,Czech Republic';

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
    let weatherIcons = '';
    let weatherDescription = '';
    let uvInfo = '';
    let uvDescriptions = {
        'Low': 'Wear sunglasses. If there is snow on the ground that reflects UV radiation or if you have particularly fair skin, use a protective cream.',
        'Medium': 'Wear sunglasses and protective headwear. Stay in the shade at noon when the sun is strongest.',
        'High': 'Use sunscreen with a UV factor of 30+, in addition to weating sunglasses and protective headwear. Stay in the shade at noon when the sun is strongest.',
        'Very High': 'Wear sunscreen with a protection factor of 30+, andwear T-shirts, sunglasses and a hat. Don\'t stay in the sun for too long.',
        'Extreme': 'Take maximum precautions: wear sunglasses and apply a sunscreen with a protection factor of 30. Wear a long-sleeved shirt and trousers, cover your head with a wide-brimmed hat. Avoid the sun from noon until at least 3pm.'
    }
    let uvIndex = {
        0: {
            burn_risk: 'Low',
            recommended_protection: uvDescriptions['Low']
        },
        1: {
            burn_risk: 'Low',
            recommended_protection: uvDescriptions['Low']
        },
        2: {
            burn_risk: 'Low',
            recommended_protection: uvDescriptions['Low']
        },
        3: {
            burn_risk: 'Medium',
            recommended_protection: uvDescriptions['Medium']
        },
        4: {
            burn_risk: 'Medium',
            recommended_protection: uvDescriptions['Medium']
        },
        5: {
            burn_risk: 'Medium',
            recommended_protection: uvDescriptions['Medium']
        },
        6: {
            burn_risk: 'High',
            recommended_protection: uvDescriptions['High']
        },
        7: {
            burn_risk: 'High',
            recommended_protection: uvDescriptions['High']
        },
        8: {
            burn_risk: 'Very High',
            recommended_protection: uvDescriptions['Very High']
        },
        9: {
            burn_risk: 'Very High',
            recommended_protection: uvDescriptions['Very High']
        },
        10: {
            burn_risk: 'Very High',
            recommended_protection: uvDescriptions['Very High']
        },
        10: {
            burn_risk: 'Extreme',
            recommended_protection: uvDescriptions['Extreme']
        }
    }

    if (data.current.weather_icons.length) {
        data.current.weather_icons.forEach(icon => {
            weatherIcons += `<img src="${icon}" alt="">`;
        })
    }

    if (data.current.weather_descriptions.length) {
        data.current.weather_descriptions.forEach((description, index) => {
            weatherDescription += `<span>${description}</span>`;

            if (index + 1 < data.current.weather_descriptions.length) {
                weatherDescription += '<br>';
            }
        })
    }

    if (data.current.uv_index > 11) {
        data.current.uv_index = 11;
    }

    let htmlSegment = `<h2>Current weather for ${data.location.name}, ${data.location.region}, ${data.location.country}, last observed at ${data.current.observation_time}</h2>
                        <p>${weatherIcons} - ${weatherDescription}</p>
                        <p>Temperature is ${data.current.temperature}&deg;C, feeling like ${data.current.feelslike}&deg;C</p>
                        <p>The wind speed is ${data.current.wind_speed}k/h, in a ${data.current.wind_dir} direction.</p>
                        <p>Current UV burn risk is rated '${uvIndex[data.current.uv_index].burn_risk}'. ${uvIndex[data.current.uv_index].recommended_protection} (information provided by <a href="https://www.meteogram.cz/uv-index/">Meteogram.cz</a>/</a>)</p>`;

    weatherInfoContainer.innerHTML = htmlSegment;
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
