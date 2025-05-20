
<?php
session_start();
if (!isset($_SESSION['usuario_logado'])) {
    header('Location: ../index.html');
    exit;
}

header('Location: ../admin.html');
exit;
