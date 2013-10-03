//= require ./vendor/jquery
//= require ./vendor/handlebars.runtime
//= require ./app/app
//= require_tree ./app/

$(document).ready(function() {
  var app = new App();
  app.run();
});
