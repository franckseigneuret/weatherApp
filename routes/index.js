var request = require("sync-request");
var express = require('express');
var router = express.Router();

var Cities = require('./bdd')

let cityList = []

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
  cityList = await Cities.find()
  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});

router.get('/add-city', async function (req, res, next) {
  let error = { isError: false, type: null }
  const weatherURLCity = weatherURL + '&q=' + req.query.city
  var result = request("GET", weatherURLCity)

  var resultJSON = JSON.parse(result.body)

  if (resultJSON.cod === 200) {
    var newCity = new Cities({
      nom: req.query.city,
      icon: `http://openweathermap.org/img/wn/${resultJSON.weather[0].icon}.png`,
      descriptif: resultJSON.weather[0].description,
      tmin: resultJSON.main.temp_min,
      tmax: resultJSON.main.temp_max,
    });
    var city = await newCity.save();
  } else {
    error = { isError: true, type: resultJSON.cod }
  }
  res.render('weather', { title: 'WeatherApp', cityList, error });
});

router.get('/delete-city', async function (req, res, next) {
  // cityList = modifyList(cityList, 'delete', req.query)
  await Cities.deleteOne(
    { nom: req.query.nom }
  );
  cityList = await Cities.find()

  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});

module.exports = router;
