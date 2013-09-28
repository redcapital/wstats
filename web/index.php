<?php

require __DIR__ . '/../vendor/autoload.php';

$app = new Silex\Application;

$app->get('/', function() use ($app) {
  return 'hello world!';
});

$app->run();
