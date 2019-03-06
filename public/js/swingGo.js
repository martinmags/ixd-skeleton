'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
  initializePage();
})

function initializePage(){
  console.log("Javascript connected!");
  $(".logoutBtn").click(clickLogoutBtn);
}

function clickLogoutBtn(e){
  e.preventDefault();
  console.log('clicked');
  ga('create', 'UA-135604176-1', 'auto');
  ga('send', 'event', 'logout', 'click');
}