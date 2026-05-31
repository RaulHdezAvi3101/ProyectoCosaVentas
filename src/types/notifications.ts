export type NotificationKind =
  | "want_offer_received"
  | "want_offer_accepted"
  | "want_offer_rejected";

export interface InAppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}
