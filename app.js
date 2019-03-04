
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars')

var index = require('./routes/index');
var home = require('./routes/home');
var createacc = require('./routes/createacc');
var welcome = require('./routes/welcome');
var updated = require('./routes/updatedProfile');
var profile = require('./routes/profile');
var profileAlt = require('./routes/profile');
var editprofile = require('./routes/editprofile');
var edit = require('./routes/edit');
var help = require('./routes/help');
var user = require('./routes/user');
// TODO: var accountsettings = require()
// Example route
// var user = require('./routes/user');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('IxD secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// get requests data 
// put and post sends data
app.get('/', index.view);
app.get('/home', home.view);
app.get('/createacc', createacc.view);
app.get('/welcome', welcome.view);
app.get('/updatedProfile', updated.view);

app.get('/profile', profile.view);
app.get('/profileAlt', profile.viewAlt);

app.get('/help', help.view);
app.get('/editprofile', editprofile.view);

// Functions
app.get('/user', user.editUser);
app.get('/edit', edit.editUser);


// Example route
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
