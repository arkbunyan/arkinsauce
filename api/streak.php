<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $uid = current_user_id();
  if ($uid === null) {
    ok(['streak' => 0]);
  }

  $stmt = $db->prepare('SELECT streak FROM streaks WHERE user_id = ? LIMIT 1');
  $stmt->execute([$uid]);
  $row = $stmt->fetch();

  ok(['streak' => $row ? (int)$row['streak'] : 0]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $uid = require_login();

  $body = json_body();
  $streak = (int)($body['streak'] ?? 0);
  if ($streak < 0) $streak = 0;
  if ($streak > 9999) $streak = 9999;

  $stmt = $db->prepare('INSERT INTO streaks (user_id, streak) VALUES (?, ?) ON DUPLICATE KEY UPDATE streak = VALUES(streak)');
  $stmt->execute([$uid, $streak]);

  ok(['success' => true, 'streak' => $streak]);
}

bad_request('Unsupported method');
