<?php
require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  bad_request('POST required');
}

$body = json_body();
$username = normalize_username((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
  bad_request('Missing username or password');
}

$stmt = $db->prepare('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
  unauthorized('Invalid username or password');
}

// Ensure streak row exists
$stmt2 = $db->prepare('INSERT IGNORE INTO streaks (user_id, streak) VALUES (?, 0)');
$stmt2->execute([(int)$user['id']]);

$_SESSION['user_id'] = (int)$user['id'];

ok(['success' => true, 'username' => $user['username']]);
