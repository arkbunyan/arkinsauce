<?php
// config.php
session_start();

$host     = 'localhost';
$dbname   = 'your_database';
$user     = 'your_db_user';
$pass     = 'your_db_pass';
$charset  = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
  $db = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
  http_response_code(500);
  exit(json_encode(['error'=>'Database connection failed']));
}
