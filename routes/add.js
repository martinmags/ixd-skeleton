var data = require("../data.json");

exports.addUser = function(req,res){
  var name = req.query.name;
  var email = req.query.email;
  var password = req.query.password;
  var dominanthand = "";
  var handicap = "";
  var swing_journal = [
  ];

// Add detail to instantiated newUser
  var newUser = {
    "name": name,
    "email": email,
    "password": password,
    "dominanthand": dominanthand,
    "handicap": handicap,
  };

  data.users.push(newUser);
  res.render('home');
  console.log(data);
};