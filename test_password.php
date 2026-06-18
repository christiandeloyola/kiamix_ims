<?php

$hash = '$2y$10$bKw/KZtdC.UMlpuklxCudekMU.z4plEnJIQGZIMmANpuSbJXrLYHi';

var_dump(
    password_verify(
        'admin123',
        $hash
    )
);