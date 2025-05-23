import React, { useMemo } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  HStack,
  Text,
  Box,
  VStack,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiNotification3Line } from 'react-icons/ri';
import { Exam } from '../../../types/examManagement';

const MotionBox = motion(Box);

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[] | undefined;
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose, exams }) => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const drawerContentBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)');
  const notificationBg = useColorModeValue('gray.50', 'gray.700');

  const notificationVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }), []);

  const pendingApprovalExams = useMemo(() => {
    return exams?.filter(exam => exam.status === 'IN_PROGRESS') || [];
  }, [exams]);

  return (
    <Drawer
      isOpen={isOpen}
      placement={isLargerThan768 ? "right" : "bottom"}
      onClose={onClose}
    >
      <DrawerOverlay backdropFilter="blur(10px)" />
      <DrawerContent
        bg={drawerContentBg}
        backdropFilter="blur(10px)"
      >
        <DrawerHeader
          borderBottomWidth="1px"
          bgGradient="linear(to-r, blue.400, purple.500)"
          color="white"
        >
          <HStack spacing={2}>
            <RiNotification3Line />
            <Text>الإشعارات | Notifications</Text>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          <AnimatePresence>
            {pendingApprovalExams.map(exam => (
              <MotionBox
                key={exam.address}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={notificationVariants}
                transition={{ duration: 0.2 }}
              >
                <Box
                  p={4}
                  mb={4}
                  bg={notificationBg}
                  borderRadius="lg"
                  borderLeft="4px"
                  borderLeftColor="orange.400"
                  _hover={{
                    transform: 'translateX(-4px)',
                    shadow: 'md'
                  }}
                  transition="all 0.2s"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{exam.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      بانتظار الموافقة | Pending Approval
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {new Date(exam.date).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationsDrawer;
