# Weather Widget Application
![Repo Size](https://img.shields.io/github/repo-size/JayS-v/weather-widget)

## Description
This repository contains the **backend** and **frontend** code for a lightweight weather widget application built with **vanilla JavaScript/Node.js without any external dependencies**. 

The backend server provides weather data and location services, while the frontend displays the current and future weather for a specified location. 

## Table of Contents

- [Frontend](#frontend)
- [Backend Endpoints](#backend-api-endpoints)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## Frontend

1. Navigate to `http://localhost:8000` in your web browser.
2. Enter a city name in the input field to get the current weather and the weather forecast for the next 16 days

You can also test it here: [https://my-weather-widget.vercel.app](https://my-weather-widget.vercel.app)

![Weather widget screen](https://api.jayseyidov.com/weather-widget-frontend/weather-widget-screen.gif)

## Backend API Endpoints
The backend server provides the following API endpoints. 

- `GET /weather/location?city=<cityName>`: Fetches the location coordinates for the specified city.
- `GET /weather/current?lat=<latitude>&lon=<longitude>`: Fetches the current weather data for the specified coordinates.
- `GET /weather/forecast?lat=<latitude>&lon=<longitude>`: Fetches the weather forecast for the next 16 days for the specified coordinates.

**These can be tested on my deployed application** at [https://my-weather-widget.vercel.app](https://my-weather-widget.vercel.app) : 

Example Request:
```
https://my-weather-widget.vercel.app/weather/current?lat=51.5074&lon=-0.1278
```

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/JayS-v/weather-widget.git 
    cd weather-widget-backend
    ```

2. Create a `.env` file in the root directory and add your API keys. Refer to the [Environment Variables](#environment-variables) section for the required variables. 

3. Start the server:

    ```bash
    npm start
    ```

The server will start on `http://localhost:8000`.

## Project Structure
- `server.js`: The main backend server script.
- `frontend/`: Contains the frontend code for the weather widget.
  - `index.html`: The HTML file for the frontend.
  - `main.js`: The JavaScript file for frontend interactions.
  - `style.css`: The CSS file for styling the frontend.


## Environment Variables
Create a `.env` file in the root directory based on the provided `.env.example`. To use the weather and location services, you will need API keys from [OpenCage Data](https://opencagedata.com) and [OpenWeatherMap](https://openweathermap.org). 

## Contributing
Contributions are welcome!

## License
This project is licensed under the ISC License. See the `LICENSE` file for more details.
