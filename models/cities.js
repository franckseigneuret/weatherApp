var mongoose = require('mongoose');

var citySchema = mongoose.Schema({
  nom: String,
  icon: String,
  descriptif: String,
  tmin: Number,
  tmax: Number,
});

var Cities = mongoose.model('cities', citySchema);
// "cities" est le nom d'une collection. il doit être tjs au pluriel, 
// /!\ sinon MongoDB le mettra au pluriel et il y aura une confusion 
// entre "city" de ce fichier et cities sur mongoDB /!\

module.exports = Cities
