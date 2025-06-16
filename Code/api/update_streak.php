<?php
require 'config.php';
if (empty($_SESSION['user_id'])) {
  http_response_code(403);
  exit('{"error":"Not logged in"}');
}
$data = json_decode(file_get_contents('php://input'), true);
$new = max(0, intval($data['streak']));
$stmt = $pdo->prepare("UPDATE users SET streak=? WHERE id=?");
$stmt->execute([$new, $_SESSION['user_id']]);
echo json_encode(['success'=>true]);
