<?php
/* Abstimmung im Bereich „Ideen“ (eine Kachel, eine Stimme je Browser, Julian 10.11.2026).
   Gespeichert wird nur die Zahl je Idee – keine IP-Adresse, kein Name, kein Zeitpunkt. Die Datei liegt nicht im öffentlichen Teil.
   GET  → aktuelle Zahlen (für die Balken nach dem eigenen Tipp).
   POST idee=…&richtung=plus|minus[&weg=…] → zählt; „weg“ nimmt beim Wechsel die vorige Stimme zurück. Antwort: die neuen Zahlen. */
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function ablehnen($code) { http_response_code($code); exit('{"ok":false}'); }

$erlaubt = ['geraete', 'helfer', 'waage', 'glas'];
$methode = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '';
if ($methode !== 'GET' && $methode !== 'POST') ablehnen(405);

/* Am liebsten neben dem Webordner. Geht das auf dem Server nicht, in einem gesperrten Unterordner. */
$ordner = dirname(__DIR__) . '/imkerbuch-daten';
if (!is_dir($ordner)) {
  $aussen = $ordner;
  $ordner = __DIR__ . '/.imkerbuch-daten';
  if (!is_dir($ordner) && $methode === 'POST') {
    if (@mkdir($aussen, 0700)) $ordner = $aussen;
    else {
      if (!@mkdir($ordner, 0700)) ablehnen(500);
      if (!is_file($ordner . '/.htaccess') && @file_put_contents($ordner . '/.htaccess', "Require all denied\n") === false) ablehnen(500);
    }
  }
}
$datei = $ordner . '/stimmen.json';

function ausgabe($stand, $erlaubt) {
  $z = [];
  foreach ($erlaubt as $k) $z[$k] = isset($stand[$k]) ? max(0, (int) $stand[$k]) : 0;
  echo json_encode(['ok' => true, 'stimmen' => $z]);
}

if ($methode === 'GET') {
  $stand = [];
  if (is_file($datei) && ($g = @fopen($datei, 'r'))) {
    if (flock($g, LOCK_SH)) { $stand = json_decode(stream_get_contents($g), true); flock($g, LOCK_UN); }
    fclose($g);
  }
  ausgabe(is_array($stand) ? $stand : [], $erlaubt);
  exit;
}

$idee = isset($_POST['idee']) && is_string($_POST['idee']) ? $_POST['idee'] : '';
$richtung = isset($_POST['richtung']) && is_string($_POST['richtung']) ? $_POST['richtung'] : '';
$weg = isset($_POST['weg']) && is_string($_POST['weg']) ? $_POST['weg'] : '';
$quelle = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
if (!in_array($quelle, ['https://imkerbuch.app', 'https://www.imkerbuch.app'], true)
    || !in_array($idee, $erlaubt, true) || !in_array($richtung, ['plus', 'minus'], true)
    || ($weg !== '' && (!in_array($weg, $erlaubt, true) || $weg === $idee || $richtung !== 'plus'))) ablehnen(400);

$griff = @fopen($datei, 'c+');
if (!$griff || !flock($griff, LOCK_EX)) ablehnen(500);
$stand = json_decode(stream_get_contents($griff), true);
if (!is_array($stand)) $stand = [];
$zahl = isset($stand[$idee]) ? (int) $stand[$idee] : 0;
$stand[$idee] = $richtung === 'plus' ? $zahl + 1 : max(0, $zahl - 1);
if ($weg !== '') $stand[$weg] = max(0, (isset($stand[$weg]) ? (int) $stand[$weg] : 0) - 1);
$text = json_encode($stand);
$ok = rewind($griff) && ftruncate($griff, 0) && fwrite($griff, $text) === strlen($text);
fflush($griff);
flock($griff, LOCK_UN);
fclose($griff);
if (!$ok) ablehnen(500);
ausgabe($stand, $erlaubt);
