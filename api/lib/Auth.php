<?php
declare(strict_types=1);

namespace App;

use PDOException;

final class Auth
{
    public static function userId(): ?int
    {
        $id = $_SESSION['user_id'] ?? null;
        return is_int($id) ? $id : (is_numeric($id) ? (int)$id : null);
    }

    public static function requireAuth(): int
    {
        $id = self::userId();
        if (!$id) {
            Http::error('Unauthorized', 401);
        }
        return $id;
    }

    public static function login(string $username, string $password): void
    {
        $username = self::cleanUsername($username);
        self::validatePassword($password);

        $db = Db::pdo();
        $stmt = $db->prepare('SELECT id, password_hash FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $row = $stmt->fetch();

        if (!$row || !is_string($row['password_hash'] ?? null) || !password_verify($password, $row['password_hash'])) {
            Http::error('Invalid credentials', 401);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$row['id'];
    }

    public static function register(string $username, string $password): void
    {
        $username = self::cleanUsername($username);
        self::validatePassword($password);

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $db = Db::pdo();

        try {
            $stmt = $db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
            $stmt->execute([$username, $hash]);
        } catch (PDOException $e) {
            // Duplicate username (unique index)
            Http::error('Username already taken', 400);
        }

        $_SESSION['user_id'] = (int)$db->lastInsertId();
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_unset();
            session_destroy();
        }
    }

    private static function cleanUsername(string $username): string
    {
        $username = trim($username);
        $username = preg_replace('/\s+/', '', $username) ?? '';

        // Only allow letters/numbers/_/.
        if (!preg_match('/^[A-Za-z0-9_.]{3,24}$/', $username)) {
            Http::error('Username must be 3-24 chars (letters, numbers, _ or .)', 400);
        }

        return $username;
    }

    private static function validatePassword(string $password): void
    {
        $password = (string)$password;
        if (strlen($password) < 6 || strlen($password) > 72) {
            Http::error('Password must be 6-72 chars', 400);
        }
    }
}
