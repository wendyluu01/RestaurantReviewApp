export interface IUser {
  id: number;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyId?: number;
  company?: string;
  country?: number;
  language?: number;
  password?: string;
  authToken?: string;
  refreshToken?: string;
}
export interface ILoginIn {
  email: string;
  password: string;
}
