<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\Auth;
use App\Http;
use App\Streak;

$userId = Auth::requireAuth();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    Http::ok(['streak' => Streak::get($userId)]);
}

if ($method === 'POST') {
    $body = Http::jsonBody(['streak']);

    $raw = $body['streak'];
    if (!is_int($raw) && !is_numeric($raw)) {
        Http::error('Invalid streak', 400);
    }

    Streak::set($userId, (int)$raw);
    Http::ok(['success' => true]);
}

http_response_code(405);
header('Allow: GET, POST');
Http::ok(['error' => 'Method not allowed'], 405);
