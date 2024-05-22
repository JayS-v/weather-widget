/*
ISC License

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const input = document.querySelector('[data-widget-input="city-name-input"]');

input.addEventListener('input', () => {
    const cityName = input.value.trim().toLowerCase();
    guessUserChoice(cityName);
})

const removeAutocomplete = () => {
    const autocompleteProposals = document.querySelectorAll('.autocomplete-proposal');
    const autocompleteModalWrapper = document.querySelector('.autocomplete-modal-wrapper');

    if(autocompleteProposals.length > 0) {
        autocompleteProposals.forEach(
            autocomplete => autocomplete.remove()
        )
    }

    if(autocompleteModalWrapper) {
        autocompleteModalWrapper.parentNode.removeChild(autocompleteModalWrapper);
    }
}

const guessUserChoice = async (cityName) => {
    removeAutocomplete();

    const newDiv = document.createElement('div');
    newDiv.className = 'autocomplete-modal-wrapper';
    input.parentNode.appendChild(newDiv);

    if (cityName.length >= 3) {
        try {
            const server = 'https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json';
            const response = await fetch(server);
            const responseResult = await response.json();
            const matchingCities = responseResult.filter(city => city.name.toLowerCase().startsWith(cityName))

            const autocompleteTemplate = (city) => `<button class='autocomplete-proposal autocomplete-modal' onclick ='clickAutocompleteHandler(event)' style="min-height:45px">${city}</button>`
            const autocompleteTemplateError = (city) => `<div class='autocomplete-proposal'>Sorry, there is no <span style="color:red">"${city}"</span> in our database</div>`

            if(matchingCities.length > 0) {
                let matchingCityNames = matchingCities.map(city => city.name)
                
                if(matchingCityNames.length > 4) {
                    matchingCityNames = matchingCityNames.slice(0, 5)
                } 

                matchingCityNames.forEach((city) => {
                        // console.log(city)
                        newDiv.insertAdjacentHTML('beforeend', autocompleteTemplate(city));
                        newDiv.style = 'display: flex; flex-direction: column'
                });

            } else {
                newDiv.innerHTML = autocompleteTemplateError(cityName);
                // newDiv.innerHTML = autocompleteTemplate(cityName); 
            }

        } catch(error) {
            console.log('hey! here is an error:' + error)
        }

    } 
}

const clickAutocompleteHandler = async (event) => {
    removeAutocomplete();

    input.value = event.target.textContent;
    const cityName =  input.value

    try {
        const cityLocation = await getLocation(cityName);
        const cityWeather = await loadWeather(cityLocation);
        renderWeather(cityName, cityWeather);
    } catch (error) {
        console.error('hey! here is an error:' + error);
    }
}

const getLocation = async (cityName) => {
    const server = `/weather/location?city=${encodeURIComponent(cityName)}`
    const response = await fetch(server, {
        method: 'GET',
    });
    const responseResult = await response.json();
   
    if(response.ok) {

        const location = {
            latitude: 'latitude',
            longitude: 'longitude',
        }

        location.latitude = responseResult.results[0].geometry.lat;
        location.longitude = responseResult.results[0].geometry.lng;
    
        return location;

    } else {
        throw new Error('Error loading location');
    }
}

const loadWeather = async (cityLocation) => {
    if (!cityLocation || !cityLocation.latitude || !cityLocation.longitude) {
        throw new Error('Invalid city location data');
    }

    try { 
        const cityLatitude = cityLocation.latitude;
        const cityLongitude = cityLocation.longitude;

        const cityWeather = {
            currentWeather : {},
            weatherNextDays: [],
        }

        const serverCurrentWeather = `/weather/current?lat=${cityLatitude}&lon=${cityLongitude}`;
        const serverFutureWeather = `/weather/forecast?lat=${cityLatitude}&lon=${cityLongitude}`;

        const [currentWeatherResponse, futureWeatherResponse] = await Promise.all([
            fetch(serverCurrentWeather, { method: 'GET' }),
            fetch(serverFutureWeather, { method: 'GET' })
        ]);

        if(currentWeatherResponse.ok || futureWeatherResponse.ok) {
            const currentWeatherResult = await currentWeatherResponse.json();
            const futureWeatherResult = await futureWeatherResponse.json();

            const getCurrentWeather = () => {
                const currentWeatherData = {
                    currentTemperature: 0, 
                    feelsLike: 0,
                    temperatureMax: 0,
                    temperatureMin: 0,
                    weatherDescribtion: 'weatherDescribtion',
                    weatherIconLink: 'weatherIconLink',
                }
    
                currentWeatherData.currentTemperature = Math.round(currentWeatherResult.main.temp);
                currentWeatherData.feelsLike = Math.round(currentWeatherResult.main.feels_like);
                currentWeatherData.temperatureMax =  Math.round(currentWeatherResult.main.temp_max);
                currentWeatherData.temperatureMin = Math.round(currentWeatherResult.main.temp_min);
                currentWeatherData.weatherDescribtion = currentWeatherResult.weather[0].description;
                currentWeatherData.weatherIconLink = `https://openweathermap.org/img/wn/${currentWeatherResult.weather[0].icon}@4x.png`;

                return currentWeatherData;
            }

            const getFutureWeather = () => {
                const eachDayWeather = [];
                const currentDate = new Date();
                const NUM_NEXT_DAYS = 7;

                for (let nextDays = 1; nextDays <= NUM_NEXT_DAYS; nextDays++) {
                   
                    const weatherForEachDay = {
                        weekDay: 'weekDay', 
                        temperatureDay: 0,
                        temperatureNight: 0,
                        weatherDescribtion: 'weatherDescribtion',
                        weatherIconLink: 'weatherIconLink',
                    }

                    const futureDate = new Date(currentDate);
                    futureDate.setDate(currentDate.getDate() + nextDays);

                    weatherForEachDay.weekDay = futureDate.toLocaleDateString('en-US', { weekday: 'short' });
                    weatherForEachDay.temperatureDay = Math.round(futureWeatherResult.list[nextDays].temp.day);
                    weatherForEachDay.temperatureNight = Math.round(futureWeatherResult.list[nextDays].temp.night);
                    weatherForEachDay.weatherDescribtion = futureWeatherResult.list[nextDays].weather[0].description;
                    weatherForEachDay.weatherIconLink = `https://openweathermap.org/img/wn/${futureWeatherResult.list[nextDays].weather[0].icon}@4x.png`;

                    eachDayWeather.push(weatherForEachDay);
                }

                return eachDayWeather;
            }

            cityWeather.currentWeather = getCurrentWeather();
            cityWeather.weatherNextDays = getFutureWeather();

            return cityWeather;

        } else {
            throw new Error('Failed to fetch weather data');
        }
    }  catch (error) {
        console.error('Error:', error.message);
    } 
};

const renderWeather = (city, data) => {
    document.querySelector('.widget-wrapper').style.transform = "none";

    console.log(city)
    console.log(data)

    const renderCurrentWeather = () => {
        const currentWeatherBlock = document.querySelector('[data-widget-info="current-weather-block"]');
        const weatherTemplateDiv = document.querySelector('.current-weather-template');

        if (weatherTemplateDiv) {
            weatherTemplateDiv.parentNode.removeChild(weatherTemplateDiv);
        }

        const currentWeatherTemplate = `  
        <div class="today current-weather-template">
            <div class="today__data">
                <h2 class="today__city">
                    <div class="today__city-name">${city.toUpperCase()}</div>
                    <div class="today__city-temp">${data.currentWeather.currentTemperature}°C</div>
                </h2>
                <div class="today__data-min-max">
                    <p>
                        max: <span>${data.currentWeather.temperatureMax} °C</span>
                    </p>
                    <p>
                        min: <span>${data.currentWeather.temperatureMin} °C</span>
                    </p>
                </div>
            </div>
            <div class="today__description">
                <p>${data.currentWeather.weatherDescribtion}</p>
                <div class="today__image">
                    <img src="${data.currentWeather.weatherIconLink}" alt="city-current-temperature-icon">
                </div>
            </div>
        </div>
        `
        currentWeatherBlock.insertAdjacentHTML('beforeend', currentWeatherTemplate);
        currentWeatherBlock.style = 'padding: 10px'
    }

    const renderFutureWeather = () => {
        const futureWeatherBlock = document.querySelector('[data-widget-info="future-weather-block"]');
        const nextDaysDivs = document.querySelectorAll('.next-days-divs');
        
        if (nextDaysDivs.length > 0) {
            nextDaysDivs.forEach(
                nextDaysDiv => nextDaysDiv.remove()
            )
        }


        data.weatherNextDays.forEach(
            day => {
                const newDiv = document.createElement('div');
                newDiv.className = 'next-days-divs';
                futureWeatherBlock.appendChild(newDiv);
    
                const futureWeatherTemplate = `
                    <div class="next-day-wrapper">
                        <hr>
                        <div class="next-day">
                            <h3 class="next-day__week-day">${day.weekDay}</h3>
                            <div class="next-day__image">
                                <img src="${day.weatherIconLink}" alt="city-current-temperature-icon">
                            </div>
                            <p class="next-day__description">${day.weatherDescribtion}</p>
                            <div class="next-day__day-night">
                                <h4 class="next-day__temp-day">Day <span>${day.temperatureDay} °C</span></h4>
                                <h4 class="next-day__temp-night">Night <span>${day.temperatureNight}°C</span></h4>
                            </div>
                        <div>
                    </div>
                `
                newDiv.innerHTML = futureWeatherTemplate;
            }
        )
    }

    renderCurrentWeather();
    renderFutureWeather();
}