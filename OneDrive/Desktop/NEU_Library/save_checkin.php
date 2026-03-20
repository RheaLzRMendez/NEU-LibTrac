<?php
$host = "localhost";
$user = "root";   // default XAMPP MySQL user
$pass = "";       // default password is empty
$db   = "neu_library";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) { 
    die("Connection failed: " . $conn->connect_error); 
}

// Capture POST values
$purpose  = isset($_POST['purpose']) ? $_POST['purpose'] : '';
$college  = isset($_POST['college']) ? $_POST['college'] : '';
$userType = isset($_POST['userType']) ? $_POST['userType'] : 'Student'; // default to Student if not provided

$email =isset(@_POST['email']) ? $_POST['email'] : '';
// Prepare and execute insert
$stmt = $conn->prepare("INSERT INTO checkins (email, purpose, college, user_type, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $email, $purpose, $college, $userType);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
