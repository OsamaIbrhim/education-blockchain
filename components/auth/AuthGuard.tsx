import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppData } from '../../hooks/useAppData';
import LoadingSpinner from '../LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { userRole, isLoading, address } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for the user data to be loaded
    }

    if (!address) {
      // If there's no connected wallet, redirect to login
      router.push('/login');
      return;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      // If the user's role is not allowed, redirect to an unauthorized page or home
      router.push('/unauthorized'); // Or another appropriate page
    }
  }, [userRole, isLoading, address, router, allowedRoles]);

  if (isLoading || !userRole || !allowedRoles.includes(userRole)) {
    // Show a loading spinner while checking auth or if redirecting
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default AuthGuard;