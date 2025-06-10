<?php
// Evitar que se muestren errores directamente
error_reporting(0);
ini_set('display_errors', 0);

session_start();
header('Content-Type: application/json');

// Incluir la conexión a la base de datos
require_once 'db_connection.php';

// Función para enviar respuesta JSON
function sendJsonResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($data !== null) {
        $response['usuario'] = $data;
    }
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendJsonResponse(false, 'Por favor complete todos los campos');
    }

    try {
        $stmt = $conn->prepare("SELECT id, nombre, email, password FROM usuarios WHERE email = ?");
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta");
        }

        $stmt->bind_param("s", $email);
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta");
        }

        $result = $stmt->get_result();
        if ($result->num_rows === 1) {
            $usuario = $result->fetch_assoc();
            
            if (password_verify($password, $usuario['password'])) {
                // Configurar la sesión
                $_SESSION['usuario'] = [
                    'id' => $usuario['id'],
                    'nombre' => $usuario['nombre'],
                    'email' => $usuario['email']
                ];

                sendJsonResponse(true, 'Inicio de sesión exitoso', $_SESSION['usuario']);
            } else {
                sendJsonResponse(false, 'Contraseña incorrecta');
            }
        } else {
            sendJsonResponse(false, 'Usuario no encontrado');
        }
    } catch (Exception $e) {
        sendJsonResponse(false, 'Error al iniciar sesión: ' . $e->getMessage());
    }
} else {
    sendJsonResponse(false, 'Método no permitido');
}
?> 