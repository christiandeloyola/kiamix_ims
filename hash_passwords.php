<?php

echo "<h3>Administrator</h3>";
echo password_hash('admin123', PASSWORD_DEFAULT);

echo "<hr>";

echo "<h3>Store Manager</h3>";
echo password_hash('manager123', PASSWORD_DEFAULT);

echo "<hr>";

echo "<h3>Staff</h3>";
echo password_hash('staff123', PASSWORD_DEFAULT);