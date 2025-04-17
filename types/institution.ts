import { ethers } from 'ethers';
import type { EthereumProvider } from './ethereum';

export interface Institution {
  id: string;
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
  id: string;
  address: string;
  name: string;
  email: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}

export interface Certificate {
  id: string;
  studentAddress: string;
  title: string;
  description: string;
  issueDate: string;
  status: 'pending' | 'issued';
  ipfsHash?: string;
  institution: Institution;
  metadata: {
    studentName: string;
    degree: string;
    grade: string;
    percentage: number;
    totalScore: number;
    maxScore: number;
  };
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  date: number;
  duration: number;
  status: string;
  ipfsHash: string;
  students: string[];
}

export interface ExamResult {
  studentAddress: string;
  score: number;
  grade: string;
  notes: string;
}

export interface ExamStatistics {
  totalStudents: number;
  passingCount: number;
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
  fCount: number;
  averageScore: number;
  passRate: number;
  mostCommonGrade: string;
}

export interface NewExam {
  title: string;
  description: string;
  date: number;
  duration: number;
  ipfsHash: string;
} 