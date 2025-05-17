<?php
// src/config/conexao.php

class Conexao {
    private static $instance = null;
    private $pdo;
    private $connected = false;

    private function __construct() {
        try {
            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=%s",
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];
            
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Verify connection by executing a simple query
            $this->pdo->query('SELECT 1');
            $this->connected = true;
        } catch (PDOException $e) {
            $this->connected = false;
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->pdo;
    }

    public static function isConnected() {
        try {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance->connected;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function testConnection() {
        try {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            
            if (!self::$instance->connected) {
                return [
                    'success' => false,
                    'message' => 'Database connection is not established'
                ];
            }

            // Test query execution
            self::$instance->pdo->query('SELECT 1');
            
            return [
                'success' => true,
                'message' => 'Database connection successful',
                'details' => [
                    'host' => DB_HOST,
                    'database' => DB_NAME,
                    'charset' => DB_CHARSET
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'details' => [
                    'host' => DB_HOST,
                    'database' => DB_NAME,
                    'charset' => DB_CHARSET
                ]
            ];
        }
    }

    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserializing of the instance
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}