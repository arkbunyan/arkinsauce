<?php
header('Content-Type: application/json');

try {
  require_once __DIR__ . '/config.php';
  echo json_encode(['loggedIn' => isset($_SESSION['user_id']) && $_SESSION['user_id']]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
exit();