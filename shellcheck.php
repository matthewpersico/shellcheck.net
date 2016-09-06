<?php
/* This file takes a posted script, runs it through shellcheck.sh
 * and returns JSON comments.
 */

header('Content-type: application/json; charset=UTF-8');

$script = $_POST["script"];
if (get_magic_quotes_gpc()) {
    $script = stripslashes($script);
}

$fds = array( 
    0 => array("pipe", "r"), 
    1 => array("pipe", "w"),
);

$process = proc_open("exec ./shellcheck.sh", $fds, $pipes);
if(is_resource($process)) {
  fwrite($pipes[0], $script);
  fclose($pipes[0]);
  echo stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  proc_close($process);
} else { 
  echo "[{ 'line': 1, 'column': 1, 'level': 'error', 'message': 'Oops, internal server error unrelated to your script! Sorry!'}]";
}
