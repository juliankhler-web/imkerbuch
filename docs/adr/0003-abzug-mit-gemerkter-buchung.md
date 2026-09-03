# ADR-0003: Bestandsabzug merkt sich, was er genommen hat

- **Status:** Angenommen
- **Datum:** 2026-09-03 (nachträglich dokumentiert, umgesetzt in v1.44 bis v1.45)
- **Betrifft:** Verbrauchsmaterial, Fütterung, Behandlung, Abfüllung

## Kontext

Aus dem echten Betrieb gemeldet: „Wird eine Fütterung gelöscht, bleibt der Zucker
verbraucht." Und: „Habe ich Zucker von 2025 und 2026 und füttere 50 kg, greift er
nicht auf den nächsten Zuckereingang über, obwohl in Summe genug da ist."

Beides hatte dieselbe Wurzel. Der Abzug rechnete nur vorwärts und nur auf genau
einer Position: Er zog ab und vergaß, was er getan hatte. Löschen konnte deshalb
nichts zurückgeben, Bearbeiten zog jedes Mal erneut ab, und ein leergelaufener
Vorjahresposten meldete Fehlbestand, obwohl der neue Sack danebenstand.

## Entscheidung

Zwei Dinge zusammen:

1. **`verbrauchAbziehenKette(inventarId, menge)`** bedient sich reihum an
   Positionen **derselben Art** (gleicher Typ, gleiche Einheit, gleiche Kategorie),
   älteste zuerst, bis die Menge zusammen ist.
2. Das Ergebnis wird als **`verbrauchAbzug`** am auslösenden Datensatz gespeichert
   — bei der Fütterung, der Behandlung, der Abfüllung. Löschen gibt genau das
   zurück (`verbrauchZurueckbuchen`), Bearbeiten gibt erst zurück und bucht dann neu.

## Begründung

Der Bestand ist keine abgeleitete Größe, sondern eine gebuchte. Wer eine Buchung
rückgängig machen will, muss wissen, was sie war — eine Rückrechnung aus dem
aktuellen Stand wäre bei mehreren beteiligten Positionen nicht eindeutig.

## Verworfene Alternativen

- **Bestand aus allen Bewegungen ableiten** — sauber, aber ein Umbau des gesamten
  Materialteils inklusive Datenwanderung; der Nutzen entspricht dem der gemerkten Buchung.
- **Nur die eine Position abziehen und den Rest melden** — der gemeldete Zustand
  („25 kg fehlen") war nachweislich falsch, das Lager hatte genug.

## Folgen

**Gut:** Löschen, Ändern und Stornieren stimmen wieder. Ein Jahreswechsel im Lager
läuft ohne Handarbeit durch.

**Schlecht / Preis:** Jeder neue Ort, der Bestand abzieht, muss `verbrauchAbzug`
mitschreiben — sonst entsteht genau der alte Fehler an neuer Stelle.
Sammelbuchungen über mehrere Völker brauchen `abzugAnteil`, um den gemeinsamen
Abzug proportional auf die einzelnen Datensätze zu verteilen.

**Bewusste Ausnahme:** Der **Materialabgang** zieht weiter aus genau der gewählten
Position ab. Dort ist die Position Teil des Belegs, `bestandVorher`/`bestandNachher`
hängen daran — eine Kette würde den Nachweis verfälschen.

## Wie wir merken, dass es trägt

Tests decken beide Richtungen ab: Kette über mehrere Positionen (ältestes zuerst,
ehrlich gemeldeter Fehlbestand), Rückgabe genau des Abgezogenen, anteilige
Verteilung bei Sammelbuchungen, und je ein Fall für Fütterung, Behandlung und
Abfüllung — löschen und korrigieren.
