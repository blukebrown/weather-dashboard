/**
 * Weather Dashboard Project
 * Author: Luke Brown
 * Start: November 10, 2020
 * Description: This is a personal portfolio project. The website is
 * a weather dashboard, using data from the OpenWeatherMap API. A user
 * will input information for a location, and the program will fetch 
 * data based on that input. The program will then update the DOM with
 * that data. Inspiration drawn from weather.com
 */

let display = "hourly";

const fetchLocation = async (searchTerm) => {
    try {
        const apiKey = "pk.eyJ1IjoiYmx1a2Vicm93biIsImEiOiJja2hmYnd0YXowMnI3MnJzMWgwdGMzZTB2In0.U4UO6L0XZIGJz-xHaM2xqw";
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?country=US&access_token=${apiKey}`);
        const parsedData = await response.json();
        const location = {};
        location.lon = parsedData.features[0].geometry.coordinates[0];
        location.lat = parsedData.features[0].geometry.coordinates[1];
        location.locationName = parsedData.features[0].place_name;
        return location;
    } catch (err) {
        console.log(err);
    }
}

const fetchWeatherData = async (lon, lat) => {
    try {
        const apiKey = "7fd9361baba7983ea0fa4bdc7fe397ad";
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=&appid=${apiKey}`);
        return await response.json();
    } catch (err) {
        console.log("ERROR: ", err);
    }
}

const calculateHour = (seconds) => {
    // Create current time, converting seconds to milliseconds
    const time = new Date(seconds * 1000);
    // Get current hour
    const hour = time.getHours();
    // Convert to 1-12 from 0-23
    let convertedHour = (hour > 12) ? hour - 12 : hour;
    // If 0, it is midnight, so 12 AM
    if (hour === 0) {
        convertedHour = 12;
    }

    return `${convertedHour} ${(hour > 11) ? "pm" : "am"}`;

}

const calculateDay = () => {
    const date = new Date();
    const weekday = date.toLocaleString("default", { weekday: "long" });
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();

    const currentDateElements = document.querySelectorAll(".full-date");
    for (let element of currentDateElements) {
        element.innerText = `${weekday}, ${month} ${day}`;
    }
    const currentHourElements = document.querySelectorAll(".current-hour");
    for (let element of currentHourElements) {
        element.innerText = `as of ${calculateHour(Date.now() / 1000)}`;
    }

}

const calculateMonthDay = (data) => {
    const date = new Date(data.time);
    const month = date.toLocaleString("default", { month: "short" });
    return `${month} ${date.getDate()}`;
}

const parseCurrentData = (data) => {
    const parsedCurrentData = {};
    parsedCurrentData.currentTemp = Math.trunc(data.current.temp);
    parsedCurrentData.currentCondition = data.current.weather[0].main;
    parsedCurrentData.currentConditionIcon = data.current.weather[0].icon;
    parsedCurrentData.min = Math.trunc(data.daily[0].temp.min);
    parsedCurrentData.max = Math.trunc(data.daily[0].temp.max);

    return parsedCurrentData;
}

const parseHourlyData = (hourlyData) => {
    const parsedHourlyData = [];
    for (let hour of hourlyData) {
        const newHourObject = {};
        newHourObject.hour = calculateHour(hour.dt);
        newHourObject.temp = Math.trunc(hour.temp);
        newHourObject.weatherIcon = hour.weather[0].icon;
        newHourObject.weatherCondition = hour.weather[0].main;
        newHourObject.windSpeed = Math.ceil(hour.wind_speed) + " mph";

        parsedHourlyData.push(newHourObject);
    }

    return parsedHourlyData;
}

const parseWeeklyData = (weeklyData) => {
    const parsedWeeklyData = [];
    for (let day of weeklyData) {
        const newDayObject = {};
        newDayObject.time = day.dt * 1000;
        newDayObject.max = Math.trunc(day.temp.max);
        newDayObject.min = Math.trunc(day.temp.min);
        newDayObject.icon = day.weather[0].icon;
        newDayObject.condition = day.weather[0].main;
        newDayObject.wind = Math.trunc(day.wind_speed);

        parsedWeeklyData.push(newDayObject);
    }

    return parsedWeeklyData;
}

const createCurrent = (currentData) => {
    document.querySelector(".current-temp").innerHTML = `${currentData.currentTemp}&deg;`;
    document.querySelector(".current-condition").innerText = currentData.currentCondition;
    document.querySelector(".temp-range").innerHTML = `${currentData.max}&deg / ${currentData.min}&deg`;
    document.querySelector("#current-img").src = `http://openweathermap.org/img/wn/${currentData.currentConditionIcon}.png`;
}

const hourlyContainer = document.getElementById("hourly-container");

