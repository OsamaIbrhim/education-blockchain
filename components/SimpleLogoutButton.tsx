import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function SimpleLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear all stored data
      localStorage.clear();
      sessionStorage.clear();

      // Clear specific contract-related data
      const keysToRemove = [
        'walletAddress',
        'userRole',
        'adminAddress',
        'contractAddresses',
        'hasVisitedAdminDashboard',
        'lastLoginTime',
        'userType',
        'isAuthenticated',
        'NEXT_PUBLIC_ADMIN_ADDRESS',
        'NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS',
        'NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Reset MetaMask connection if available
      if (typeof window !== 'undefined' && window.ethereum) {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', () => {});
          window.ethereum.removeListener('chainChanged', () => {});
          window.ethereum.removeListener('connect', () => {});
          window.ethereum.removeListener('disconnect', () => {});
        }
      }

      // Navigate to home page
      await router.push('/');
      
      // Force page reload after navigation
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback to direct reload if navigation fails
      window.location.reload();
    }
  };

  return (
    <Button
      colorScheme="red"
      onClick={handleLogout}
      width="full"
      size="lg"
      mb={4}
    >
      تسجيل الخروج - Logout
    </Button>
  );
} 