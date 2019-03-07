var data = require("../../data.json");

exports.editUser = function(req,res){
  var name = req.query.name;
  var pic = "../images/profileIcon.png";
  var email = req.query.email;
  var password = req.query.password;
  var dominanthand = req.query.dominanthand;
  var handicap = "";
  var swing_journal = [
  ];

// Add detail to instantiated newUser
  var newUser = {
    "name": name,
    "pic": pic,
    "email": email,
    "password": password,
    "dominanthand": dominanthand,
    "handicap": Math.floor(30 * Math.random()),
  };

  data.user = newUser;
  res.render('updatedProfile', newUser); // pass newUser to home
  console.log(data);
};

