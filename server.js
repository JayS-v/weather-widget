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

const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/weather/location', async (req, res) => {
    try {
        const cityName = req.query.city;
        if (!cityName) throw new Error('City name required');

        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${process.env.OPEN_CAGE_API_KEY}`);
        if (!response.ok) throw new Error('Error fetching location data');

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/weather/current', async (req, res) => {
    try {
        const lat = req.query.lat;
        if (!lat) throw new Error('Latitude is required');

        const lon = req.query.lon;
        if (!lon) throw new Error('Longitude is required');

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Error fetching current weather data');

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/weather/forecast', async (req, res) => {
    try {
        const lat = req.query.lat;
        if (!lat) throw new Error('Latitude is required');

        const lon = req.query.lon;
        if (!lon) throw new Error('Longitude is required');

        const response = await fetch(`http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Error fetching forecast weather data');

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;