export interface User {
  id?: number | string;
  name?: string;
  middle_name?: string;
  last_name?: string;
  mother_last_name?: string;
  has_image?: number | boolean;
  updated_at?: string;
  clients?: any[];
  role?: any;
  token?: string;
  [key: string]: any;
}

export default User;
