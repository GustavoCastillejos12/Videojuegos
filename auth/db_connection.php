<?php
// Evitar que se muestren errores directamente
error_reporting(0);
ini_set('display_errors', 0);

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'playazteca';
$username = 'root';
$password = '';

try {
    // Crear conexión
    $conn = new mysqli($host, $username, $password, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    // Establecer charset
    $conn->set_charset("utf8");
} catch (Exception $e) {
    // Enviar respuesta JSON en caso de error
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos'
    ]);
    exit;
}
?> 