<?php
// Secure cookie before starting the session.
// Keep this flexible so it also works on subdomains, staging URLs, or localhost.
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
  || (!empty($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] === 'https')
  || (!empty($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

session_set_cookie_params([
  'lifetime' => 60 * 60 * 24 * 30,  // 30 days
  'path'     => '/',
  // Leaving domain empty makes it "host-only" (most reliable across environments).
  'domain'   => '',
  'secure'   => $isHttps,
  'httponly' => true,
  'samesite' => 'Lax',
]);
session_start();

// Load DB credentials.
// Prefer the cPanel secret file, but allow local/dev deployments too.
$configPaths = [
  '/home/yso2dlxid2pc/.app_config.php',
  __DIR__ . '/.app_config.php',
  dirname(__DIR__) . '/.app_config.php',
];

$loaded = false;
foreach ($configPaths as $path) {
  if (is_readable($path)) {
    require_once $path;
    $loaded = true;
    break;
  }
}

if (!$loaded || !isset($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS)) {
  http_response_code(500);
  if (!headers_sent()) {
    header('Content-Type: application/json');
  }
  exit(json_encode(['error' => 'Server configuration error']));
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
