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
  const contractAddress = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS?.toString() || getConfig('COURSE_MANAGEMENT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
  }
  const contract = new ethers.Contract(contractAddress, CourseManagementABI, contractSigner);
  return contract;
};

export const addCourse = async (
  courseId: string,
  name: string,
  credits: number,
  department: string
): Promise<{ status: string }> => {
  try {
    const contract = await getCourseManagementContract();
    const tx = await contract.addCourse(courseId, name, credits, department);
    await tx.wait();
    return { status: 'success' };
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
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
    }catch (error) {
        console.error('Error fetching all courses:', error);
        throw error;
    }
};