<?php
declare(strict_types=1);

function json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function respond(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

function ok(array $payload = []): void {
  respond(200, $payload);
}

function bad_request(string $message): void {
  respond(400, ['success' => false, 'error' => $message]);
}

function unauthorized(string $message = 'Unauthorized'): void {
  respond(401, ['success' => false, 'error' => $message]);
}

function server_error(string $message = 'Server error'): void {
  respond(500, ['success' => false, 'error' => $message]);
}
