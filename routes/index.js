var request = require("sync-request");
var express = require('express');
var router = express.Router();

var Cities = require('../models/cities')

const weatherURL = 'https://api.openweathermap.org/data/2.5/weather?appid=b49185709cdd24c630699b40eaa3d7ed&units=metric&lang=fr'

const modifyList = (citiesList, todo, el) => {
  let find = false
  for (var i = 0; i < citiesList.length; i++) {
    if (citiesList[i].nom.toLowerCase() === el.nom.toLowerCase()) {
      find = true

      if (todo === 'delete') {
        citiesList.splice(i, 1)
      }
    }
  }

  if (!find && todo === 'add' && el.nom !== '') {
    citiesList.push({
      nom: el.nom,
      icon: `http://openweathermap.org/img/wn/${el.icon}.png`,
      descriptif: el.descriptif,
      tmin: el.tmin,
      tmax: el.tmax,
    })
  }

  return citiesList
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'login WeatherApp' });
});

router.get('/weather', async function (req, res, next) {
  const cityList = await Cities.find()
  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});

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
  let cityList = await Cities.find()
  if (resultJSON.cod === 200) {
    var newCity = new Cities(cityData);
    await newCity.save();
    cityList.push(cityData)
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
