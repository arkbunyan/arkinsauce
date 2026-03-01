<?php
// Route auth requests
header('Content-Type: application/json');
require_once __DIR__.'/../functions.php';

// Parse the request path - /api/auth/login -> action = 'login'
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));
$action = end($parts); // Get last part of URI

try {
    if ($action === 'check') {
        echo json_encode(['success' => true, 'data' => ['loggedIn' => isset($_SESSION['user_id']) && $_SESSION['user_id']]]);
    }
    elseif ($action === 'login') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['username']) || empty($data['password'])) {
            http_response_code(400);
            exit(json_encode(['success'=>false, 'error'=>'Missing username or password']));
        }
        $userId = verifyUser($data['username'], $data['password']);
        if ($userId) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            echo json_encode(['success'=>true, 'data'=>['userId'=>$userId, 'message'=>'Login successful']]);
        } else {
            http_response_code(401);
            echo json_encode(['success'=>false, 'error'=>'Invalid credentials']);
        }
    }
    elseif ($action === 'register') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['username']) || empty($data['password'])) {
            http_response_code(400);
            exit(json_encode(['success'=>false, 'error'=>'Missing username or password']));
        }
        try {
            $newId = createUser($data['username'], $data['password']);
            $_SESSION['user_id'] = $newId;
            echo json_encode(['success'=>true, 'data'=>['userId'=>$newId, 'message'=>'Registration successful']]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success'=>false, 'error'=>$e->getMessage()]);
        }
    }
    elseif ($action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(['success'=>true, 'data'=>['message'=>'Logout successful']]);
    }
    else {
        http_response_code(404);
        echo json_encode(['success'=>false, 'error'=>'Action not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false, 'error'=>'Server error']);
}
