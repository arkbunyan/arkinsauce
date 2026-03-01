<?php
declare(strict_types=1);

namespace App;

final class Http
{
    public static function initSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');

        session_name('arkinsauce_session');

        session_set_cookie_params([
            'lifetime' => 60 * 60 * 24 * 30,
            'path' => '/',
            'secure' => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_start();
    }

    /** @return array<string, mixed> */
    public static function jsonBody(array $requiredKeys = []): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);

        if (!is_array($data)) {
            self::error('Invalid JSON', 400);
        }

        foreach ($requiredKeys as $k) {
            if (!array_key_exists($k, $data) || $data[$k] === null || $data[$k] === '') {
                self::error('Missing required field: ' . $k, 400);
            }
        }

        /** @var array<string, mixed> $data */
        return $data;
    }

    /** @param array<string, mixed> $data */
    public static function ok(array $data = [], int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    public static function error(string $message, int $status = 400): void
    {
        http_response_code($status);
        echo json_encode(['error' => $message]);
        exit;
    }
}
