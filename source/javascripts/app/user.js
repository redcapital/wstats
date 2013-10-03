function User(client) {
  this.client = client;
}

User.prototype.history = function(callback) {
  var self = this;

  var processData = function(data) {
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

    var average = 0;
    $.each(history, function(level, record) {
      level = parseInt(level, 10);
      if (history[level + 1]) {
        record.took = history[level + 1].date - record.date;
        average += record.took;
      }
    });

    average = Math.floor(average / (maxLevel - 1));
    var date = history[maxLevel].date;
    for (var level = maxLevel; level <= self.client.LEVELS; level++) {
      if (level > maxLevel) {
        date += average;
        history[level] = { date: date };
      }
      history[level].took = average;
    }

    return {
      success: true,
      userLevel: maxLevel,
      history: history
    };
  };

  self.client.api('radicals', function(data) {
    callback(processData(data));
  });
}

