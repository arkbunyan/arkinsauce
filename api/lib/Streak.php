<?php
declare(strict_types=1);

namespace App;

final class Streak
{
    public static function get(int $userId): int
    {
        $db = Db::pdo();
        $stmt = $db->prepare('SELECT streak FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $val = $stmt->fetchColumn();
        return is_numeric($val) ? (int)$val : 0;
    }

    public static function set(int $userId, int $streak): void
    {
        $streak = max(0, $streak);
        $db = Db::pdo();
        $stmt = $db->prepare('UPDATE users SET streak = ? WHERE id = ?');
        $stmt->execute([$streak, $userId]);
    }
}
