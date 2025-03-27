const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-locatin-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundScreen = document.querySelector(".not-found");

//initial variables needed
let currentTab = userTab;
const API_KEY = "db2b8e63a79785a80e536fb3b5e0a2b4";
currentTab.classList.add("current-tab");
getFromSessionStorage();


function switchTab(clickedTab){

    //this means user wants to switch tabs
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //this means yourWeather tab is selected and we need to switch to searchWeather tab
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //this means searchWeather tab is selected and we need to switch to yourWeather tab
        else{
            notFoundScreen.classList.remove("active");
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now user is on yourWeather tab, so we need to display user weather
            //so we will check session's local storage for coordinates
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", ()=>{
    switchTab(userTab);
})
searchTab.addEventListener("click", ()=>{
    switchTab(searchTab);
})


//this checks if coordinates are already present in session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    //coordinates not present
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    //coordinates present
    else{
        //converts JSON string into JSON object
        let coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates){
    //get latitude and longitude from co-ordinates
    const {lat, lon} = coordinates;

    //make grant access container invisible
    grantAccessContainer.classList.remove("active");
    //make loading animation visible
    loadingScreen.classList.add("active");

    //make API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json(); //converts response of api into json format
        console.log(data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        //HW
    }
}

function renderWeatherInfo(weatherInfo){
    //first of all, fetch all the required elements

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}


const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("No geoLocation support");
    }
}
function showPosition(position){

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    //converts JSON object into JSON string and stores values in session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    if(searchInput.value == "") return;

    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
})

async function fetchSearchWeatherInfo(city){
    //make loading screen visible
    userInfoContainer.classList.remove("active");
    notFoundScreen.classList.remove("active");
    loadingScreen.classList.add("active");

    //make API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        if(data?.message == "city not found"){
            userInfoContainer.classList.remove("active");
            notFoundScreen.classList.add("active");
        }
        renderWeatherInfo(data);
    }
    catch(err){

    }
}