import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  UnorderedList,
  ListItem,
  useColorModeValue
} from '@chakra-ui/react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          مرحباً بك في لوحة تحكم المؤسسة التعليمية
          <br />
          Welcome to the Institution Dashboard
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch" pb={6}>
            <Text color={textColor}>
              هذه اللوحة تمكنك من إدارة الشهادات والاختبارات بسهولة
              <br />
              This dashboard allows you to manage certificates and exams easily
            </Text>

            <Text fontWeight="bold">
              الميزات الرئيسية - Key Features:
            </Text>

            <UnorderedList spacing={3} pl={4} color={textColor}>
              <ListItem>
                إصدار الشهادات - Issue Certificates
                <Text fontSize="sm">
                  يمكنك إصدار شهادات رقمية موثقة للطلاب
                  <br />
                  You can issue verified digital certificates to students
                </Text>
              </ListItem>

              <ListItem>
                إدارة الشهادات المصدرة - Manage Issued Certificates
                <Text fontSize="sm">
                  تتبع وإدارة جميع الشهادات التي تم إصدارها
                  <br />
                  Track and manage all certificates that have been issued
                </Text>
              </ListItem>

              <ListItem>
                إدارة الاختبارات - Manage Exams
                <Text fontSize="sm">
                  إنشاء وإدارة الاختبارات، وتسجيل الطلاب
                  <br />
                  Create and manage exams, enroll students
                </Text>
              </ListItem>

              <ListItem>
                تتبع النتائج - Track Results
                <Text fontSize="sm">
                  عرض وتحليل نتائج الاختبارات مع إحصائيات مفصلة
                  <br />
                  View and analyze exam results with detailed statistics
                </Text>
              </ListItem>
            </UnorderedList>

            <Button colorScheme="blue" onClick={onClose}>
              فهمت - Got it
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
