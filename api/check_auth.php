<?php
header('Content-Type: application/json');
require_once __DIR__.'/functions.php';

echo json_encode(['success' => true, 'data' => ['loggedIn' => isset($_SESSION['user_id']) && $_SESSION['user_id']]]);