'use-strict';

if ( $(window).width() > 739) {   
const contentWeather = document.querySelector('.results-output');

// import key
const searchURL = 'https://api.openweathermap.org/data/2.5/weather';
const myKey = 'b665746e57c457076f042fba17e9bb15';
const imp = 'imperial';



//function to allow user to search locations by using the nominatim API
function search() {

  let address = $('#ad').val();


  $.getJSON("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json&polygon=1&countrycodes=us&limit=2", function (data) {

    let html = '<ul>';
    $.each(data, function (index, value) {

      let lat = data[index].lat;
      let lon = data[index].lon;
      let bBox = data[index].boundingbox;
      let name = data[index].display_name;

      let bb0 = bBox[0]; //lat 1
      let bb1 = bBox[1]; //lat 2
      let bb2 = bBox[2]; //lon 1
      let bb3 = bBox[3]; //lon 2

      html = html + '<li><a href = "#" onclick= "selectAddress(' + bb0 + ',' + bb2 + ',' + bb1 + ',' + bb3 + ',' + lat + ',' + lon + ')">' + name + '</a></li>';




    });
    html = html + '</ul>';

    $('.results').html(html);


  });
}



//create the bounding box that the map zooms to after choosing location
function selectAddress(bb0, bb2, bb1, bb3, lat, lon) {
  latitude = lat;
  longitude = lon;
  let southWest = new L.latLng(bb0, bb2);
  let northEast = new L.latLng(bb1, bb3);
  let bounds = L.latLngBounds(southWest, northEast);
  map.fitBounds(bounds);
};

//clear results upon user clicking on choice
$(".results").click(function () {
  $(".results").empty();
});


//defining tile laters with OpenWeatherMap App ID
let osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png');
let precip = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?&appid=' + myKey);
let temp = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?&appid=' + myKey);



//Map defaults.  Leave "temp" layer unchecked in layer controls by not adding it here
let map = L.map('map', {
  center: [39.73, -97],
  zoom: 4,
  layers: [osm, precip]
});

//Combining layers in groups to add to map later
let baseMap = {
  "<span style='font-family: Exo, sans-serif;'>Open Street Map</span>": osm
};

let weatherData = {
  "<span style='font-family: Exo, sans-serif;'>Precipitation</span>": precip,
  "<span style='font-family: Exo, sans-serif;'>Temperature</span>": temp,
};


//Adding layers to the map.  Collapsed false leaves the layer group control open by default
L.control.layers(baseMap, weatherData, {collapsed: false}).addTo(map);

//Add ski resort icon
let skiIcon = L.icon({
  iconUrl: "images/skiIcon.png", // size of the icon
  iconAnchor: [22, 22],
  iconSize: [10,10], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -24] // point from which the popup should open relative to the iconAnchor
});

