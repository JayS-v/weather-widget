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

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

class WeatherServer {
    constructor(port) {
        this.port = port;
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }

    async handleRequest(req, res) {
        const reqUrl = new URL(req.url, `http://${req.headers.host}/`);
        const method = req.method;

        if (reqUrl.pathname.startsWith('/weather')) {
            this.handleWeatherAPI(reqUrl, method, res);
        } else {
            this.serveStaticFiles(reqUrl.pathname, res);
        }
    }

    async handleWeatherAPI(reqUrl, method, res) {
        if (reqUrl.pathname === '/weather/location' && method === 'GET') {
            await this.handleLocationRequest(reqUrl.searchParams, res);
        } else if (reqUrl.pathname === '/weather/current' && method === 'GET') {
            await this.handleCurrentWeatherRequest(reqUrl.searchParams, res);
        } else if (reqUrl.pathname === '/weather/forecast' && method === 'GET') {
            await this.handleForecastRequest(reqUrl.searchParams, res);
        } else {
            this.sendResponse(res, 404, { error: 'Route not found' });
        }
    }

    async handleLocationRequest(searchParams, res) {
        try {
            const cityName = searchParams.get('city')
            if (!cityName) throw new Error('City name required');

            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${process.env.OPEN_CAGE_API_KEY}`);
            if (!response.ok) throw new Error('Error fetching location data');

            const data = await response.json();
            this.sendResponse(res, 200, data);
        } catch (error) {
            this.sendResponse(res, 500, { message: error.message });
        }
    }

    async handleCurrentWeatherRequest(searchParams, res) {
        try {
            const lat = searchParams.get('lat');
            if (!lat) throw new Error('Latitude is required');

            const lon = searchParams.get('lon')
            if (!lon) throw new Error('Longitude is required');


            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
            if (!response.ok) throw new Error('Error fetching current weather data');

            const data = await response.json();
            this.sendResponse(res, 200, data);
        } catch (error) {
            this.sendResponse(res, 500, { error: error.message });
        }
    }

    async handleForecastRequest(searchParams, res) {
        try {
            const lat = searchParams.get('lat');
            if (!lat) throw new Error('Latitude is required');

            const lon = searchParams.get('lon')
            if (!lon) throw new Error('Longitude is required');

            const response = await fetch(`http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
            if (!response.ok) throw new Error('Error fetching forecast weather data');

            const data = await response.json();
            this.sendResponse(res, 200, data);
        } catch (error) {
            this.sendResponse(res, 500, { error: error.message });
        }
    }

    serveStaticFiles(pathname, res) {
        if (pathname === '/') {
            pathname = 'index.html';
        }

        const filePath = path.join(__dirname, 'frontend', pathname);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.sendResponse(res, 404, { error: 'Route not found' });
            } else {
                const contentType = this.getContentType(filePath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }

    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    getContentType(filePath) {
        const extname = path.extname(filePath);
        switch (extname) {
            case '.html':
                return 'text/html';
            case '.css':
                return 'text/css';
            case '.js':
                return 'text/javascript';
            case '.json':
                return 'application/json';
            case '.png':
                return 'image/png';
            case '.jpg':
                return 'image/jpg';
            default:
                return 'text/plain';
        }
    }
}

const weatherServer = new WeatherServer(PORT);
weatherServer.start();