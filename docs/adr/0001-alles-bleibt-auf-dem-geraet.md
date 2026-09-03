# ADR-0001: Alle Daten bleiben auf dem Gerät

- **Status:** Angenommen
- **Datum:** 2026-09-03 (nachträglich dokumentiert, Entscheidung von Projektbeginn)
- **Betrifft:** Datenhaltung, Sicherung, Vermarktung

## Kontext

Imkereien führen Aufzeichnungen, die sie führen **müssen**: Bestandsbuch nach
Tierarzneimittelgesetz, Bio-Unterlagen, Kassenbuch. Die verbreiteten Apps im Umfeld
verlangen dafür ein Konto, eine Cloud und meistens ein Abo. In den Nutzerbewertungen
der Konkurrenz sind genau das die meistgenannten Schmerzpunkte: Abo, Zwangs-Cloud,
kein Offline-Betrieb, kein Herauskommen aus dem System.

Dazu kommt die Lage vor Ort: Am Bienenstand gibt es oft kein Netz.

## Entscheidung

Die App speichert **ausschließlich lokal** in IndexedDB. Es gibt keinen Server, kein
Konto, keine Anmeldung und keine Synchronisierung. Der Austausch zwischen Geräten
läuft über eine Sicherungsdatei, die der Nutzer selbst verschickt oder ablegt.

## Begründung

Ohne Server gibt es keine Datenweitergabe, über die man aufklären müsste, keine
Auftragsverarbeitung, keine laufenden Kosten und nichts, was ausfallen kann. Das
macht das Versprechen „100 % lokal" prüfbar statt behauptet — und es ist zugleich
das Verkaufsargument gegenüber den Cloud-Apps.

## Verworfene Alternativen

- **Cloud mit Konto** — löst die Geräte-Synchronisierung, kostet aber Betrieb,
  Datenschutzaufwand und genau das Vertrauen, das uns von der Konkurrenz abhebt.
- **Optionale Cloud als Zusatz** — hätte beide Welten bedeutet: den Aufwand des
  Servers und trotzdem den vollen lokalen Pfad. Für einen Ein-Personen-Betrieb zu viel.

## Folgen

**Gut:** Vollständig offline nutzbar. Keine Betriebskosten. Datenschutz ist eine
Eigenschaft der Architektur, kein Versprechen.

**Schlecht / Preis:** Kein automatischer Abgleich zwischen Geräten. Der Verlust des
Geräts ist der Verlust der Daten — deshalb ist die **Sicherung ein Hauptmerkmal**
und kein Randthema: Erinnerungs-Banner, automatische Sicherung, rollierende Snapshots
und ein Import, der zusammenführen statt überschreiben kann.

**Zu beachten bei künftigen Änderungen:** Jede neue Funktion muss ohne Netz
funktionieren. Externe Dienste (Wetter, Landbedeckung, Adresssuche) sind immer
Zusatz, nie Voraussetzung, und stehen in `BYPASS_HOSTS` des Service Workers.
Ein neuer Datenspeicher gehört in `DB.STORES`, sonst fehlt er in jeder Sicherung.

## Wie wir merken, dass es trägt

Die Sicherungs-Tests prüfen den vollständigen Weg Export → Import → Zusammenführen
inklusive Anhängen. Wenn ein Datenspeicher dort fehlt, fällt es dort auf.
