<?php

function logAction($pdo, $userId, $action, $module, $description)
{
    $sql = "
        INSERT INTO audit_logs
        (
            user_id,
            action,
            module,
            description
        )
        VALUES
        (
            :user_id,
            :action,
            :module,
            :description
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':user_id' => $userId,
        ':action' => $action,
        ':module' => $module,
        ':description' => $description
    ]);
}