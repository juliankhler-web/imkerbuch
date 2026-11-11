# Erklärvideo Folge 2: „Hans und das Bestandsbuch“ – Drehbuch (Entwurf 11.11.2026)

**Idee (Julian 11.11.2026: „klingt gut, fangen wir an“):** Hans, der erfahrene Imker mit 40 Jahren Papier, bekommt Post vom Veterinäramt. Anna zeigt ihm, wie sie Behandlungen in der App einträgt und das Bestandsbuch als PDF macht.
**Stil:** wie Folge 1 – flache, farbige Illustration, mehrere Ansichten je Szene, echte App-Aufnahmen (Beispieldaten), leise Musik (Pixabay, gleiche oder ähnliche Lizenz), Schlussbild.
**Länge:** ca. 60–70 s. **Formate:** YouTube 16:9, dazu 2 Kurzclips hochkant.
**Figuren:** Anna (Vorlage `docs/marketing/bilder/v2/anna-vorlage.png`) und Hans (Siebziger, rundes freundliches Gesicht, kurze graue, oben lichtere Haare, schmale Brille, breites Lächeln; nur nach Beschreibung, nicht nach einem Foto).
**Stimmen:** ElevenLabs (bezahltes Abo). Hans = Felix (Folge 1), Anna = ruhige Frauenstimme (Julian wählt). Kein Erzähler, die Figuren sprechen.

| # | Bild | Text |
|---|------|------|
| 1 | Hans am Küchentisch, Brille auf der Nasenspitze, liest einen Brief mit Amtssiegel (ohne lesbare Schrift). Nahaufnahme: Brief und Hans' Stirnrunzeln. | **Hans:** „Kontrolle nächste Woche … Wo ist bloß mein Bestandsbuch?“ |
| 2 | Hans wühlt in Ordnern, Kassenzetteln und einem verknickten Heft; eine Wanduhr tickt. Nahaufnahme: verknicktes Heft mit Kaffeefleck. | **Hans:** „Irgendwo hab ich doch aufgeschrieben, was ich im August gegen die Varroa gemacht hab …“ |
| 3 | Anna kommt zur Tür herein, lächelt, Handy in der Hand. | **Anna:** „Zeig mal her, Hans. Ich mach das inzwischen anders.“ |
| 4 | **App-Aufnahme:** Behandlung für den ganzen Stand – Mittel, Menge, alle Völker angehakt, Speichern („Behandlung für 6 Völker dokumentiert“). | **Anna:** „Nach jeder Behandlung trag ich's gleich am Stand ein. Mittel, Menge, alle Völker auf einmal.“ |
| 5 | **App-Aufnahme:** Unterlagen → Bestandsbuch → PDF (Tabelle mit Datum, Volk, Mittel, Menge, Wartezeit). | **Anna:** „Und fürs Amt tipp ich einmal – fertig ist das Bestandsbuch als PDF.“ |
| 6 | **App-Aufnahme:** in einer Behandlung „Belege (Foto / PDF)“ – Foto des Kassenbons wird angehängt. Hans schaut über Annas Schulter. | **Hans:** „Und die Kaufbelege?“ **Anna:** „Fotografier ich und häng sie direkt an die Behandlung.“ |
| 7 | Hans entspannt am Küchentisch, Ausdruck in der Hand, eine Kontrolleurin (allgemein, kein Amtsabzeichen) nickt freundlich. | **Hans:** „Na, das ging ja schnell.“ |
| 8 | Hans tippt selbst auf seinem Handy, Anna lacht daneben. | **Hans:** „Gut … aber meine Stockkarte behalt ich trotzdem.“ **Anna:** (lachend) „Hab ich mir schon gedacht.“ |
| 9 | Schlussbild wie Folge 1 (Logo, Store-Zeile, „30 Tage alles kostenlos testen“). | **Anna:** „ImkerBuch – dein digitales Stockbuch. Probier's dreißig Tage kostenlos aus.“ |

