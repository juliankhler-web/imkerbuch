<?php
/* Zählt eine Stimme für eine Idee aus dem Bereich „Was als Nächstes kommt“. Gespeichert wird nur die Zahl je Idee,
   keine IP-Adresse, kein Name, kein Zeitpunkt. Die Datei liegt außerhalb des öffentlichen Ordners. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$erlaubt = ['geraete', 'helfer', 'waage', 'glas'];
$idee = isset($_POST['idee']) ? (string) $_POST['idee'] : '';
$richtung = isset($_POST['richtung']) ? (string) $_POST['richtung'] : '';
$quelle = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $quelle !== 'https://imkerbuch.app'
    || !in_array($idee, $erlaubt, true) || !in_array($richtung, ['plus', 'minus'], true)) {
  http_response_code(400);
  exit('{"ok":false}');
}

$ordner = dirname(__DIR__) . '/imkerbuch-daten';
if (!is_dir($ordner) && !@mkdir($ordner, 0700)) { http_response_code(500); exit('{"ok":false}'); }
$griff = @fopen($ordner . '/stimmen.json', 'c+');
if (!$griff || !flock($griff, LOCK_EX)) { http_response_code(500); exit('{"ok":false}'); }

$stand = json_decode(stream_get_contents($griff), true);
if (!is_array($stand)) $stand = [];
$zahl = isset($stand[$idee]) ? (int) $stand[$idee] : 0;
$stand[$idee] = $richtung === 'plus' ? $zahl + 1 : max(0, $zahl - 1);
ftruncate($griff, 0);
rewind($griff);
fwrite($griff, json_encode($stand));
fflush($griff);
flock($griff, LOCK_UN);
fclose($griff);
echo '{"ok":true}';
