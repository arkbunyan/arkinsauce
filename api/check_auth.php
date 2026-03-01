<?php
header('Content-Type: application/json');

try {
  require_once __DIR__ . '/config.php';
  // Always return a boolean so the frontend doesn't have to guess.
  echo json_encode(['loggedIn' => !empty($_SESSION['user_id'])]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}