export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  created_at: string;
  shop_name: string;
  mobile: string;
  description: string;
  photo_url: string | null;
  status: ComplaintStatus;
  admin_notes: string | null;
}
