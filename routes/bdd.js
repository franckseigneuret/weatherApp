var mongoose = require('mongoose');


const password = 'aUPF3DqrUkmLC6S'
const dbname = 'weatherapp'
const clusterName = 'cluster0'
const URI_BDD = `mongodb+srv://admin:${password}@${clusterName}.perci.mongodb.net/${dbname}?retryWrites=true&w=majority`

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(URI_BDD,
  options,
  function (err) {
    console.log(err);
  }
);

var citySchema = mongoose.Schema({
  nom: String,
  icon: String,
  descriptif: String,
  tmin: Number,
  tmax: Number,
});

var Cities = mongoose.model('cities', citySchema);

module.exports = Cities
