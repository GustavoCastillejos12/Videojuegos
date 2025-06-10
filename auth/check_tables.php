<?php
require_once '../config/database.php';

try {
    // Verificar si la tabla usuarios existe
    $check_usuarios = $conn->query("SHOW TABLES LIKE 'usuarios'");
    if ($check_usuarios->num_rows === 0) {
        // Crear la tabla usuarios si no existe
        $create_usuarios = "CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($create_usuarios)) {
            throw new Exception('Error al crear la tabla usuarios: ' . $conn->error);
        }
    }

    // Verificar si la tabla productos existe
    $check_productos = $conn->query("SHOW TABLES LIKE 'productos'");
    if ($check_productos->num_rows === 0) {
        // Crear la tabla productos si no existe
        $create_productos = "CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT NOT NULL,
            precio DECIMAL(10,2) NOT NULL,
            plataforma VARCHAR(50) NOT NULL,
            imagen VARCHAR(255) NOT NULL,
            clave VARCHAR(255) NOT NULL,
            estado ENUM('disponible', 'vendido') DEFAULT 'disponible',
            fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )";
        
        if (!$conn->query($create_productos)) {
            throw new Exception('Error al crear la tabla productos: ' . $conn->error);
        }
    } else {
        // Verificar si la columna plataforma existe
        $check_column = $conn->query("SHOW COLUMNS FROM productos LIKE 'plataforma'");
        if ($check_column->num_rows === 0) {
            // Agregar la columna plataforma si no existe
            $alter_table = "ALTER TABLE productos ADD COLUMN plataforma VARCHAR(50) NOT NULL AFTER precio";
            if (!$conn->query($alter_table)) {
                throw new Exception('Error al agregar la columna plataforma: ' . $conn->error);
            }
        }

        // Verificar si la columna clave existe
        $check_clave = $conn->query("SHOW COLUMNS FROM productos LIKE 'clave'");
        if ($check_clave->num_rows === 0) {
            // Agregar la columna clave si no existe
            $alter_table = "ALTER TABLE productos ADD COLUMN clave VARCHAR(255) NOT NULL AFTER imagen";
            if (!$conn->query($alter_table)) {
                throw new Exception('Error al agregar la columna clave: ' . $conn->error);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Tablas verificadas y creadas correctamente'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
} 