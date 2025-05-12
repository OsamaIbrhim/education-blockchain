import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  address?: string;
  exams?: any[];
  onNotificationsOpen?: () => void;
  pageName?: string;
}

const Layout = ({ children, address, exams, onNotificationsOpen, pageName }: LayoutProps) => {
  return (
    <Box minH="100vh">
      <Navbar 
        address={address}
        exams={exams}
        onNotificationsOpen={onNotificationsOpen}
        pageName={pageName}
      />
      <Box>{children}</Box>
    </Box>
  );
};

export default Layout; 