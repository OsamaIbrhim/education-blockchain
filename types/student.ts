export interface Student {
  userAddress: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  institutionAddress: string;
  enrolledCourses: string[];
  status: number;
  isVerified: boolean;
}

export type StudentRole = 'NONE' | 'STUDENT' | 'INSTITUTION' | 'EMPLOYER' | 'ADMIN';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';

// Map status number to text
export const StudentStatusMap = {
  0: 'ACTIVE',
  1: 'INACTIVE',
  2: 'GRADUATED',
  3: 'SUSPENDED'
} as const;

// Map user role number to text
export const UserRoleMap = {
  0: 'NONE',
  1: 'STUDENT',
  2: 'INSTITUTION',
  3: 'EMPLOYER',
  4: 'ADMIN'
} as const;
