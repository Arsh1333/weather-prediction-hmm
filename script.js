const API_KEY = "f30efbbf01120d1514ff5da730215ff1"; // Replace with your API key
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";
const DAYS_TO_PREDICT = 5;

const weatherMapping = {
  Clear: "Sunny",
  Clouds: "Cloudy",
  Rain: "Rainy",
};

function mapWeatherDescription(description) {
  for (const key in weatherMapping) {
    if (description.toLowerCase().includes(key.toLowerCase())) {
      return weatherMapping[key];
    }
  }
  return "Cloudy";
}

function getWeatherForecast(city) {
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data, city);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      alert("City not found or API error.");
    });
}

function displayWeather(data, city) {
  const cityElement = document.getElementById("city");
  const currentStateElement = document.getElementById("current-state");
  const currentDescriptionElement = document.getElementById(
    "current-description"
  );
  const forecastDaysElement = document.getElementById("forecast-days");

  cityElement.textContent = city;
  currentStateElement.textContent = mapWeatherDescription(
    data.list[0].weather[0].main
  );
  currentDescriptionElement.textContent = data.list[0].weather[0].main;

  forecastDaysElement.innerHTML = "";

  let predictedWeather = [mapWeatherDescription(data.list[0].weather[0].main)];
  let lastState = predictedWeather[0];
  for (let i = 1; i <= DAYS_TO_PREDICT; i++) {
    lastState = predictNextWeatherHMM(lastState);
    predictedWeather.push(lastState);
  }
  for (let i = 1; i < predictedWeather.length; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const formattedDate = futureDate.toLocaleDateString();

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("forecast-day");
    dayDiv.innerHTML = `
            <h3>Day ${i} (${formattedDate})</h3>
            <p>${predictedWeather[i]}</p>
        `;
    forecastDaysElement.appendChild(dayDiv);
  }
}

const states = ["Sunny", "Cloudy", "Rainy"];
const transitionProbs = [
  [0.6, 0.3, 0.1],
  [0.2, 0.5, 0.3],
  [0.1, 0.4, 0.5],
];

function predictNextWeatherHMM(lastState) {
  const lastStateIndex = states.indexOf(lastState);
  const nextStateProbs = transitionProbs[lastStateIndex];

  let randomNum = Math.random();
  let cumulativeProb = 0;

  for (let i = 0; i < nextStateProbs.length; i++) {
    cumulativeProb += nextStateProbs[i];
    if (randomNum < cumulativeProb) {
      return states[i];
    }
  }
  return states[nextStateProbs.length - 1];
}

document.getElementById("getWeatherButton").addEventListener("click", () => {
  const city = document.getElementById("city").value;
  if (city) {
    getWeatherForecast(city);
  } else {
    alert("Please enter a city.");
  }
});
