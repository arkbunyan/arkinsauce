<?php
// api/config.php
// Shared bootstrap for sessions + database.

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
  || (!empty($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] === 'https')
  || (!empty($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

// Some shared hosts misconfigure the default session save path.
// If it's missing or not writable, store sessions in /api/sessions instead.
$rawSavePath = (string)ini_get('session.save_path');
$savePath = $rawSavePath;
if (strpos($rawSavePath, ';') !== false) {
  $parts = explode(';', $rawSavePath);
  $savePath = (string)end($parts);
}

$savePathOk = $savePath !== '' && @is_dir($savePath) && @is_writable($savePath);
if (!$savePathOk) {
  $localSessionPath = __DIR__ . '/sessions';
  if (!is_dir($localSessionPath)) {
    @mkdir($localSessionPath, 0700, true);
  }
  ini_set('session.save_path', $localSessionPath);
}

// Secure cookie settings before starting the session.
// Leaving domain empty makes it host-only (more reliable across environments).
session_set_cookie_params([
  'lifetime' => 60 * 60 * 24 * 30,
  'path' => '/',
  'domain' => '',
  'secure' => $isHttps,
  'httponly' => true,
  'samesite' => 'Lax',
]);

session_start();

// ---- Database config ----
// Priority:
//  1) Environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASS)
//  2) .app_config.php file located outside public_html (recommended)
//  3) .app_config.php inside this repo (for local/dev)

$DB_HOST = getenv('DB_HOST') ?: null;
$DB_NAME = getenv('DB_NAME') ?: null;
$DB_USER = getenv('DB_USER') ?: null;
$DB_PASS = getenv('DB_PASS') ?: null;

if (!$DB_HOST || !$DB_NAME || !$DB_USER || $DB_PASS === null) {
  $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
  $homeDir = $docRoot ? dirname($docRoot) : '';

  $configPaths = array_filter([
    $homeDir ? ($homeDir . '/.app_config.php') : null,
    __DIR__ . '/.app_config.php',
    dirname(__DIR__) . '/.app_config.php',
  ]);

  foreach ($configPaths as $path) {
    if (is_readable($path)) {
      require $path;
      break;
    }
  }
}

if (!isset($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS) || !$DB_HOST || !$DB_NAME || !$DB_USER) {
  http_response_code(500);
  if (!headers_sent()) {
    header('Content-Type: application/json');
  }
  exit(json_encode(['error' => 'Server configuration error']));
}

if (!class_exists('PDO')) {
  http_response_code(500);
  if (!headers_sent()) {
    header('Content-Type: application/json');
  }
  exit(json_encode(['error' => 'Server missing PDO extension']));
}

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
  $db = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Throwable $e) {
  http_response_code(500);
  if (!headers_sent()) {
    header('Content-Type: application/json');
  }
  exit(json_encode(['error' => 'Database connection failed']));
}
