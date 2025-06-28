import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from 'components/layout/Navbar';
import Footer from './Footer';
import ProtectedRoute from 'components/auth/ProtectedRoute';
import { useAppData } from 'hooks/useAppData';
import DynamicHeader from './DynamicHeader';

interface LayoutProps {
  children: React.ReactNode;
  address?: string;
  exams?: any[];
  onNotificationsOpen?: () => void;
  pageName?: string;
  allowedValue: any;
}

const Layout = ({
  children,
  address,
  exams,
  onNotificationsOpen,
  pageName,
  allowedValue,
}: LayoutProps) => {
  const { userRole } = useAppData();

  return (
    <Box minH="100vh" bgColor="chakra-body-bg" color="chakra-body-text">
      <Navbar onNotificationsOpen={onNotificationsOpen} />
      <DynamicHeader /*userRole={userRole}*/ />
      <Box as="main" mt="4">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
