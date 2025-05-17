<?php
// /data/chats/x7rpud/workspace/uploads/project/src/php/utils/Response.php

class Response {
    /**
     * Send a success response
     *
     * @param string $message Success message
     * @param array $data Optional data to include in response
     * @return void
     */
    public static function success($message, $data = []) {
        self::send([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * Send an error response
     *
     * @param string $message Error message
     * @param array $data Optional data to include in response
     * @param int $code HTTP status code (default 400)
     * @return void
     */
    public static function error($message, $data = [], $code = 400) {
        http_response_code($code);
        self::send([
            'success' => false,
            'error' => $message,
            'data' => $data
        ]);
    }

    /**
     * Send the actual JSON response
     *
     * @param array $response Response data
     * @return void
     */
    private static function send($response) {
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }
}