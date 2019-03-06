function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

function statusChangeCallback(response) {
  console.log('Facebook login status changed.');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
        console.log('Successfully logged in with Facebook');
        FB.api('/me?fields=name,first_name,picture.width(150)', changeUser);
  }
  else {
    console.log('Not authenticated');
  }
}

function changeUser(response){
  var name = response.name;
  var pic = response.picture.data.url;
  var dominanthand = "";
  var handicap = "";
  var swing_journal = [];

  // Add detail to instantiated newUser
  var newUser = {
    "name": name,
    "pic": pic,
    "dominanthand": dominanthand,
    "handicap": handicap,
    "swing_journal": swing_journal
  };

  localStorage.setItem( 'user', JSON.stringify(newUser));
  console.log(localStorage);
}