//Add geoJSON to the map with popup controlled by layer.bindPopup 
function createPopup(feature, layer) {
  layer.bindPopup("<h4>" + feature.properties.state + "</h4>" + "<h4>" + feature.properties.name + "</h4>");
  layer.setIcon(skiIcon);


  //Get lat lon of the icon the user clicks
  layer.on('click', function (e) {
    const lng = feature.properties.longitude;
    const lat = feature.properties.latitude;

    //Add the lat lon of where the user clicks to the API request
    fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=`+ myKey)
      .then(res => res.json())
      .then(data => weather = data)
      .then(weather => showData(weather))
      .catch(err => console.log('error', err))
  });
};

var skiResortGeo = L.geoJSON(skiResorts, {
  onEachFeature: createPopup
}).addTo(map);


//Load when 
function showData(obj) {
  contentWeather.textContent = ''
  const div = document.createElement('div')
  contentWeather.appendChild(div)

  div.outerHTML = `<div class="results-output">
  <h1>${obj.name}</h1>
  <h1>${obj.main.temp}˚F</h1>
  <img src=https://openweathermap.org/img/w/${obj.weather[0].icon}.png alt="weather icon">
  <h1>${obj.weather[0].description}</h1>
</div>`
}


//code for  showing/hiding layers control on click
$('.leaflet-control-layers').hide();
$('.leaflet-control-layers').css('top', '30px');

btn.onclick = function () {
  $('.leaflet-control-layers').toggle();
}

//Allow user to presss enter to get address results 
let input = document.getElementById("ad");
input.addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("myBtn").click();
  }
});

//This section queries the OpenWeatherMap data to display weather information for the location selected by the user
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  $('.results-output').empty();
  // iterate through the weather array
  $('.results-output').append(
    `
      <h1>${responseJson.name}</h1>
      <h1>${responseJson.main.temp}˚F</h1>
      <img src=https://openweathermap.org/img/w/${responseJson.weather[0].icon}.png alt="weather icon">
      <h1>${responseJson.weather[0].description}</h1>
      `
  )
};
$('.result').removeClass('hidden');

$("#myBtn").click(function () {
  $(".results-output").empty();
});

function getWeather(query) {
  const params = {
    lat: latitude,
    lon: longitude,
    appid: myKey,
    units: imp
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
    })
    .then(responseJson => displayResults(responseJson));
};


function watchForm() {
  $('.results').click(event => {
    event.preventDefault();
    getWeather();
  });
}

$(watchForm);

 //change icon size based on zoom
var ar_icon_1_double_size = L.icon({
  iconUrl: "images/skiIcon.png",
  iconSize: [60, 60],
  popupAnchor: [-3, -24],
  iconAnchor: [22, 22]
});

var ar_icon_2_double_size = L.icon({
  iconUrl: "images/skiIcon.png",
  iconSize: [50, 50],
  popupAnchor: [-3, -24],
  iconAnchor: [22, 22]});

var ar_icon_1 = L.icon({
  iconUrl: "images/skiIcon.png",
  iconSize: [35, 35],
  popupAnchor: [-3, -24],
  iconAnchor: [22, 22]});

var ar_icon_2 = L.icon({
  iconUrl: "images/skiIcon.png",
  iconSize: [20, 20],
  popupAnchor: [-3, -24],
  iconAnchor: [22, 22]});


map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    if (currentZoom > 1) {
        skiResortGeo.eachLayer(function(layer) {
            if (currentZoom > 12)
                return layer.setIcon(ar_icon_1_double_size);
            else if (currentZoom > 9)
                return layer.setIcon(ar_icon_2_double_size);
            else if (currentZoom > 6)
                return layer.setIcon(ar_icon_1);
            else if (currentZoom > 4)
                return layer.setIcon(ar_icon_2);
        });
    }
});
}


//javascript for screen size smaller than 739px
else {
  const contentWeather = document.querySelector('.results-output');

  // import key
  const searchURL = 'https://api.openweathermap.org/data/2.5/weather';
  const myKey = 'b665746e57c457076f042fba17e9bb15';
  
  
  
  //function to allow user to search locations by using the nominatim API
  function search() {
  
    let address = $('#ad').val();
  
  
    $.getJSON("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json&polygon=1&countrycodes=us&limit=2", function (data) {
  
      let html = '<ul>';
      $.each(data, function (index, value) {
  
        let lat = data[index].lat;
        let lon = data[index].lon;
        let bBox = data[index].boundingbox;
        let name = data[index].display_name;
  
        let bb0 = bBox[0]; //lat 1
        let bb1 = bBox[1]; //lat 2
        let bb2 = bBox[2]; //lon 1
        let bb3 = bBox[3]; //lon 2
  
        html = html + '<li><a href = "#" onclick= "selectAddress(' + bb0 + ',' + bb2 + ',' + bb1 + ',' + bb3 + ',' + lat + ',' + lon + ')">' + name + '</a></li>';
  
  
  
  
      });
      html = html + '</ul>';
  
      $('.results').html(html);
  
  
    });
  }
  
  
  
  //create the bounding box that the map zooms to after choosing location
  function selectAddress(bb0, bb2, bb1, bb3, lat, lon) {
    latitude = lat;
    longitude = lon;
    let southWest = new L.latLng(bb0, bb2);
    let northEast = new L.latLng(bb1, bb3);
    let bounds = L.latLngBounds(southWest, northEast);
    map.fitBounds(bounds);
  };
  
  //clear results upon user clicking on choice
  $(".results").click(function () {
    $(".results").empty();
  });
  
  
  //defining tile laters with OpenWeatherMap App ID
  let osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png');
  let precip = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + myKey),
  temp = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?&appid=' + myKey);
  
  
  
  //Map defaults.  Leave "temp" layer unchecked in layer controls by not adding it here
  let map = L.map('map', {
    center: [36.73, -98],
    zoom: 2.5,
    layers: [precip, osm]
  });
  
  //Combining layers in groups to add to map later
  let baseMap = {
    "<span style='font-family: Exo, sans-serif;'>Open Street Map</span>": osm
  };
  
  let weatherData = {
    "<span style='font-family: Exo, sans-serif;'>Precipitation</span>": precip,
    "<span style='font-family: Exo, sans-serif;'>Temperature</span>": temp,
  };
  
  
  
  //Adding layers to the map.  Collapsed false leaves the layer group control open by default
  L.control.layers(baseMap, weatherData, { collapsed: false }).addTo(map);
  
  //Add ski resort icon
  let skiIcon = L.icon({
    iconUrl: "images/skiIcon.png", // size of the icon
    iconAnchor: [22, 22],
    iconSize: [7,7], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -24] // point from which the popup should open relative to the iconAnchor
  });
  
  //Add geoJSON to the map with popup controlled by layer.bindPopup 
  function createPopup(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.state + "</h4>" + "<h4>" + feature.properties.name + "</h4>");
    layer.setIcon(skiIcon);
  
  
    //Get lat lon of the icon the user clicks
    layer.on('click', function (e) {
      const lng = feature.properties.longitude;
      const lat = feature.properties.latitude;
  
      //Add the lat lon of where the user clicks to the API request
      fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=`+ mykey)
        .then(res => res.json())
        .then(data => weather = data)
        .then(weather => showData(weather))
        .catch(err => console.log('error', err))
    });
  };
  
  var skiResortGeo = L.geoJSON(skiResorts, {
    onEachFeature: createPopup
  }).addTo(map);
  
  
  //Load when 
  function showData(obj) {
    contentWeather.textContent = ''
    const div = document.createElement('div')
    contentWeather.appendChild(div)
  
    div.outerHTML = `<div class="results-output">
    <h1>${obj.name}</h1>
    <h1>${obj.main.temp}˚F</h1>
    <img src=https://openweathermap.org/img/w/${obj.weather[0].icon}.png alt="weather icon">
    <h1>${obj.weather[0].description}</h1>
  </div>`
  }
  
  
  //code for  showing/hiding layers control on click
  $('.leaflet-control-layers').hide();
  $('.leaflet-control-layers').css('top', '30px');
  
  btn.onclick = function () {
    $('.leaflet-control-layers').toggle();
  }
  
  //Allow user to presss enter to get address results 
  let input = document.getElementById("ad");
  input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById("myBtn").click();
    }
  });
  
  //This section queries the OpenWeatherMap data to display weather information for the location selected by the user
  function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }
  
  function displayResults(responseJson) {
    // if there are previous results, remove them
    $('.results-output').empty();
    // iterate through the weather array
    $('.results-output').append(
      `
        <h1>${responseJson.name}</h1>
        <h1>${responseJson.main.temp}˚F</h1>
        <img src=https://openweathermap.org/img/w/${responseJson.weather[0].icon}.png alt="weather icon">
        <h1>${responseJson.weather[0].description}</h1>
        `
    )
  };
  $('.result').removeClass('hidden');
  
  $("#myBtn").click(function () {
    $(".results-output").empty();
  });
  
  function getWeather(query) {
    const params = {
      lat: latitude,
      lon: longitude,
      appid: myKey,
      units: imp
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;
  
    console.log(url);
  
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then(responseJson => displayResults(responseJson));
  };
  
  
  function watchForm() {
    $('.results').click(event => {
      event.preventDefault();
      getWeather();
    });
  }
  
  $(watchForm);
  
  //change icon size based on zoom
  var ar_icon_1_double_size = L.icon({
    iconUrl: "images/skiIcon.png",
    iconSize: [60, 60],
    popupAnchor: [-3, -24],
    iconAnchor: [22, 22]
  });
  
  var ar_icon_2_double_size = L.icon({
    iconUrl: "images/skiIcon.png",
    iconSize: [50, 50],
    popupAnchor: [-3, -24],
    iconAnchor: [22, 22]});
  
  var ar_icon_1 = L.icon({
    iconUrl: "images/skiIcon.png",
    iconSize: [35, 35],
    popupAnchor: [-3, -24],
    iconAnchor: [22, 22]});
  
  var ar_icon_2 = L.icon({
    iconUrl: "images/skiIcon.png",
    iconSize: [20, 20],
    popupAnchor: [-3, -24],
    iconAnchor: [22, 22]});
  
  
  map.on('zoomend', function() {
      var currentZoom = map.getZoom();
      if (currentZoom > 1) {
          skiResortGeo.eachLayer(function(layer) {
              if (currentZoom > 12)
                  return layer.setIcon(ar_icon_1_double_size);
              else if (currentZoom > 9)
                  return layer.setIcon(ar_icon_2_double_size);
              else if (currentZoom > 6)
                  return layer.setIcon(ar_icon_1);
              else if (currentZoom > 4)
                  return layer.setIcon(ar_icon_2);
          });
      }
  });

}
