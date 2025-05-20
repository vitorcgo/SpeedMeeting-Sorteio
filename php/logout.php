<?php
session_start();
session_unset(); // limpa variáveis da sessão
session_destroy(); // destrói a sessão

// Redireciona para a página inicial
header("Location: ../index.html");
exit;
