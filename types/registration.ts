export type RoleType = 'student' | 'institution' | 'employer' | 'admin' | 'none';

export interface BaseUser {
  userAddress: string;
  role: RoleType;
  isVerified: boolean;
}

export interface StudentData extends BaseUser {
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  institutionAddress: string;
  enrolledCourses: string[];
  status: number;
}

export interface InstitutionData extends BaseUser {
  name: string;
  location: string;
  phoneNumber: string;
  email: string;
  website: string;
  status: number;
}

export interface EmployerData extends BaseUser {
  companyName: string;
  location: string;
  phoneNumber: string;
  email: string;
  website: string;
}

export interface RegistrationData {
  role: 'student' | 'institution' | 'employer';
  name: string;
  email: string;
  phoneNumber: string;
  nationalId?: string;
  institutionAddress?: string;
  address?: string;      // User's blockchain address
  status?: number;       // Status flag
  isVerified?: boolean;  // Verification status
  enrolledCourses?: string[]; // For students
}