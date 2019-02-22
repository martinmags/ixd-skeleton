/* Load a file called project.handlebars and display it */
var data = require('../data.json');
exports.view = function(req, res){
  res.render('profile', data);
  console.log(data);
};