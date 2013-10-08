function User(client) {
  this.client = client;
}

User.prototype.history = function(callback) {
  var self = this;

  function processData(data) {
    // maxLevel represents maximum unlocked level, it's not the same as user
    // level, sometimes WK doesn't immediately return data about unlocked 
    // level
    var history = {}, maxLevel = 0;
    $.each(data.requested_information, function(i, radical) {
      if (radical.stats) {
        var level = radical.level;
        maxLevel = Math.max(level, maxLevel);
        if (history[level]) {
          history[level].date = Math.min(history[level].date, radical.stats.unlocked_date);
        } else {
          history[level] = { date: radical.stats.unlocked_date };
        }
      }
    });
    if (maxLevel < 2) {
      return {
        success: false, 
        error: 'History is available only after reaching level 2'
      };
    }

    var maxTook = 0;
    $.each(history, function(level, record) {
      level = parseInt(level, 10);
      if (history[level + 1]) {
        record.took = history[level + 1].date - record.date;
        maxTook = Math.max(maxTook, record.took);
      }
    });
    $.each(history, function(level, record) {
      if (record.took) {
        record.tookPercentage = 100 * record.took / maxTook;
      }
    });

    return {
      success: true,
      userLevel: maxLevel,
      history: history
    };
  }

  if (self._history) {
    callback(self._history);
  } else {
    self.client.api('radicals', function(data) {
      var history = processData(data);
      if (history.success) {
        self._history = history;
      }
      callback(history);
    });
  }


};

User.prototype.estimate = function(levels, callback) {
  var self = this;

  function processData(data) {
    if (!data.success) {
      return {
        success: false,
        error: data.error
      };
    }
    var average = 0, count = 0, estimates = {};
    $.each(data.history, function(level, record) {
      level = parseInt(level, 10);
      if (levels.indexOf(level) != -1) {
        average += record.took;
        count++;
      }
    });
    if (count) {
      average = Math.floor(average / count);
    }
    var date = data.history[data.userLevel].date;
    for (var level = data.userLevel; level <= self.client.LEVELS; level++) {
      date += average;
      estimates[level] = date;
    }

    return {
      success: true,
      average: average,
      estimates: estimates
    };
  }

  self.history(function(data) {
    callback(processData(data));
  });
};

User.prototype.info = function(callback) {
  this.client.api('user-information', function(data) {
    callback(data.user_information);
  });
};

User.prototype.unrecognizedKanji = function(text, callback) {
  var self = this;

  function searchUnrecognized() {
    text = text.replace(/[^\u4e00-\u9faf]+/g, '');
    var list = [], i, len, seen = {}, count = 0;
    for (i = 0, len = text.length; i < len; i++) {
      if (seen[text[i]]) continue;
      seen[text[i]] = true;
      ++count;
      if (!self._indexedKanjis[text[i]]) {
        list.push(text[i]);
      }
    }
    return { kanjiCount: count, list: list };
  }

  if (!self._indexedKanjis) {
    self._indexedKanjis = {};
    self.client.api('kanji', function(data) {
      var kanjis = data.requested_information;
      for (var i = 0, len = kanjis.length; i < len; i++) {
        self._indexedKanjis[kanjis[i].character] = true;
      }
      callback(searchUnrecognized());
    });
  } else {
    callback(searchUnrecognized());
  }
};

