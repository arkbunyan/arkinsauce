<?php
// secure cookie before starting the session

$isHttps =
  (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
  (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

session_set_cookie_params([
  'lifetime' => 60*60*24*30,
  'path'     => '/',
  'secure'   => $isHttps,
  'httponly' => true,
  'samesite' => 'Lax',
]);

session_start();

// Load DB credentials.
// Preferred: store .app_config.php in your home directory (outside public_html).
// Fallbacks allow local testing or alternative layouts.
$configCandidates = [
  '/home/yso2dlxid2pc/.app_config.php',
  dirname(__DIR__) . '/.app_config.php',
  __DIR__ . '/.app_config.php',
];

$loaded = false;
foreach ($configCandidates as $path) {
  if (is_readable($path)) {
    require_once $path;
    $loaded = true;
    break;
  }
}

if (! $loaded || !isset($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS)) {
  http_response_code(500);
  exit(json_encode(['error' => 'Missing DB config']));
}

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
try {
  $db = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
  http_response_code(500);
  exit(json_encode(['error' => 'Database connection failed']));
}
