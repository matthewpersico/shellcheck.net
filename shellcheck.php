<?php
/* This file takes a posted script, runs it through shellcheck.sh
 * and returns JSON comments.
 */

function err($str) {
    return '[{ "line": 1, "column": 1, "endLine": 1, "endColumn": 1, "code": 0, "level": "error", "message": "' . $str . '"}]';
}

header('Content-type: application/json; charset=UTF-8');

$script = $_POST["script"];
if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
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
  $var = stream_get_contents($pipes[1]);
  fclose($pipes[1]);
  $ret = proc_close($process);
  if ($ret < 128 && $var != "") {
    echo $var;
  } else {
    echo err("Sandbox resource constraints exceeded. Try a smaller script, or run ShellCheck locally.");
  }
} else { 
  echo err("Oops, internal server error unrelated to your script! Sorry!");
}
