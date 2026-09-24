import {
  ArrowLeft, ArrowRight, ArrowRightLeft, Ban, BookmarkPlus, Check, CheckCheck, ChevronsRight, Copy,
  Download, Eye, EyeOff, KeyRound, LogIn, LogOut, Navigation, Pencil, Phone, Play, Plus, Power,
  PowerOff, Printer, RefreshCw, RotateCcw, Save, Send, Trash2, Upload, UserCheck, UserX, X,
  type LucideIcon,
} from "lucide-react";

/** Projektweites Icon-Vokabular für Buttons: eine Aktion = immer dasselbe Icon, auf jeder Seite.
 * Buttons zeigen nur noch das Icon (siehe ./button), daher muss die Zuordnung eindeutig und
 * überall gleich sein, sonst kann niemand die Buttons „lesen“. */
export const ACTION_ICONS = {
  create: Plus,          // anlegen, hinzufügen, erstellen
  edit: Pencil,          // bearbeiten
  delete: Trash2,        // löschen, entfernen
  save: Save,            // speichern (Formular)
  confirm: Check,        // bestätigen, übernehmen, OK
  cancel: X,             // abbrechen, schließen, ausblenden
  send: Send,            // absenden, einreichen
  back: ArrowLeft,       // zurück zur Übersicht
  open: ArrowRight,      // öffnen, weiter zu …
  view: Eye,             // Details anzeigen
  hide: EyeOff,          // ausblenden
  download: Download,    // Export, CSV, Download
  upload: Upload,        // Import, Datei hochladen
  print: Printer,        // drucken
  refresh: RefreshCw,    // neu laden, aktualisieren
  reset: RotateCcw,      // zurücksetzen
  password: KeyRound,    // Passwort zurücksetzen
  activate: Power,       // aktivieren
  deactivate: PowerOff,  // deaktivieren
  userActivate: UserCheck,
  userDeactivate: UserX,
  approve: CheckCheck,   // freigeben, genehmigen
  reject: Ban,           // ablehnen, sperren
  advance: ChevronsRight, // nächster Status
  start: Play,           // starten
  transfer: ArrowRightLeft, // übertragen, verschieben
  copy: Copy,            // duplizieren, kopieren
  template: BookmarkPlus, // als Vorlage
  login: LogIn,
  logout: LogOut,
  call: Phone,
  navigate: Navigation,
} satisfies Record<string, LucideIcon>;
