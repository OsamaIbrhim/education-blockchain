import React, { useState, useEffect } from 'react';
import {
  ScaleFade,
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Tooltip,
  Button,
  useColorModeValue,
  Center,
  Link,
  Container,
  Spinner,
  useClipboard,
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import type { Certificate, Certificate as CertificateType } from '../../types/certificate';
import { AlertCircleIcon, DownloadIcon } from 'components/Icons';
import { CertificateManagement } from 'components/institution/CertificateManagement';
import { issueCertificate } from 'services/certificate';

interface CertificateManagementProps {
  certificatesData: any[];
  onDownload: (cert: CertificateType) => () => void;
  loading: boolean;
}

export function Certificate({
  certificatesData,
  onDownload,
  loading,
}: CertificateManagementProps) {
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>جاري التحميل... | Loading...</Text>
      </Container>
    );
  }

  return (
    <ScaleFade initialScale={0.9} in={true}>
      <Box
        bg={cardBg}
        borderRadius="xl"
        shadow="xl"
        overflow="hidden"
        borderWidth="1px"
        position="relative"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: '2xl',
          borderColor: 'blue.400'
        }}
      >
        <Box p={6}>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color={textColor}>
              الشهادات الأكاديمية | Academic Certificates
            </Heading>
            <Text color={mutedTextColor}>
              قائمة بجميع شهاداتك الأكاديمية وتفاصيلها
              <br />
              List of all your academic certificates and their details
            </Text>
            <Box overflowX="auto">
              {certificatesData.length === 0 ? (
                <Center p={8}>
                  <VStack spacing={3}>
                    <InfoIcon boxSize="40px" color="blue.500" />
                    <Text fontSize="lg">لا توجد شهادات بعد</Text>
                    <Text color={mutedTextColor}>
                      No certificates yet
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>معرف الشهادة - Certificate ID</Th>
                      <Th>المؤسسة - Institution</Th>
                      <Th>تاريخ الإصدار - Issue Date</Th>
                      <Th>الحالة - Status</Th>
                      <Th>الإجراءات - Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {certificatesData.map((cert, index) => (
                      <Tr
                        key={index}
                        _hover={{
                          bg: useColorModeValue('gray.50', 'gray.700'),
                          transition: 'all 0.2s',
                        }}
                      >
                        <Td 
                        fontSize="sm" 
                        maxW="180px" 
                        overflow="hidden" 
                        textOverflow="ellipsis" 
                        whiteSpace="nowrap" 
                        title={cert.address}>
                          <HStack spacing={1}>
                            <span>{cert.address}</span>
                          </HStack>
                        </Td>
                        <Td
                          fontSize="sm"
                          maxW="180px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          title={cert.institutionAddress}
                        >
                          <HStack spacing={1}>
                            <span>{cert.institutionAddress}</span>
                          </HStack>
                        </Td>
                        <Td fontSize="sm">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={cert.isValid ? 'green' : 'red'}
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {cert.isValid ? (
                              <>
                                <CheckCircleIcon mr={2} color="green.500" />
                                صالحة - Valid
                              </>
                            ) : (
                              <>
                                <AlertCircleIcon mr={2} color="red.500" />
                                غير صالحة - Invalid
                              </>
                            )}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="عرض الشهادة - View Certificate">
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => window.open(`https://fuchsia-abundant-bobcat-831.mypinata.cloud/ipfs/${cert.ipfsHash}`, '_blank')}
                              >
                                عرض - View
                              </Button>
                            </Tooltip>
                            {/* <Tooltip label="تحميل الشهادة - Download Certificate">
                                <Button
                                  leftIcon={<DownloadIcon />}
                                  colorScheme="blue"
                                  size="sm"
                                  onClick={onDownload(cert)}
                                >
                                  تحميل - Download
                                </Button>
                              </Tooltip> */}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </VStack>
        </Box>
      </Box>
    </ScaleFade>
  );
};