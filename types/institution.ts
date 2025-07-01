export interface Institution {
  name?: string;
  address: string;
  logo?: string;
  ministry?: string;
  university?: string;
  college?: string;
  description?: string;
  imageUrl?: string;
  imageIpfsCid?: string;
  website?: string;
  email?: string;
  phone?: string;
  lastUpdated?: string;
  establishedDate?: string;
  accreditationNumber?: string;
  isVerified: boolean;
  verificationDate?: Date;
  ipfsHash?: string;
  role?: number;
  roleText?: string;
  createdAt?: Date;
}

export interface Student {
  address: string;
  name: string;
  email: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}

export interface NewUser {
  role: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
}

export interface User {
  address: string; // userAddress
  role: string; // role (uint8)
  nationalId: string; // nationalId
  firstName: string; // firstName
  lastName: string; // lastName
  phoneNumber: string; // phoneNumber
  email: string; // email
  department: string; // department
  // enrolledCourses: string[]; // enrolledCourses
  status: number; // status (uint8)
  isVerified: boolean // isVerified
}