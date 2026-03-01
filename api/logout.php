<?php
header('Content-Type: application/json');

try {
  require_once __DIR__.'/config.php';
  session_unset();
  session_destroy();
  echo json_encode(['success'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
