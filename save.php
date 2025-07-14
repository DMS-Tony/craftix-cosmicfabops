<?php
// save.php
if ($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['csv'])) {
  // adjust path if needed
  file_put_contents(__DIR__.'/data.csv', $_POST['csv']);
  echo 'OK';
} else {
  header('HTTP/1.1 400 Bad Request');
  echo 'Missing CSV';
}