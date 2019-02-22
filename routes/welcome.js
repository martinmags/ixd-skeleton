var data = require("../data.json");
exports.view = function(req,res){
  res.render('welcome', data);
  console.log(data);
};