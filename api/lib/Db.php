<?php
declare(strict_types=1);

function load_app_config(): array {
  // Preferred: /home/<cpanel_user>/.app_config.php (outside public_html)
  $candidates = [
    __DIR__ . '/../../../.app_config.php', // api/lib -> api -> public_html -> home
    __DIR__ . '/../../.app_config.php',
    __DIR__ . '/../config.php', // optional fallback if you put config in api/
  ];

  foreach ($candidates as $path) {
    if (is_readable($path)) {
      require $path;
      if (isset($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS)) {
        return [
          'host' => (string)$DB_HOST,
          'name' => (string)$DB_NAME,
          'user' => (string)$DB_USER,
          'pass' => (string)$DB_PASS,
        ];
      }
    }
  }

  server_error('Missing database config (.app_config.php).');
  return [];
}

function db_connect(): PDO {
  $cfg = load_app_config();
  $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $cfg['host'], $cfg['name']);

  try {
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
  } catch (Throwable $e) {
    server_error('Database connection failed.');
    return new PDO('sqlite::memory:'); // unreachable
  }
}
