<?php
// Route game requests
header('Content-Type: application/json');
require_once __DIR__.'/../functions.php';

// Parse the request path - /api/game/streak -> action = 'streak'
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));
$action = end($parts); // Get last part of URI

try {
    if ($action === 'streak') {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            requireAuth();
            $current = getStreak(getUserId());
            echo json_encode(['success'=>true, 'data'=>['streak' => $current]]);
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);
            if (! isset($data['streak']) || ! is_int($data['streak'])) {
                http_response_code(400);
                exit(json_encode(['success'=>false, 'error'=>'Invalid streak']));
            }
            updateStreak(getUserId(), $data['streak']);
            echo json_encode(['success'=>true, 'data'=>['message'=>'Streak updated']]);
        }
        else {
            http_response_code(405);
            echo json_encode(['success'=>false, 'error'=>'Method not allowed']);
        }
    }
    else {
        http_response_code(404);
        echo json_encode(['success'=>false, 'error'=>'Action not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false, 'error'=>'Server error']);
}
