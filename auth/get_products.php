<?php
// Desactivar la salida de errores
error_reporting(0);
ini_set('display_errors', 0);

// Establecer el tipo de contenido como JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db_connection.php';

try {
    // Verificar la conexión
    if (!isset($conn) || !($conn instanceof mysqli)) {
        throw new Exception('Error de conexión a la base de datos');
    }

    // Consulta para obtener los productos con información del vendedor
    $query = "SELECT p.*, u.nombre as vendedor_nombre 
              FROM productos p 
              JOIN usuarios u ON p.usuario_id = u.id 
              ORDER BY p.fecha_publicacion DESC";
    
    $result = $conn->query($query);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $productos = array();
    while ($row = $result->fetch_assoc()) {
        // Asegurarse de que la ruta de la imagen sea correcta
        if (!empty($row['imagen'])) {
            $row['imagen'] = '/Venta%20videoj/uploads/productos/' . basename($row['imagen']);
        }
        $productos[] = $row;
    }

    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);

} catch (Exception $e) {
    error_log('Error en get_products.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los productos: ' . $e->getMessage()
    ]);
} finally {
    // Cerrar la conexión si existe
    if (isset($conn)) {
        $conn->close();
    }
} 