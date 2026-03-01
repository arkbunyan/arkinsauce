<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  bad_request('POST required');
}

$body = json_body();
$username = normalize_username((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || strlen($username) < 3 || strlen($username) > 32) {
  bad_request('Username must be 3-32 characters');
}
if (!preg_match('/^[a-z0-9_]+$/', $username)) {
  bad_request('Username can only use letters, numbers, and underscore');
}
if (strlen($password) < 4 || strlen($password) > 200) {
  bad_request('Password must be 4+ characters');
}

$hash = password_hash($password, PASSWORD_DEFAULT);
if ($hash === false) {
  server_error('Password hashing failed');
}

try {
  $db->beginTransaction();

  $stmt = $db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  $stmt->execute([$username, $hash]);

  $userId = (int)$db->lastInsertId();

  $stmt2 = $db->prepare('INSERT INTO streaks (user_id, streak) VALUES (?, 0)');
  $stmt2->execute([$userId]);

  $db->commit();

  $_SESSION['user_id'] = $userId;

  ok(['success' => true, 'username' => $username]);
} catch (Throwable $e) {
  if ($db->inTransaction()) $db->rollBack();

  // Duplicate username
  if (strpos($e->getMessage(), 'Duplicate') !== false) {
    bad_request('Username already taken');
  }
  server_error('Registration failed');
}
