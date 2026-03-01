<?php
declare(strict_types=1);

use App\Http;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

require_once __DIR__ . '/lib/Config.php';
require_once __DIR__ . '/lib/Db.php';
require_once __DIR__ . '/lib/Http.php';
require_once __DIR__ . '/lib/Auth.php';
require_once __DIR__ . '/lib/Streak.php';

Http::initSession();

set_exception_handler(function (Throwable $e): void {
    error_log('API error: ' . $e->getMessage());
    Http::error('Server error', 500);
});
