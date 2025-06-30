import { ethers } from 'ethers';
import { CourseManagementABI } from '../constants/abis';
import { getSigner } from 'utils/ethersConfig';
import { getConfig } from 'utils/config';

/**
 * @param signer 
 * @returns 
*/
export const getCourseManagementContract = async (signer?: ethers.Signer) => {
  const contractSigner = signer || await getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_COURSE_MANAGEMENT_ADDRESS?.toString() || getConfig('COURSE_MANAGEMENT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
  }
  const contract = new ethers.Contract(contractAddress, CourseManagementABI, contractSigner);
  return contract;
};

/**
 * Converts a string to a bytes32 hex string or decodes a bytes32 hex string to a string.
 * @param value - The input value, either a string or a bytes32 hex string.
 * @returns A bytes32 hex string if input is a string, or decoded string if input is bytes32.
 */
export function smartBytes32(value: string): string {
  // Detect if it's already a bytes32 hex string
  if (value.startsWith('0x') && value.length === 66) {
    // It's bytes32 → decode to string
    const bytes = value.slice(2);
    const chars = [];
    for (let i = 0; i < bytes.length; i += 2) {
      const hex = bytes.substr(i, 2);
      const charCode = parseInt(hex, 16);
      if (charCode === 0) break; // Stop at null terminator
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join('');
  } else {
    // It's a string → encode to bytes32
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    if (encoded.length > 32) {
      throw new Error("String is too long, must be ≤ 32 bytes");
    }
    const padded = new Uint8Array(32);
    padded.set(encoded);
    return '0x' + Array.from(padded)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

/**
 * Adds a new course to the course management system.
 * @param courseId - The unique identifier for the course.
 * @param name - The name of the course.
 * @param credits - The number of credits for the course (1-4).
 * @param department - The department offering the course.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export const addCourseService = async (
  courseId: string,
  name: string,
  credits: number,
  department: string
): Promise<{ status: string, err: any }> => {
  try {
    if (typeof courseId !== 'string' || !courseId.trim()) {
      throw new Error('Invalid courseId: must be a non-empty string');
    }
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Invalid name: must be a non-empty string');
    }
    if (typeof credits !== 'number' || credits <= 0 || credits > 4) {
      throw new Error('Invalid credits: must be a number between 1 and 4');
    }
    if (typeof department !== 'string' || !department.trim()) {
      throw new Error('Invalid department: must be a non-empty string');
    }

    const adjustedCredits = Math.round(credits * 10);

    const contract = await getCourseManagementContract();
    const tx = await contract.addCourse(courseId, name, adjustedCredits, department);
    await tx.wait();
    return { status: 'success', err: null };
  } catch (error) {
    return { status: 'Failed', err: error };;
  }
};

export const updateCourseStaticDetails = async (
  courseId: string,
  newName: string,
  newCredits: number,
  newDepartment: string
): Promise<{ status: string }> => {
  try {
    const contract = await getCourseManagementContract();
    const tx = await contract.updateCourseStaticDetails(courseId, newName, newCredits, newDepartment);
    await tx.wait();
    return { status: 'success' };
  } catch (error) {
    console.error('Error updating course details:', error);
    throw error;
  }
};

export const deactivateCourse = async (
  courseId: string
): Promise<{ status: string }> => {
  try {
    const contract = await getCourseManagementContract();
    const tx = await contract.deactivateCourse(courseId);
    await tx.wait();
    return { status: 'success' };
  } catch (error) {
    console.error('Error deactivating course:', error);
    throw error;
  }
};

export const getCourseStaticDetails = async (
  courseId: string
): Promise<any> => {
  try {
    const contract = await getCourseManagementContract();
    const courseDetails = await contract.getCourseStaticDetails(courseId);
    return courseDetails;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

export const getCoursesByDepartment = async (
  _departmentName?: string
): Promise<any[]> => {
  try {
    const contract = await getCourseManagementContract();
    const courses = await contract.getCoursesByDepartment(_departmentName);
    return courses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

export const getAllCourses = async (): Promise<any[]> => {
  try {
    const contract = await getCourseManagementContract();

    const courses = await contract.getAllCourses();

    return courses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

export const addDepartmentService = async (departmentName: string): Promise<{ status: string, err: any }> => {
  try {
    if (typeof departmentName !== 'string' || !departmentName.trim()) {
      throw new Error('Invalid departmentName: must be a non-empty string');
    }

    const contract = await getCourseManagementContract();
    const tx = await contract.addDepartment(departmentName);
    await tx.wait();
    return { status: 'success', err: null };
  } catch (error) {
    return { status: 'Failed', err: error };
  }
}

export const getAllDepartments = async (): Promise<string[]> => {
  try {
    const contract = await getCourseManagementContract();
    const departments = await contract.getAllDepartments();
    return departments;
  } catch (error) {
    console.error('Error fetching all departments:', error);
    throw error;
  }
}