template = {};

function App() {
  this.client = new Client();
  this.user = new User(this.client);
}

App.prototype.run = function() {
  var app = this;
  $('#history').on('click', function() {
    app.client.setApiKey($('#apiKey').val());
    app.user.history(function(result) {
      if (result.success) {
        $('#content').html(
          template['history']({
            userLevel: result.userLevel,
            history: result.history
          })
        );
      }
    });
  });
}

