"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTION_ICONS } from "@/components/ui/icons";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Auffangnetz für Rendering-Fehler (u. a. "Maximum update depth exceeded") — ohne das bringt so
 * ein Fehler die ganze App auf einen weißen/roten Bildschirm, und der Nutzer kommt nur per manuellem
 * Neuladen der URL wieder raus. Zeigt stattdessen einen "Seite neu laden"-Button; der eigentliche
 * Fehler landet trotzdem unverändert in der Browser-Konsole inklusive Komponenten-Stack — genau der,
 * der zeigt, welche Komponente die Endlosschleife ausgelöst hat. Bewusst eine Klassenkomponente:
 * React bietet für getDerivedStateFromError/componentDidCatch (Stand React 19) keinen Hook-Ersatz. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("ErrorBoundary hat einen Rendering-Fehler aufgefangen:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-danger" aria-hidden />
            <h1 className="mt-4 font-display text-lg font-semibold text-ink">Etwas ist schiefgelaufen</h1>
            <p className="mt-2 text-sm text-muted">
              Die Seite ist in einen unerwarteten Zustand geraten. Ein Neuladen behebt das in der Regel.
            </p>
            <Button icon={ACTION_ICONS.refresh} label="Seite neu laden" onClick={() => window.location.reload()} className="mt-5" />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
