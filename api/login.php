<?php
header('Content-Type: application/json');
require_once __DIR__.'/functions.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    exit(json_encode(['error'=>'Missing username or password']));
}

$userId = verifyUser($data['username'], $data['password']);
if ($userId) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    echo json_encode(['success'=>true]);
} else {
    http_response_code(401);
    echo json_encode(['error'=>'Invalid credentials']);
}