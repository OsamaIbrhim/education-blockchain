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
