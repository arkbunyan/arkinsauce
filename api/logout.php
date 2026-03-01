<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\Auth;
use App\Http;

Auth::logout();
Http::ok(['success' => true]);
