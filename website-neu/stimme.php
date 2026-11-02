<?php
/* Zählt eine Stimme für eine Idee im Bereich „Ideen“. Gespeichert wird nur die Zahl je Idee,
   keine IP-Adresse, kein Name, kein Zeitpunkt. Die Datei liegt nicht im öffentlichen Teil. */
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function ablehnen($code) { http_response_code($code); exit('{"ok":false}'); }

$erlaubt = ['geraete', 'helfer', 'waage', 'glas'];
$idee = isset($_POST['idee']) && is_string($_POST['idee']) ? $_POST['idee'] : '';
$richtung = isset($_POST['richtung']) && is_string($_POST['richtung']) ? $_POST['richtung'] : '';
$quelle = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !in_array($quelle, ['https://imkerbuch.app', 'https://www.imkerbuch.app'], true)
    || !in_array($idee, $erlaubt, true) || !in_array($richtung, ['plus', 'minus'], true)) ablehnen(400);

/* Am liebsten neben dem Webordner. Geht das auf dem Server nicht, in einem gesperrten Unterordner. */
$ordner = dirname(__DIR__) . '/imkerbuch-daten';
if (!is_dir($ordner) && !@mkdir($ordner, 0700)) {
  $ordner = __DIR__ . '/.imkerbuch-daten';
  if (!is_dir($ordner) && !@mkdir($ordner, 0700)) ablehnen(500);
  if (!is_file($ordner . '/.htaccess') && @file_put_contents($ordner . '/.htaccess', "Require all denied\n") === false) ablehnen(500);
}
$griff = @fopen($ordner . '/stimmen.json', 'c+');
if (!$griff || !flock($griff, LOCK_EX)) ablehnen(500);

$stand = json_decode(stream_get_contents($griff), true);
if (!is_array($stand)) $stand = [];
$zahl = isset($stand[$idee]) ? (int) $stand[$idee] : 0;
$stand[$idee] = $richtung === 'plus' ? $zahl + 1 : max(0, $zahl - 1);
$text = json_encode($stand);
$ok = rewind($griff) && ftruncate($griff, 0) && fwrite($griff, $text) === strlen($text);
fflush($griff);
flock($griff, LOCK_UN);
fclose($griff);
if (!$ok) ablehnen(500);
echo '{"ok":true}';
