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
        $('#content').render('history', {
          userLevel: result.userLevel,
          history: result.history
        });
      }
    });
  });

  //$('#content').render('history');

  $('#content').on('click', '.jsCompletedLevel', function() {
    var $checkbox = $(this).find('input[type="checkbox"]'),
      checked = !$checkbox.prop('checked');
    $checkbox.prop('checked', checked);
    if (checked) {
      $(this).addClass('selected');
    } else {
      $(this).removeClass('selected');
    }
  });
};

