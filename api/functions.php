<?php
// api/functions.php
require_once __DIR__ . '/config.php';

function getUserId(): ?int {
  return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function requireAuth(): void {
  if (!getUserId()) {
    http_response_code(401);
    exit(json_encode(['error' => 'Unauthorized']));
  }
}

function findUser(string $username): ?array {
  global $db;
  $stmt = $db->prepare('SELECT id, password_hash FROM users WHERE username = ?');
  $stmt->execute([$username]);
  $row = $stmt->fetch();
  return $row ?: null;
}

function createUser(string $username, string $password): int {
  global $db;

  $hash = password_hash($password, PASSWORD_DEFAULT);

  try {
    $stmt = $db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    $stmt->execute([$username, $hash]);
    return (int)$db->lastInsertId();
  } catch (PDOException $e) {
    $sqlState = $e->getCode();
    $driverCode = (int)($e->errorInfo[1] ?? 0);

    if ($sqlState === '23000' || $driverCode === 1062) {
      throw new Exception('Username already taken');
    }

    throw $e;
  }
}

function verifyUser(string $username, string $password): ?int {
  $user = findUser($username);
  if ($user && password_verify($password, $user['password_hash'])) {
    return (int)$user['id'];
  }
  return null;
}

function getStreak(int $userId): int {
  global $db;
  $stmt = $db->prepare('SELECT streak FROM users WHERE id = ?');
  $stmt->execute([$userId]);
  return (int)$stmt->fetchColumn();
}

function updateStreak(int $userId, int $streak): void {
  global $db;
  $stmt = $db->prepare('UPDATE users SET streak = ? WHERE id = ?');
  $stmt->execute([$streak, $userId]);
}
