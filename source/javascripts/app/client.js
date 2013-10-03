function Client(apiKey) {
  this.setApiKey(apiKey);
  this._cache = {};
}

Client.prototype.URL = 'http://www.wanikani.com/api/user';
Client.prototype.LEVELS = 50;

Client.prototype.setApiKey = function(apiKey) {
  this.apiKey = apiKey;
};

Client.prototype.api = function(resource, callback) {
  var self = this;
  if (self._cache[resource]) {
    callback(self._cache[resource]);
  } else {
    var url = self.URL + '/' + self.apiKey + '/' + resource;
    $.getJSON(url + '?callback=?', null, function(data) {
      // cache if succesfull
      if (!data.hasOwnProperty('error')) {
        self._cache[resource] = data;
      }
      callback(data);
    });
  }
};
