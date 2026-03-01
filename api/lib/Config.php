<?php
declare(strict_types=1);

namespace App;

final class Config
{
    /**
     * Loads DB config from a .app_config.php file that defines:
     * $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS
     */
    public static function load(): array
    {
        $candidates = [];

        // Typical cPanel layout: /home/<user>/public_html/api
        $candidates[] = dirname(__DIR__, 3) . '/.app_config.php'; // /home/<user>/.app_config.php
        $candidates[] = dirname(__DIR__, 2) . '/.app_config.php'; // /home/<user>/public_html/.app_config.php

        $home = getenv('HOME');
        if (is_string($home) && $home !== '') {
            $candidates[] = rtrim($home, '/'). '/.app_config.php';
        }

        $loadedPath = null;
        foreach ($candidates as $path) {
            if (is_string($path) && is_readable($path)) {
                $loadedPath = $path;
                break;
            }
        }

        if ($loadedPath === null) {
            return ['ok' => false, 'error' => 'Missing .app_config.php'];
        }

        // Load variables in local scope.
        $DB_HOST = null;
        $DB_NAME = null;
        $DB_USER = null;
        $DB_PASS = null;
        /** @noinspection PhpIncludeInspection */
        require $loadedPath;

        if (!is_string($DB_HOST) || !is_string($DB_NAME) || !is_string($DB_USER) || !is_string($DB_PASS)) {
            return ['ok' => false, 'error' => 'Invalid DB config'];
        }

        return [
            'ok' => true,
            'host' => $DB_HOST,
            'name' => $DB_NAME,
            'user' => $DB_USER,
            'pass' => $DB_PASS,
        ];
    }
}