const createHourlyRows = (hourlyData) => {

    for (let currentHour of hourlyData) {
        const newLi = document.createElement("li");
        newLi.classList.add("hourly-row");

        newLi.innerHTML = `<div>${currentHour.hour}</div>
        <div class="hourly-temp">${currentHour.temp}&#176</div>
        <div class="hourly-weather-icon">
            <img src="http://openweathermap.org/img/wn/${currentHour.weatherIcon}@2x.png" />
            ${currentHour.weatherCondition}
        </div>
        <div>${currentHour.windSpeed}</div>
        <div class="caret caret-down"></div>`;

        hourlyContainer.appendChild(newLi);
    }
}

const createDailyRows = (weeklyData) => {
    const weeklyContainer = document.getElementById("weekly-container");

    for (let currentDay of weeklyData) {
        const newLi = document.createElement("li");
        newLi.classList.add("hourly-row");

        newLi.innerHTML = `<div>${calculateMonthDay(currentDay)}</div>
        <div><span class="hourly-temp">${currentDay.max}&deg;</span>/${currentDay.min}&deg;</div>
        <div class="hourly-weather-icon">
            <img src="http://openweathermap.org/img/wn/${currentDay.icon}@2x.png" />
            ${currentDay.condition}
        </div>
        <div>${currentDay.wind} mph</div>
        <div class="caret caret-down"></div>`;

        weeklyContainer.appendChild(newLi);
    }

}

const createWeatherWidget = (data, location) => {
    const widgetContainer = document.getElementById("past-weather-searches");
    const newDiv = document.createElement("div");
    newDiv.classList.add("weather-widget");
    newDiv.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.currentConditionIcon}@2x.png" />
    ${data.currentTemp}&deg;&nbsp;<span>${location}</span>`;

    widgetContainer.prepend(newDiv);

}

const addRowEventListeners = () => {
    const hourlyRows = document.querySelectorAll(".hourly-row");
    for (let row of hourlyRows) {
        row.addEventListener("click", function () {
            this.lastElementChild.classList.toggle("caret-down");
            this.lastElementChild.classList.toggle("caret-up");
            // this.nextElementSibling.classList.toggle("active");
        });
    }
}

const useWeatherData = async (searchTerm) => {
    const coordinates = await fetchLocation(searchTerm);
    for (let element of document.querySelectorAll(".city")) {
        element.innerText = `- ${coordinates.locationName.split(",")[0]}`;
    }
    document.querySelector(".current-heading").innerText = `${coordinates.locationName.split(",")[0]} Weather`;
    fetchWeatherData(coordinates.lon, coordinates.lat)
        .then(data => {
            // Current Day
            const currentData = parseCurrentData(data);
            createCurrent(currentData);

            // Hourly for today
            const hourlyData = parseHourlyData(data.hourly.slice(0, 12));
            createHourlyRows(hourlyData);

            // Weekly for seven days
            const weeklyData = parseWeeklyData(data.daily).slice(0, 7);
            createDailyRows(weeklyData);

            // Add row event listeners for both hourly and weekly
            addRowEventListeners();

            // Add most recent search as a widget to the past-weather-searches bar/ticker
            createWeatherWidget(currentData, coordinates.locationName.split(",")[0]);
        })
        .catch(err => {
            console.log(err);
        });
}

const changeDisplay = () => {
    switch (display) {
        case "current":
            document.getElementById("hourly-card").style.display = "none";
            document.getElementById("weekly-card").style.display = "none";
            document.getElementById("current-card").style.display = "block";
            break;
        case "hourly":
            document.getElementById("current-card").style.display = "none";
            document.getElementById("weekly-card").style.display = "none";
            document.getElementById("hourly-card").style.display = "block";
            break;
        case "weekly":
            document.getElementById("current-card").style.display = "none";
            document.getElementById("hourly-card").style.display = "none";
            document.getElementById("weekly-card").style.display = "block";
            break;
        default:
            console.log("error: changeDisplay() error");
    }
}

const removeNavStyle = (element) => {
    const menuList = document.querySelectorAll(".nav-list li a");
    for (let item of menuList) {
        item.classList.remove("active-nav");
    }
    element.classList.add("active-nav");
}

const currentNav = document.getElementById("current");
const hourlyNav = document.getElementById("hourly");
const weeklyNav = document.getElementById("week");

currentNav.addEventListener("click", function () {
    removeNavStyle(this);
    display = "current";
    changeDisplay();
});

hourlyNav.addEventListener("click", function () {
    removeNavStyle(this);
    display = "hourly";
    changeDisplay();
});

weeklyNav.addEventListener("click", function () {
    removeNavStyle(this);
    display = "weekly";
    changeDisplay();
});

const searchBar = document.getElementById("search-bar");
searchBar.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        hourlyContainer.innerHTML = "";
        useWeatherData(searchBar.value);
        searchBar.value = "";
    }
});

calculateDay();





