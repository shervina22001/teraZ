<?php

return [
    'paths' => [
        'api/*', 
        'sanctum/csrf-cookie', 
        'login', 
        'logout',
        'profile',
        'admin/*'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8000',
        'http://teraz.test',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
