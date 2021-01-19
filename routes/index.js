var request = require("sync-request");
var express = require('express');
var router = express.Router();

let cityList = [
  { nom: 'Paris', image: 'fa-cloud-sun', descriptif: 'nuageux', tmin: 5, tmax: 12},
  { nom: 'Lyon', image: 'fa-cloud', descriptif: 'ciel dégagé', tmin: 7, tmax: 14},
  { nom: 'Toulouse', image: 'fa-sun', descriptif: 'tempête', tmin: 5, tmax: 12},
  { nom: 'Bordeaux', image: 'fa-snowflake', descriptif: 'ouragan', tmin: 7.5, tmax: 14.4},
]

const weatherURL = 'https://api.openweathermap.org/data/2.5/weather?appid=b49185709cdd24c630699b40eaa3d7ed&units=metric&lang=fr'

const modifyList = (citiesList, todo, el) => {
  let find = false
  for (var i = 0; i < citiesList.length; i++) {
    if (citiesList[i].nom === el.nom) {
      find = true
      
      if(todo === 'delete') {
        citiesList.splice(i, 1)
      }
    }
  }

  if (!find && todo === 'add' && el.nom !=='') {
    citiesList.push({
      nom: el.nom,
      image: el.image,
      descriptif: el.descriptif,
      tmin: el.tmin,
      tmax: el.tmax,
    })
  }

  return citiesList
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'login WeatherApp' });
});

router.get('/weather', function(req, res, next) {
  res.render('weather', { title: 'WeatherApp', cityList });
});

router.get('/add-city', function(req, res, next) {
  let cityNotFound = false
  const weatherURLCity = weatherURL + '&q=' + req.query.city
  var result = request("GET", weatherURLCity)

  var resultJSON = JSON.parse(result.body)

  if(resultJSON.cod == '404') {
    cityNotFound = true
  } else {
    cityList = modifyList(cityList, 'add', {
      nom: req.query.city,
      image: 'fa-cloud',
      descriptif: resultJSON.weather.description,
      tmin: resultJSON.main.temp_min,
      tmax: resultJSON.main.temp_max,
    })
  }
  res.render('weather', { title: 'WeatherApp', cityList, cityNotFound });
});

router.get('/delete-city', function(req, res, next) {
  cityList = modifyList(cityList, 'delete', req.query)
  res.render('weather', { title: 'WeatherApp', cityList });
});

module.exports = router;
