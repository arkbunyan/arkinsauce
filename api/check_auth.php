<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

echo json_encode([
  'loggedIn' => isset($_SESSION['user_id']) && $_SESSION['user_id']
]);