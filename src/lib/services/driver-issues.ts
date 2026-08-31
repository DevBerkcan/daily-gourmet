import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/** Ein Fahrer meldet eine Frage/ein Problem aus seinem Dashboard — allgemein, nicht an einen
 * bestimmten Stopp gebunden (dafür gibt es bereits "Problem melden" pro Stopp in der Tourenansicht).
 * Landet als Broadcast-Benachrichtigung bei den Tenant-Admins (siehe DriverIssueHandler). */
export function useReportDriverIssue() {
  return useMutation({
    mutationFn: (message: string) => api.post("/driver-issues", { message }),
  });
}
