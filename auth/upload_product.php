<?php
// Iniciar el buffer de salida
ob_start();

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Establecer el tipo de contenido como JSON
header('Content-Type: application/json; charset=utf-8');

// Función para enviar respuesta JSON
function sendJsonResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

try {
    session_start();
    require_once '../config/database.php';

    // Verificar la conexión
    if ($conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Verificar si el usuario está logueado
    if (!isset($_SESSION['usuario_id'])) {
        throw new Exception('Debes iniciar sesión para subir productos');
    }

    // Verificar que sea una petición POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Verificar que se haya subido un archivo
    if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir la imagen: ' . ($_FILES['imagen']['error'] ?? 'No se subió ningún archivo'));
    }

    // Obtener los datos del formulario
    $nombre = $_POST['nombre'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $precio = $_POST['precio'] ?? '';
    $plataforma = $_POST['plataforma'] ?? '';
    $clave = $_POST['clave'] ?? '';

    // Validar los datos
    if (empty($nombre) || empty($descripcion) || empty($precio) || empty($plataforma) || empty($clave)) {
        throw new Exception('Todos los campos son obligatorios');
    }

    // Validar el precio
    if (!is_numeric($precio) || $precio <= 0) {
        throw new Exception('El precio debe ser un número válido mayor que 0');
    }

    // Crear directorio de uploads si no existe
    $upload_dir = '../uploads/productos/';
    if (!file_exists($upload_dir)) {
        if (!mkdir($upload_dir, 0777, true)) {
            throw new Exception('Error al crear el directorio de uploads');
        }
    }

    // Generar nombre único para la imagen
    $file_extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
    $file_name = uniqid() . '.' . $file_extension;
    $target_path = $upload_dir . $file_name;

    // Mover la imagen al directorio de uploads
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $target_path)) {
        throw new Exception('Error al guardar la imagen');
    }

    // Verificar si la tabla productos existe
    $check_table = $conn->query("SHOW TABLES LIKE 'productos'");
    if ($check_table->num_rows === 0) {
        throw new Exception('La tabla productos no existe. Por favor, ejecuta check_tables.php primero.');
    }

    // Preparar la consulta SQL
    $stmt = $conn->prepare("
        INSERT INTO productos (nombre, descripcion, precio, plataforma, imagen, id_vendedor, clave, fecha_publicacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    // Ejecutar la consulta
    $result = $stmt->execute([
        $nombre,
        $descripcion,
        $precio,
        $plataforma,
        $file_name,
        $_SESSION['usuario_id'],
        $clave
    ]);

    if ($result) {
        // Limpiar el buffer de salida
        ob_clean();
        
        // Enviar respuesta exitosa
        sendJsonResponse(true, 'Producto subido exitosamente');
    } else {
        throw new Exception('Error al guardar el producto en la base de datos');
    }

} catch (Exception $e) {
    // Si hay error, eliminar la imagen si se subió
    if (isset($target_path) && file_exists($target_path)) {
        unlink($target_path);
    }

    // Limpiar el buffer de salida
    ob_clean();
    
    // Enviar respuesta de error
    sendJsonResponse(false, $e->getMessage());
} finally {
    // Cerrar la conexión si existe
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
} 