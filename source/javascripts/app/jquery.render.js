(function($) {
  "use strict";

  var R = $.render = {
    templates: {},

    addTemplate: function(templateName, template) {
      R.templates[templateName] = template;
    }
  };

  $.fn.render = function(template, options) {
    return this.each(function() {
      $(this).html(R.templates[template](options));
    });
  };

}(jQuery));
