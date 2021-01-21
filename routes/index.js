var request = require("sync-request");
var express = require('express');
var router = express.Router();

var Cities = require('../models/cities')

const weatherURL = 'https://api.openweathermap.org/data/2.5/weather?appid=b49185709cdd24c630699b40eaa3d7ed&units=metric&lang=fr'

function cityNameFormat(name) {
  var formatName = name.charAt(0).toUpperCase() + name.slice(1)
  return formatName
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'login WeatherApp' });
});

router.get('/weather', async function (req, res, next) {
  const cityList = await Cities.find()
  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});


// Ajout Ville en DB
router.get('/add-city', async function (req, res, next) {
  let error = { isError: false, type: null }
  const weatherURLCity = weatherURL + '&q=' + req.query.city
  var result = request("GET", weatherURLCity)
  var resultJSON = JSON.parse(result.body)

  var cityData = {
    nom: resultJSON.name,
    icon: `http://openweathermap.org/img/wn/${resultJSON.weather[0].icon}.png`,
    descriptif: resultJSON.weather[0].description,
    tmin: resultJSON.main.temp_min,
    tmax: resultJSON.main.temp_max,
  }

  let cityList = await Cities.find() // récupère la liste des villes en DB
  let checkNewCityInDB = await Cities.find({nom: cityNameFormat(req.query.city)})

  if (checkNewCityInDB.length > 0) {
    error = { isError: true, type: 'doublon' }
  }
  else if (resultJSON.cod === 200) {
    var newCity = new Cities(cityData);
    await newCity.save(); // ajoute la nouvelle ville en DB
    cityList.push(cityData) // implémente la nouvelle ville au tableau cityList
  } else {
    error = { isError: true, type: resultJSON.cod }
  }

  res.render('weather', { title: 'WeatherApp', cityList, error });
});

router.get('/delete-city', async function (req, res, next) {
  await Cities.deleteOne(
    { _id: req.query._id }
  );
  const cityList = await Cities.find()

  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});

router.get('/update-cities', async function (req, res, next) {
  // boucle ville enregistrée en DB
  let cityList = await Cities.find()
  cityList.forEach(async function(city) {
    // console.log('e', city)
    let weatherURLCity = weatherURL + '&q=' + city.nom
    let result = request("GET", weatherURLCity)
    let resultJSON = JSON.parse(result.body)

    await Cities.updateOne(
      { _id: city._id },
      {
        nom: city.nom,
        icon: `http://openweathermap.org/img/wn/${resultJSON.weather[0].icon}.png`,
        descriptif: resultJSON.weather[0].description,
        tmin: resultJSON.main.temp_min,
        tmax: resultJSON.main.temp_max,
      }
    );
  });
  cityList = await Cities.find()
  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
})

module.exports = router;
