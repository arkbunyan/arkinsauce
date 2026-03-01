<?php
// detect if local or production
$isLocal = ($_SERVER['HTTP_HOST'] ?? '');
$isLocal = strpos($isLocal, 'localhost') !== false || strpos($isLocal, '127.0.0.1') !== false;

// secure cookie before starting the session
session_set_cookie_params([
  'lifetime' => 60*60*24*30,
  'path'     => '/',
  'domain'   => $isLocal ? '' : 'arkinsauce.com',
  'secure'   => !$isLocal,
  'httponly' => true,
  'samesite' => 'Lax',
]);
session_start();

// check cPanel path first, fallback to local
if (file_exists('/home/yso2dlxid2pc/.app_config.php')) {
  require_once '/home/yso2dlxid2pc/.app_config.php';
} else {
  require_once __DIR__ . '/.app_config.php';
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
