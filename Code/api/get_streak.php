<?php
require 'config.php';
if (empty($_SESSION['user_id'])) {
  echo json_encode(['streak'=>0]);
  exit;
}
$stmt = $pdo->prepare("SELECT streak FROM users WHERE id=?");
$stmt->execute([$_SESSION['user_id']]); 
echo json_encode(['streak'=> (int)$stmt->fetchColumn() ]);
