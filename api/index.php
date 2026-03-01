<?php
/**
 * API Router
 * Handles all API requests and routes them to appropriate handlers
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load core dependencies
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

// Parse the request URI
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/^\/api/', '', $path);
$parts = array_filter(explode('/', trim($path, '/')));
$parts = array_values($parts); // Re-index array

// Route the request
if (empty($parts)) {
    http_response_code(404);
    exit(json_encode(['success' => false, 'error' => 'Not found']));
}

$method = $_SERVER['REQUEST_METHOD'];
$resource = $parts[0] ?? null;
$action = $parts[1] ?? null;

try {
    // Auth routes
    if ($resource === 'auth') {
        switch ($action) {
            case 'check':
                handleAuthCheck();
                break;
            case 'login':
                if ($method !== 'POST') {
                    throw new ApiException('Method not allowed', 405);
                }
                handleLogin();
                break;
            case 'register':
                if ($method !== 'POST') {
                    throw new ApiException('Method not allowed', 405);
                }
                handleRegister();
                break;
            case 'logout':
                if ($method !== 'POST') {
                    throw new ApiException('Method not allowed', 405);
                }
                handleLogout();
                break;
            default:
                throw new ApiException('Not found', 404);
        }
    }
    // Game routes
    elseif ($resource === 'game') {
        switch ($action) {
            case 'streak':
                handleStreak($method);
                break;
            default:
                throw new ApiException('Not found', 404);
        }
    }
    // Fallback
    else {
        throw new ApiException('Not found', 404);
    }
} catch (ApiException $e) {
    http_response_code($e->getStatusCode());
    exit(json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]));
} catch (Exception $e) {
    http_response_code(500);
    error_log('API Error: ' . $e->getMessage());
    exit(json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]));
}

/**
 * API Exception Class
 */
class ApiException extends Exception {
    private int $statusCode;

    public function __construct(string $message = '', int $statusCode = 400) {
        parent::__construct($message);
        $this->statusCode = $statusCode;
    }

    public function getStatusCode(): int {
        return $this->statusCode;
    }
}

/**
 * Helper: Get JSON input
 */
function getJsonInput(): ?array {
    $input = file_get_contents('php://input');
    return $input ? json_decode($input, true) : null;
}

/**
 * Handler: Check Authentication
 */
function handleAuthCheck(): void {
    $isLoggedIn = isset($_SESSION['user_id']) && $_SESSION['user_id'];
    
    if ($isLoggedIn) {
        echo json_encode([
            'success' => true,
            'data' => [
                'loggedIn' => true,
                'userId' => $_SESSION['user_id']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => ['loggedIn' => false]
        ]);
    }
}

/**
 * Handler: Login
 */
function handleLogin(): void {
    $data = getJsonInput();
    
    if (empty($data['username']) || empty($data['password'])) {
        throw new ApiException('Username and password required', 400);
    }
    
    $userId = verifyUser($data['username'], $data['password']);
    
    if ($userId) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'userId' => $userId,
                'message' => 'Login successful'
            ]
        ]);
    } else {
        throw new ApiException('Invalid credentials', 401);
    }
}

/**
 * Handler: Register
 */
function handleRegister(): void {
    $data = getJsonInput();
    
    if (empty($data['username']) || empty($data['password'])) {
        throw new ApiException('Username and password required', 400);
    }
    
    if (strlen($data['username']) < 3) {
        throw new ApiException('Username must be at least 3 characters', 400);
    }
    
    if (strlen($data['password']) < 6) {
        throw new ApiException('Password must be at least 6 characters', 400);
    }
    
    try {
        $userId = createUser($data['username'], $data['password']);
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'userId' => $userId,
                'message' => 'Registration successful'
            ]
        ]);
    } catch (Exception $e) {
        throw new ApiException('Username already taken', 400);
    }
}

/**
 * Handler: Logout
 */
function handleLogout(): void {
    session_unset();
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'data' => ['message' => 'Logout successful']
    ]);
}

/**
 * Handler: Streak (GET/POST)
 */
function handleStreak(string $method): void {
    if ($method === 'GET') {
        requireAuth();
        $streak = getStreak(getUserId());
        
        echo json_encode([
            'success' => true,
            'data' => ['streak' => $streak]
        ]);
    } elseif ($method === 'POST') {
        requireAuth();
        $data = getJsonInput();
        
        if (!isset($data['streak']) || !is_int($data['streak'])) {
            throw new ApiException('Invalid streak value', 400);
        }
        
        if ($data['streak'] < 0) {
            throw new ApiException('Streak must be non-negative', 400);
        }
        
        updateStreak(getUserId(), $data['streak']);
        
        echo json_encode([
            'success' => true,
            'data' => ['message' => 'Streak updated']
        ]);
    } else {
        throw new ApiException('Method not allowed', 405);
    }
}
?>
