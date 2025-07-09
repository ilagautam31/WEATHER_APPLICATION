const userLocation = document.getElementById("userLocation"),
  converter = document.getElementById("converter"),
  weathericon = document.querySelector(".weathericon"),
  temperature = document.querySelector(".temperature"),
  feelslike = document.querySelector(".feelslike"),
  description = document.querySelector(".description"),
  date = document.querySelector(".date"),
  city = document.querySelector(".city"),
  hvalue = document.getElementById("hvalue"),
  wvalue = document.getElementById("wvalue"),
  srvalue = document.getElementById("srvalue"),
  ssvalue = document.getElementById("ssvalue"),
  cvalue = document.getElementById("cvalue"),
  visibilityvalue = document.getElementById("visibilityvalue"),
  pvalue = document.getElementById("pvalue"),
  forecast = document.querySelector(".forecast");

const WEATHER_API_ENDPOINT =
  `/api/weather?q=`;
const WEATHER_DATA_ENDPOINT =
  `https://api.openweathermap.org/data/2.5/onecall?appid=${API_KEY}&exclude=minutely&units=metric&`;
const FORECAST_API_ENDPOINT =
  `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric&q=`;

function findUserLocation() {
  const location = userLocation.value;

  fetch(WEATHER_API_ENDPOINT + location)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod != 200) {
        alert(data.message);
        return;
      }

      console.log(data);

      city.innerHTML = data.name + ", " + data.sys.country;
      weathericon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png)`;
      temperature.innerHTML = `${data.main.temp}°C`;
      feelslike.innerHTML = `Feels like ${data.main.feels_like}°C`;
      description.innerHTML = data.weather[0].description;
      const now = new Date();
      const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
      const fullDate = now.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const time = now.toLocaleTimeString();

      date.innerHTML = `${weekday}, ${fullDate} - ${time}`;

      hvalue.innerHTML = `${data.main.humidity}%`;
      wvalue.innerHTML = `${data.wind.speed} m/s`;
      srvalue.innerHTML = new Date(
        data.sys.sunrise * 1000
      ).toLocaleTimeString();
      ssvalue.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      cvalue.innerHTML = `${data.clouds.all}%`;
      visibilityvalue.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
      pvalue.innerHTML = `${data.main.pressure} hPa`;

      // FETCH 5-day forecast (NOW INSIDE)
      fetch(FORECAST_API_ENDPOINT + location)
        .then((res) => res.json())
        .then((forecastData) => {
          console.log("Forecast data:", forecastData);
          forecast.innerHTML = ""; // Clear previous data

          const dayMap = {};

          // Group forecast data by calendar day
          forecastData.list.forEach((entry) => {
            const dateObj = new Date(entry.dt * 1000);
            const dateKey = dateObj.toLocaleDateString(); // e.g., "9/7/2025"
            if (!dayMap[dateKey]) {
              dayMap[dateKey] = [];
            }
            dayMap[dateKey].push(entry);
          });

          // Show forecast for the first 5 unique days
          Object.keys(dayMap)
            .slice(0, 5)
            .forEach((dateKey) => {
              const entries = dayMap[dateKey];
              const dateObj = new Date(entries[0].dt * 1000);

              const day = dateObj.toLocaleDateString(undefined, {
                weekday: "long",
              }); // e.g., "Wednesday"
              const date = dateObj.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              }); // e.g., "9 Jul"

              const icon = entries[0].weather[0].icon.replace("n", "d");
              const description = entries[0].weather[0].description;

              // Calculate min/max temperature across all entries of the day
              let minTemp = Infinity,
                maxTemp = -Infinity;
              entries.forEach((e) => {
                const t = e.main.temp;
                if (t < minTemp) minTemp = t;
                if (t > maxTemp) maxTemp = t;
              });

              // Create forecast item
              const div = document.createElement("div");
              div.classList.add("forecast-item");
              div.innerHTML = `
        <p>${day}, ${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
        <p style="text-transform: capitalize;">${description}</p>
        <p>${Math.round(maxTemp)}°C / ${Math.round(minTemp)}°C</p>
      `;
              forecast.appendChild(div);
            });
        });
    });
}
