export interface Worker {
  id: number;
  code: string;
  name: string;
  email?: string | null;
  is_active?: boolean;
}

export interface WorkShift {
  id: number;
  worker?: Worker;
  started_at: string;
  started_at_formatted?: string;
  ended_at?: string | null;
  ended_at_formatted?: string | null;
  total_worked_seconds?: number | null;
  duration_formatted?: string | null;
  status: number;
  is_active: boolean;
  created_at?: string;
}

export interface ShiftStatusData {
  has_active_shift: boolean;
  worker: Worker;
  active_shift: WorkShift | null;
  elapsed_seconds: number;
  server_time: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

