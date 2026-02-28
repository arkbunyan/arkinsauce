<?php
header('Content-Type: application/json');
require_once __DIR__.'/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    $current = getStreak(getUserId());
    echo json_encode(['streak' => $current]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    if (! isset($data['streak']) || ! is_int($data['streak'])) {
        http_response_code(400);
        exit(json_encode(['error'=>'Invalid streak']));
    }

    updateStreak(getUserId(), $data['streak']);
    echo json_encode(['success'=>true]);

} else {
    http_response_code(405);
    header('Allow: GET, POST');
    echo json_encode(['error'=>'Method not allowed']);
}
