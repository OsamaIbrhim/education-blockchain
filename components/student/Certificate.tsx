import React from 'react';
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
  Spinner,
  Container,
} from '@chakra-ui/react';
import { InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { AlertCircleIcon } from 'components/Icons';
import type { Certificate as CertificateType } from '../../types/certificate';
import { useLanguage } from 'context/LanguageContext';

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
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>{t('loading')}</Text>
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
              {t('certificates')}
            </Heading>
            <Text color={mutedTextColor}>
              {t('resultsList') || 'List of all your academic certificates and their details'}
            </Text>
            <Box overflowX="auto">
              {certificatesData.length === 0 ? (
                <Center p={8}>
                  <VStack spacing={3}>
                    <InfoIcon boxSize="40px" color="blue.500" />
                    <Text fontSize="lg">{t('noResultsYet')}</Text>
                    <Text color={mutedTextColor}>
                      {t('noResultsYet')}
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>{t('certificateTitlePrefix')} ID</Th>
                      <Th>{t('institutionName')}</Th>
                      <Th>{t('issueDate')}</Th>
                      <Th>{t('status')}</Th>
                      <Th>{t('actions')}</Th>
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
                                {t('verified')}
                              </>
                            ) : (
                              <>
                                <AlertCircleIcon mr={2} color="red.500" />
                                {t('notAvailable')}
                              </>
                            )}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label={t('showInstitution')}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => window.open(`https://fuchsia-abundant-bobcat-831.mypinata.cloud/ipfs/${cert.ipfsHash}`, '_blank')}
                              >
                                {t('view') || 'View'}
                              </Button>
                            </Tooltip>
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
}