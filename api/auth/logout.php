<?php
header('Content-Type: application/json');
require_once __DIR__.'/../config.php';

session_unset();
session_destroy();
echo json_encode(['success'=>true, 'data'=>['message'=>'Logout successful']]);
