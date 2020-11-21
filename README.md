# weather-dashboard
Weather.com Clone using Mapbox and OpenWeather APIs

Based on the Weather.com website, this is a project working with APIs and DOM manipulation.
The application takes a user inputted location, and displays current weather data, hourly weather data (for 12 hours), and weekly weather data (for 7 days).

The user input is converted to longitude and latitude using the Mapbox API. Those coordinates are used to fetch the weather data from the OpenWeatherMap API. This is all coded asychronously using async/await with promises.
