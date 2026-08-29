# Offene Fragen

Diese Punkte sind bewusst **keine** priorisierten Funde mit vorgeschlagener Lösung — es sind fachliche
oder produktbezogene Entscheidungen, die der Nutzer/das Team treffen muss, bevor eine Änderung
umgesetzt werden kann. Der Audit erfindet an diesen Stellen keine Annahme.

## 1. Store-vs-Seed-Array-Divergenz (bereits in `docs/ARCHITECTURE.md` bekannt)

`docs/ARCHITECTURE.md` (Abschnitt 6) beschreibt explizit, dass einige Bereiche den live editierbaren
Store lesen (`useProduktionsplaene()`), während andere denselben statischen Seed direkt aus `data.ts`
lesen — mit dem konkreten Beispiel: die Küche liest `produktionsplaene` direkt, der Admin-Bereich über
den Store. Das führt dazu, dass eine Zusatzmengen-Änderung durch den Admin in der Küche nicht sichtbar
wird. Die Doku selbst hält fest, dass dies "historisch gewachsen" und eine bewusste Nicht-Behebung ist,
bis eine Produktentscheidung getroffen wurde.

**Zusätzlich festgestellt:** Der `features/kitchen/`-Ordner, auf den sich dieses Beispiel bezieht,
**existiert im aktuellen Code nicht mehr** (siehe Punkt 2). Ob das ursprüngliche Beispiel damit
gegenstandslos ist oder ob dasselbe Muster nun innerhalb von `features/production` in anderer Form
fortbesteht, konnte nicht abschließend geklärt werden — die gezielte Suche nach weiteren Instanzen
dieses Musters ergab keine neuen Treffer (siehe `02-frontend-quality.md`, Offene Frage 2).

**Zu klären:** Soll Küche/Produktion künftig konsistent denselben Store lesen? Falls ja, ist das eine
Verhaltensänderung (nicht nur ein Bugfix) und sollte als eigenständige, bewusst freigegebene Änderung
behandelt werden.

## 2. Fehlendes "Küche"-Modul trotz Dokumentation als existierendes Feature

`README.md` (Abschnitt 3, Projektstruktur) und `BACKEND_AUDIT.md` (Abschnitt "Production & Kitchen")
beschreiben ein `kitchen/`-Modul ("Küche: heutige Produktion, Statuspflege") als vorhandenen
Bestandteil der Anwendung. Tatsächlich existieren im aktuellen Checkout **weder** `src/app/kitchen/`
**noch** `src/features/kitchen/** — bestätigt sowohl beim `npm run build` (kein `/kitchen`-Route im
Output, siehe `01-phase2-runnable.md`) als auch bei der Verzeichnisprüfung während des
Frontend-Qualitätsaudits (`02-frontend-quality.md`).

**Zu klären:** Wurde das Küchen-Modul bewusst entfernt/in `admin/production` integriert (dann ist nur
die Dokumentation zu aktualisieren), oder ist es ein noch ausstehendes, fälschlich als fertig
dokumentiertes Feature? Das beeinflusst direkt, wie die produktionsbezogenen Prozesse aus Abschnitt 9
des Master-Prompts ("Produktion und Lieferung") zu bewerten sind.

## 3. Preishistorie vs. Einzelpreis bei Lieferantenpreisen (`IngredientSupplierPrice`)

Siehe `DBI-07`/`DBI-02` in `05-database-integrity.md`: Der Modellkommentar beschreibt die Absicht "ein
aktueller Preis pro Lieferant, günstigster wird zur Laufzeit aufgelöst", es existiert aber keine
Unique-Constraint, die genau das erzwingt.

**Zu klären:** Ist eine Preishistorie über die Zeit gewollt (dann braucht es
`EffectiveFrom`/`IsCurrent`-Felder), oder soll strikt ein Preis pro Lieferant gelten (dann eine simple
Unique-Constraint)? Ohne diese Entscheidung kann DBI-07 nicht sinnvoll behoben werden.

## 4. Ist die zentrale `AuditLog`-Tabelle als vollständiger Audit-Trail gedacht?

Siehe `DBI-04`/`DBI-05`/`DBI-06`: Der Implementierungsplan listet mehrere state-changing Aktionen
(Feature-Flag-Toggle, Support-Session-Start/-Ende, Produktionsanpassungen) als
"schreibt-einen-AuditLog-Eintrag"-pflichtig, die tatsächliche Implementierung schreibt bei diesen drei
Aktionen aber nur in dedizierte Fachtabellen, nicht zusätzlich ins zentrale `AuditLog`.

**Zu klären:** Ist eine dedizierte Fachtabelle pro Aktion als gleichwertiger Ersatz für den zentralen
Log akzeptiert (dann ist nur die Doku im Implementierungsplan zu korrigieren), oder wird eine
einheitliche, rollenübergreifend durchsuchbare Audit-Sicht über alle Aktionstypen hinweg als
Anforderung bestätigt (dann müssen die drei Handler ergänzt werden)?

## 5. CHECK-Constraints und mögliche Altdaten-Verstöße

Siehe `DBI-03`/`DBI-08`: Bevor CHECK-Constraints gegen negative Preise/Mengen eingeführt werden, muss
geprüft werden, ob ein bereits befüllter Datenbankstand (insbesondere aus dem in `DBI-08` beschriebenen
Sync-Import-Pfad, der ungültige `ConversionFactor`-Werte still auf `1` setzt) Verstöße enthält. Das ist
ohne Zugriff auf echte Produktionsdaten aus dem Repository heraus nicht zu beurteilen.

## 6. Abhängigkeits-Schwachstellen erfordern Next.js-Major-Upgrade

`npm audit` meldet 4 High-Severity-Schwachstellen (`nanoid`, `postcss`, `sharp`, transitiv über
`next@15.3.3`), siehe `01-phase2-runnable.md`. Ein Fix ohne Breaking Change ist laut `npm audit` nicht
verfügbar — nur `npm audit fix --force` (Upgrade auf `next@16.3.3`) würde alle vier beheben.

**Zu klären:** Wird ein Next.js-Major-Upgrade mit vorheriger Kompatibilitätsanalyse angestoßen (App
Router/React-19-Kompatibilität, Breaking Changes in Next 16 prüfen), oder wird das Risiko dieser vier
Advisories für den aktuellen Nutzungskontext (kein bekannter direkter Angriffspfad über Nutzereingaben
an `sharp`/`postcss` zur Laufzeit dieser Anwendung) vorerst bewusst akzeptiert?

## 7. Repository-Pattern im Backend — beibehalten oder konsolidieren?

Siehe `BEQ-03`: Unklar, ob das generische `IRepository<T>`-Pattern ursprünglich für zukünftige
Testbarkeit eingeführt wurde und die Migration zu direktem `DbContext`-Zugriff unvollständig ist, oder
ob es ein bewusst aufgegebener Zwischenschritt ist.

## 8. SUPER_ADMIN-Zugriff auf tenant-gebundene Handler ohne Impersonation

Siehe `BEQ-04`: Ist geplant, dass ein SUPER_ADMIN jemals direkt (ohne den dedizierten
Impersonation-Mechanismus) auf tenant-gebundene Handler-Methoden zugreifen soll? Die Antwort
beeinflusst, ob die weitverbreitete `TenantId!.Value`-Verwendung ohne Guard als Robustheitsfrage oder
als Korrektheitslücke einzustufen ist.