## Aussagen – gegen die App geprüft (Stand Version 1.00, 11.11.2026)
- Behandlung für den ganzen Stand mit allen Völkern auf einmal: ja (Behandlung erfassen → „Welche Völker?“ / „Alle auswählen“, Meldung „Behandlung für 6 Völker dokumentiert“).
- Bestandsbuch als PDF: ja (Unterlagen → Ämter & Pflicht → Bestandsbuch Arzneimittel → PDF; auch Excel/CSV).
- Kaufbelege anhängen: ja – an jeder Behandlung „Belege (Foto / PDF)“, dazu Häkchen „Kaufbeleg vorhanden“ (index.html, Behandlung-Dialog).
- **Nicht** behaupten: „fünf Jahre gespeichert“ oder „damit ist jede Pflicht erfüllt“. Die App selbst sagt: Aufzeichnungen und Kaufbelege 5 Jahre aufbewahren, Bestandsbuch regelmäßig ausdrucken, Einträge liegen nur auf dem Gerät. Das PDF ist eine Vorlage aus den eigenen Eingaben, kein amtliches Formular.
- Szene 7 bewusst allgemein: keine Aussage, dass eine Kontrolle „bestanden“ ist.

## Bilder (Draw Things, FLUX.2 klein, Vorlage-Methode wie Folge 1)
- **Hans-Vorlagen gewählt (Julian 11.11.2026: „c und b“):** Alltag/Küche = `docs/marketing/bilder/folge2/hans-vorlage.png` (Entwurf B, Polohemd, Seed 302); am Bienenstand = `folge2/hans-imker-vorlage.png` (Entwurf C, Imkerjacke mit hochgeschobenem Schleier, Seed 301). Prompts: `prompts-hans.json`. Versuch, die Imkerjacke per Vorlage aus B zu erzeugen, ergab nur ein weißes Hemd → C bleibt eigene Vorlage.
- Danach LoRA-Training für Anna und Hans prüfen (Draw Things „PEFT“), damit beide zusammen in einem Bild gleich aussehen (Szenen 3, 6, 8). Bis dahin: Szenen mit beiden über die Vorlage-Methode versuchen.
- Ansichten: s1-weit/s1-brief, s2-weit/s2-heft, s3-tuer, s6-schulter, s7-kontrolle, s8-lachen (+ App-Aufnahmen 4–6).

## Kurzclips (hochkant)
1. Szenen 1–2 + 5: „Kontrolle nächste Woche?“
2. Szenen 4 + 6: „Behandlung und Beleg in Sekunden“

## Sprechertexte für ElevenLabs (an Julian 11.11.2026)
Je Figur eine Aufnahme, jede Zeile ein Absatz mit Leerzeile dazwischen (ergibt Pausen; Schnitt per `zeiten.py`).
- **Hans (Felix):** 1 „Kontrolle nächste Woche … Wo ist bloß mein Bestandsbuch?“ · 2 „Irgendwo hab ich doch aufgeschrieben, was ich im August gegen die Varroa gemacht hab …“ · 3 „Und die Kaufbelege?“ · 4 „Na, das ging ja schnell.“ · 5 „Gut … aber meine Stockkarte behalt ich trotzdem.“
- **Anna (Frauenstimme):** 1 „Zeig mal her, Hans. Ich mach das inzwischen anders.“ · 2 „Nach jeder Behandlung trag ich's gleich am Stand ein. Mittel, Menge, alle Völker auf einmal.“ · 3 „Und fürs Amt tipp ich einmal – fertig ist das Bestandsbuch als PDF.“ · 4 „Fotografier ich und häng sie direkt an die Behandlung.“ · 5 „Hab ich mir schon gedacht.“ · 6 „ImkerBuch – dein digitales Stockbuch. Probier's dreißig Tage kostenlos aus.“
