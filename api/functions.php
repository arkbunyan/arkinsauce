
<?php
// API Functions and Helpers
require_once __DIR__.'/config.php';

// Get the current user ID from session
function getUserId(): ?int {
    return $_SESSION['user_id'] ?? null;
}

// Require authentication 
function requireAuth(): void {
    if (! getUserId()) {
        http_response_code(401);
        exit(json_encode(['error'=>'Unauthorized']));
    }
}

// Find a user by username
function findUser(string $username): ?array {
    global $db;
    $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE username = ?");
    $stmt->execute([$username]);
    return $stmt->fetch() ?: null;
}

// Create a new user with hashed password
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

// Verify user credentials. Returns user ID if valid, null otherwise.
function verifyUser(string $username, string $password): ?int {
    $user = findUser($username);
    if ($user && password_verify($password, $user['password_hash'])) {
        return (int)$user['id'];
    }
    return null;
}

// Get user's current streak
function getStreak(int $userId): int {
    global $db;
    $stmt = $db->prepare("SELECT streak FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return (int)$stmt->fetchColumn();
}

// Update user's streak
function updateStreak(int $userId, int $streak): void {
    global $db;
    $stmt = $db->prepare("UPDATE users SET streak = ? WHERE id = ?");
    $stmt->execute([$streak, $userId]);
