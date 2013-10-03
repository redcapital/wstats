require 'sprockets'
require 'sprockets/engines'
require 'barber'

class HandlebarsTemplate < Tilt::Template
  self.default_mime_type = 'application/javascript'

  @@options = {
    template_path: "templates"
  }

  def self.options=(options)
    @@options.merge!(options)
  end

  def prepare ; end

  def evaluate(scope, locals, &block)
    name = template_name(scope.logical_path).inspect
    template = precompile_handlebars(data)
    "jQuery.render.addTemplate(#{name}, #{template})"
  end

  private

  def precompile_handlebars(string)
    Barber::InlinePrecompiler.call(string)
  end

  def template_name(path)
    template_path = @@options[:template_path]
    path.sub!(/#{Regexp.quote(template_path)}\/?/, '')
    path
  end
end

::Sprockets.register_engine '.hbs', HandlebarsTemplate
::Sprockets.register_engine '.handlebars', HandlebarsTemplate
