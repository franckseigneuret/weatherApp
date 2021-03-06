var request = require("sync-request");
var express = require('express');
var router = express.Router();

const Cities = require('../models/cities')
const Users = require('../models/users')

const weatherURL = 'https://api.openweathermap.org/data/2.5/weather?appid=b49185709cdd24c630699b40eaa3d7ed&units=metric&lang=fr'

function cityNameFormat(name) {
  const formatName = name.charAt(0).toUpperCase() + name.slice(1)
  return formatName
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'login WeatherApp', error: null });
});

router.get('/weather', async function (req, res, next) {

  if (req.session.user === undefined) {
    res.redirect('/')
  }

  const cityList = await Cities.find()
  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});


// Ajout Ville en DB
router.get('/add-city', async function (req, res, next) {
  let error = { isError: false, type: null }

  let cityList = await Cities.find() // récupère la liste des villes en DB
  let checkNewCityInDB = await Cities.find({ nom: cityNameFormat(req.query.city) })

  if (checkNewCityInDB.length > 0) {
    error = { isError: true, type: 'doublon' }
  }
  else {
    const weatherURLCity = weatherURL + '&q=' + req.query.city
    const result = request("GET", weatherURLCity)
    const resultJSON = JSON.parse(result.body)

    if (resultJSON.cod === 200) {
      const cityData = {
        nom: resultJSON.name,
        icon: `http://openweathermap.org/img/wn/${resultJSON.weather[0].icon}.png`,
        descriptif: resultJSON.weather[0].description,
        tmin: resultJSON.main.temp_min,
        tmax: resultJSON.main.temp_max,
      }
      const newCity = new Cities(cityData);
      await newCity.save(); // ajoute la nouvelle ville en DB
      cityList.push(cityData) // implémente la nouvelle ville au tableau cityList

    } else {
      error = { isError: true, type: resultJSON.cod }
    }
  }

  res.render('weather', { title: 'WeatherApp', cityList, error });
});

// Supprime Ville en DB
router.get('/delete-city', async function (req, res, next) {
  await Cities.deleteOne(
    { _id: req.query._id }
  );
  const cityList = await Cities.find()

  res.render('weather', { title: 'WeatherApp', cityList, error: { isError: false, type: null } });
});

// Mise à jour des datas des villes : lecture WS + sauvegarde DB
router.get('/update-cities', async function (req, res, next) {
  // boucle ville enregistrée en DB
  let cityList = await Cities.find()
  cityList.forEach(async function (city) {
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

// nouvelle inscription
router.post('/sign-up', async function (req, res, next) {
  const isUserInDB = await Users.find({ email: req.body.email })

  if (isUserInDB.length > 0) {
    res.render('login', { error: 'Ce mail ne peut être enregistré plus d\'une fois en base de données' })
  } else {
    const newUser = await Users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    })
    const newUserDB = await newUser.save();

    req.session.user = {
      name: newUserDB.username,
      email: newUserDB.email,
    }
    console.log('session = ', req.session)

    res.redirect('weather')
  }
})

// identification
router.post('/sign-in', async function (req, res, next) {
  const searchUserInDB = await Users.findOne({
    email: req.body.email,
    password: req.body.password,
  })

  if (searchUserInDB !== null) {
    req.session.user = {
      name: searchUserInDB.username,
      email: searchUserInDB.email,
    }
    res.redirect('weather')
  }

  if (searchUserInDB === null) {
    res.render('login', { error: 'Il doit y avoir une erreur du mail et/ou du mot de passe' })
  }
})

// déconnexion
router.get('/logout', function(req, res) {
  req.session.user = undefined
  res.redirect('/')
})

module.exports = router;
