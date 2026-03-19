<?php
$host = "localhost";
$user = "root";   // default XAMPP MySQL user
$pass = "";       // default password is empty
$db   = "neu_library";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) { 
    die("Connection failed: " . $conn->connect_error); 
}

// Build WHERE conditions based on filters
$where = [];

if (!empty($_GET['start']) && !empty($_GET['end'])) {
    $start = $conn->real_escape_string($_GET['start']);
    $end   = $conn->real_escape_string($_GET['end']);
    $where[] = "created_at BETWEEN '$start' AND '$end'";
}

if (!empty($_GET['purpose'])) {
    $purpose = $conn->real_escape_string($_GET['purpose']);
    $where[] = "purpose = '$purpose'";
}

if (!empty($_GET['college'])) {
    $college = $conn->real_escape_string($_GET['college']);
    $where[] = "college = '$college'";
}

if (!empty($_GET['userType'])) {
    $userType = $conn->real_escape_string($_GET['userType']);
    $where[] = "user_type = '$userType'";
}

// Final SQL query
$sql = "SELECT id, name, email, purpose, college, user_type, created_at FROM checkins";
if (!empty($where)) {
    $sql .= " WHERE " . implode(" AND ", $where);
}
$sql .= " ORDER BY created_at DESC";

$result = $conn->query($sql);

// Build JSON response
$entries = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $entries[] = $row;
    }
}

// Output JSON
header('Content-Type: application/json');
echo json_encode($entries, JSON_PRETTY_PRINT);

$conn->close();
?>
