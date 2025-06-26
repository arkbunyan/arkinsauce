<?php
require 'config.php';
$data = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare("SELECT id,password_hash FROM users WHERE username=?");
$stmt->execute([$data['username']]);
$user = $stmt->fetch();
if ($user && password_verify($data['password'], $user['password_hash'])) {
  $_SESSION['user_id'] = $user['id'];
  echo json_encode(['success'=>true]);
} else {
  echo json_encode(['error'=>'Invalid login']);
}
