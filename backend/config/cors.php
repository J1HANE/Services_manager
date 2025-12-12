<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:5176',
        'http://127.0.0.1:5176',
        'http://localhost:5177',
        'http://127.0.0.1:5177',
        'http://localhost:5178',
        'http://127.0.0.1:5178',
        'http://localhost:3000',
        'http://192.168.56.1:5173',
        'http://192.168.56.1:5174',
        'http://192.168.56.1:5176',
        'http://192.168.56.1:5177',
        'http://192.168.56.1:5178',
    ],

    'allowed_origins_patterns' => [
        '#^http://localhost:\d+$#',
        '#^http://127\.0\.0\.1:\d+$#',
        '#^http://192\.168\.\d+\.\d+:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
