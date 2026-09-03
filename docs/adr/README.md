# Architecture Decision Records (ADR)

Hier steht, **warum** die App so gebaut ist, wie sie gebaut ist. Der Code zeigt das
Was, die Historie in [PROJEKT.md](../../PROJEKT.md) das Wann — die Begründung geht
sonst verloren, sobald der Kopf sie vergisst.

## Wann ein ADR

Schreib einen, wenn eine Entscheidung

- schwer zurückzunehmen ist (Datenmodell, Speicherort, Abhängigkeit),
- von außen wie ein Fehler aussieht, aber Absicht ist,
- eine naheliegende Alternative bewusst ausschlägt,
- oder rechtliche bzw. fachliche Gründe hat, die man dem Code nicht ansieht.

Für alles andere reicht ein Kommentar im Code oder ein Eintrag im CHANGELOG.

## Wie

1. `0000-vorlage.md` kopieren, fortlaufend nummerieren: `0004-kurzer-titel.md`.
2. Titel als Aussage, nicht als Frage: „Alle Daten bleiben auf dem Gerät",
   nicht „Wo speichern wir die Daten?".
3. Status pflegen. Wird eine Entscheidung später ersetzt, bleibt der alte ADR
   stehen und bekommt „Ersetzt durch ADR-XXXX" — **nichts wird gelöscht**,
   der Irrweg ist Teil der Begründung.
4. Aus dem Code auf den ADR verweisen, wo es hilft: `// siehe docs/adr/0004-…`.

## Bestand

| Nr. | Titel | Status |
| --- | --- | --- |
| [0001](0001-alles-bleibt-auf-dem-geraet.md) | Alle Daten bleiben auf dem Gerät | Angenommen |
| [0002](0002-eine-einzige-index-html.md) | Die App ist eine einzige Datei | Angenommen |
| [0003](0003-abzug-mit-gemerkter-buchung.md) | Bestandsabzug merkt sich, was er genommen hat | Angenommen |
