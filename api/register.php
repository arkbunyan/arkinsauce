<?php
header('Content-Type: application/json');
require_once __DIR__.'/functions.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    exit(json_encode(['error'=>'Missing username or password']));
}

try {
    $newId = createUser($data['username'], $data['password']);
    $_SESSION['user_id'] = $newId;
    echo json_encode(['success'=>true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error'=>$e->getMessage()]);
}
