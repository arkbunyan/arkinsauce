<?php
require_once __DIR__ . '/bootstrap.php';

$uid = current_user_id();
if ($uid === null) {
  ok(['loggedIn' => false]);
}

$stmt = $db->prepare('SELECT username FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$uid]);
$row = $stmt->fetch();

ok(['loggedIn' => true, 'username' => $row ? $row['username'] : null]);
