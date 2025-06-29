import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from 'components/layout/Navbar';
import Footer from './Footer';
import ProtectedRoute from 'components/auth/ProtectedRoute';
import { useAppData } from 'hooks/useAppData';
import DynamicHeader from './DynamicHeader';

interface LayoutProps {
  children: React.ReactNode;
  onNotificationsOpen?: () => void;
}

const Layout = ({
  children,
  onNotificationsOpen,
}: LayoutProps) => {
  return (
    <Box minH="100vh" bgColor="chakra-body-bg" color="chakra-body-text">
      <Navbar onNotificationsOpen={onNotificationsOpen} />
      <DynamicHeader />
      <Box as="main" mt="4">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
