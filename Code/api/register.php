<?php
require 'config.php';
$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['username']) || empty($data['password'])) {
  echo json_encode(['error'=>'Missing username or password']);
  exit;
}
$hash = password_hash($data['password'], PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (username,password_hash) VALUES (?,?)");
if ($stmt->execute([$data['username'], $hash])) {
  echo json_encode(['success'=>true]);
} else {
  echo json_encode(['error'=>'Username already taken']);
}
