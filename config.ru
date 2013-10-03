use Rack::Static, :urls => [''], :root => 'build', :index => 'index.html'
run lambda { |env| [200, {}, ''] }
