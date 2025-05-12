export interface Institution {
  name: string;
  address: string;
  logo?: string;
  ministry: string;
  university: string;
  college: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  establishedDate?: string;
  accreditationNumber?: string;
}

export interface Student {
  address: string;
  name: string;
  email: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}