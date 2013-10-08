function App() {
  this.client = new Client();
  this.user = new User(this.client);
}

App.prototype.run = function() {
  var self = this;

  self.$loader = $('#loader');
  self.client.onError = self.onClientError;

  $(document).ajaxSend(function() {
    self.showLoader();
  });

  $(document).ajaxComplete(function() {
    self.hideLoader();
  });

  $('#menu a').on('click', function() {
    $('#menu li').removeClass('pure-menu-selected');
    var $link = $(this);
    $link.parent().addClass('pure-menu-selected');
    switch ($link.attr('href')) {
      case '#history':
        self.history();
        break;
      case '#measure':
        $('#content').render('measureText');
        break;
    }
  });
  
  $('#loginForm').on('submit', function(event) {
    event.preventDefault();
    self.client.setApiKey($('#apiKey').val());
    self.user.info(function(user) {
      $('#loginForm').hide();
      $('#menu').show().find('a:first').trigger('click');
    });
  });

  $('#content').on('click', '.jsCompletedLevel', function() {
    $(this).find('input[type="checkbox"]').trigger('click');
  });

  $('#content').on('click', '.jsHistoryCheckbox', function(event) {
    event.stopPropagation();
    if (this.checked) {
      $(this).closest('.jsCompletedLevel').addClass('selected');
    } else {
      $(this).closest('.jsCompletedLevel').removeClass('selected');
    }
    self.estimate();
  });

  $('#content').debounce('keydown', '.jsMeasureTextarea', function() {
    self.measureText($(this).val());
  });
};

App.prototype.estimate = function() {
  var levels = [];
  $('.jsHistoryCheckbox').each(function() {
    if (this.checked) {
      levels.push($(this).data('level'));
    }
  });
  this.user.estimate(levels, function(data) {
    if (data.success) {
      $('#estimates').render('estimates', data);
    } else {
      $('#estimates').render('error', { message: data.error });
    }
  });
};

App.prototype.history = function() {
  var self = this;
  self.showLoader();
  self.user.history(function(result) {
    self.hideLoader();
    if (result.success) {
      $('#content').render('history', {
        userLevel: result.userLevel,
        history: result.history
      });
      self.estimate();
    } else {
      $('#content').render('error', { message: result.error });
    }
  });
};

App.prototype.onClientError = function(error) {
  var message = "WK Error";
  if (error.message) {
    message += ": " + error.message;
  }
  $('#content').render('error', { message: message });
};

App.prototype.showLoader = function() {
  this.$loader.show();
};

App.prototype.hideLoader = function() {
  this.$loader.hide();
};

App.prototype.measureText = function(text) {
  var self = this;
  self.showLoader();
  self.user.unrecognizedKanji(text, function(result) {
    self.hideLoader();
    result.recognizable = result.kanjiCount - result.list.length;
    result.percentage = result.kanjiCount > 0
      ? (100 * result.recognizable / result.kanjiCount).toFixed(2)
      : 0;
    $('#measureStats').render('measureStats', result);
  });
};
