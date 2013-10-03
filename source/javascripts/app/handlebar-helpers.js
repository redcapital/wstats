Handlebars.registerHelper('datetime', function(value) {
  var date = new Date(value * 1000);
  return date.toUTCString();
});

Handlebars.registerHelper('timeInterval', function(interval) {
  var units = { days: 86400, hours: 3600 }, s = '';
  for (var unit in units) {
    value = Math.floor(interval / units[unit]);
    if (value > 0) {
      if (s) {
        s += ', ';
      }
      s += value + ' ' + unit;
      interval -= value * units[unit];
    }
  }
  return s.length ? s : '0 days';
});

Handlebars.registerHelper('history', function(context, options) {
  var s = '', data;
  for (var level = 1; level < context.userLevel; level++) {
    if (!context.history[level]) continue;
    s += '<tr class="jsCompletedLevel selected">';
    data = { level: level };
    s += options.fn(context.history[level], { data: data });
    s += '</tr>';
  }
  return s;
});
