<?php
define('ROOT', __DIR__ . '/..');

require ROOT . '/vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request,
    Symfony\Component\HttpFoundation\Response;

date_default_timezone_set('UTC');
$app = new Silex\Application;
$app['debug'] = true;

// Defining and configuring DI services
$app->register(new Silex\Provider\TwigServiceProvider, array(
    'twig.path' => ROOT . '/views',
));
$app['twig'] = $app->share($app->extend('twig', function($twig, $app) {
    $url = function($path) use ($app) {
        return $app['request']->getBaseUrl() . $path;
    };

    $twig->addFunction(new Twig_SimpleFunction('url', $url, array(
        'is_safe' => array('html'),
    )));

    $twig->addFilter(new Twig_SimpleFilter('time_interval', function($interval) {
        $units = array('days' => 86400, 'hours' => 3600);
        $s = '';
        foreach ($units as $unit => $seconds) {
            $value = (int)($interval / $seconds);
            if ($value) {
                if ($s) {
                    $s .= ', ';
                }
                $s .= "$value $unit";
                $interval -= $value * $seconds;
            }
        }
        return $s ? $s : '0 days';
    }));

    return $twig;
}));

// Defining routes and middlewares
$app->before(function(Request $request)  use ($app) {
    if ($request->getMethod() === 'POST') {
        $app['twig']->addGlobal('apiKey', $request->request->get('apiKey', ''));
    }
});

$app->get('/', function() use ($app) {
    return $app['twig']->render('index.twig');
});

$app->post('/', function(Request $request) use ($app) {
    $apiKey = $request->request->get('apiKey', '');
    // At the moment only history command is available, if there will be
    // more operations, we can distinguish them by looking at 'op'
    $history = new Wstats\History($apiKey);
    $result = $history->load();
    if ($result['success']) {
        return $app['twig']->render('history.twig', array(
            'userLevel' => $result['userLevel'],
            'history' => $result['history'],
        ));
    }
    return $app['twig']->render('user-error.twig', array(
        'error' => $result['error'],
    ));
});

// 3.. 2.. 1..
$app->run();
