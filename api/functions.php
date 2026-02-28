<?php
// functions.php
require_once __DIR__.'/config.php';

/** Helpers **/

function getUserId(): ?int {
    return $_SESSION['user_id'] ?? null;
}

function requireAuth(): void {
    if (! getUserId()) {
        http_response_code(401);
        exit(json_encode(['error'=>'Unauthorized']));
    }
}

function findUser(string $username): ?array {
    global $db;
    $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE username = ?");
    $stmt->execute([$username]);
    return $stmt->fetch() ?: null;
}

function createUser(string $username, string $password): int {
    global $db;
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    );
    if (! $stmt->execute([$username, $hash])) {
        throw new Exception('Username already taken');
    }
    return (int)$db->lastInsertId();
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
    $stmt = $db->prepare("SELECT streak FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return (int)$stmt->fetchColumn();
}

function updateStreak(int $userId, int $streak): void {
    global $db;
    $stmt = $db->prepare("UPDATE users SET streak = ? WHERE id = ?");
    $stmt->execute([$streak, $userId]);
}
