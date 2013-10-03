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

Handlebars.registerHelper('history_item', function(level, userLevel) {
  var s = '<tr ';
  console.log(level, userLevel);
  if (level >= userLevel) {
    s += 'class="estimate"';
  }
  s += '>';
  s += '<td>' + this.key + '</td>';
  s += '<td>' + Handlebars.helpers.datetime.apply(this, [this.date]) + '</td>';
  s += '<td> </td>';
  s += '</tr>';
  return new Handlebars.SafeString(s);
});

Handlebars.registerHelper('history', function(context, options) {
  var s = '', data;
  for (var level = 1; level < 51; level++) {
    if (!context.history[level]) continue;
    s += '<tr ';
    if (level >= context.userLevel) {
      s += 'class="estimate"';
    }
    data = { level: level };
    s += '>' + options.fn(context.history[level], { data: data }) + '</tr>';
  }
  return s;
});
