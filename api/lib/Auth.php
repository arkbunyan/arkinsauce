<?php
declare(strict_types=1);

function current_user_id(): ?int {
  if (!isset($_SESSION['user_id'])) return null;
  $id = (int)$_SESSION['user_id'];
  return $id > 0 ? $id : null;
}

function require_login(): int {
  $id = current_user_id();
  if ($id === null) {
    unauthorized();
  }
  return $id;
}

function normalize_username(string $raw): string {
  $u = trim($raw);
  $u = preg_replace('/\s+/', '', $u);
  return strtolower($u ?? '');
}
