<?php
session_set_cookie_params([
  'path' => '/',       // root of domain
  'httponly' => true,  // good practice
  
]);

session_start();
$DB_HOST = 'localhost';
$DB_NAME = 'wordle_clone';
$DB_USER = 'wordle_user'; 
$DB_PASS = '!acs6sg~UCHC';

try {
  $pdo = new PDO(
    "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8",
    $DB_USER,
    $DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
} catch (Exception $e) {
  http_response_code(500);
  exit('Database connection error');
}
