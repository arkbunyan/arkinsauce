<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\Auth;
use App\Http;

$body = Http::jsonBody(['username', 'password']);
Auth::register((string)$body['username'], (string)$body['password']);
Http::ok(['success' => true]);
