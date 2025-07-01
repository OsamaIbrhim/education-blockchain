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