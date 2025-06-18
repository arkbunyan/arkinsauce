require 'config.php';

echo json_encode([
  'loggedIn' => !empty($_SESSION['user_id'])
]);