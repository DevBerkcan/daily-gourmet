import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface InvitationDetails {
  name: string;
  email: string;
}

/** Public lookup for the "set your password" page — no auth required, the token itself is the
 * credential (see AuthController.GetInvitation / AuthHandler.FindByValidInvitationTokenAsync). */
export function useInvitation(token: string | null) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => api.get<InvitationDetails>(`/auth/invitations/${encodeURIComponent(token!)}`),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      api.post<void>(`/auth/invitations/${encodeURIComponent(token)}/accept`, { password }),
  });
}
