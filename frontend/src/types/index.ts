export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Dashboard {
  id: number;
  name: string;
  owner_id: number;
  config: any;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Annotation {
  id: number;
  dashboard_id: number;
  user_id: number;
  data_point: string;
  content: string;
  x_pos: number;
  y_pos: number;
  created_at: string;
  user_email?: string;
}