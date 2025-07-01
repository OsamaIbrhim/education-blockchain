import React, { useState } from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Input,
    FormControl,
    FormLabel,
    Container,
    Grid,
    GridItem,
    useColorModeValue,
    useMultiStyleConfig,
    Skeleton,
    useToast,
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { useAppData } from 'hooks/useAppData';
import { Certificate } from 'components/student/Certificate';
import { Certificate as CertificateType } from 'types/certificate';

const CertificatePage = () => {
    const { t } = useLanguage();
    const { certificates, isLoading } = useAppData();
     const toast = useToast();
    const styles = useMultiStyleConfig('CoursePage', {});

      const handleDownload = (cert: CertificateType) => async () => {
        try {
          window.open(`https://ipfs.io/ipfs/${cert.ipfsHash}`, '_blank');
          toast({
            title: 'جاري التحميل - Downloading',
            description: 'تم فتح الشهادة في نافذة جديدة - Certificate opened in new window',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top',
          });
        } catch (error: any) {
          console.error('Error downloading certificate:', error);
          toast({
            title: 'خطأ في التحميل - Download Error',
            description: error.message || 'فشل في تحميل الشهادة - Failed to download certificate',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          });
        }
      };

    return (
        <Box sx={styles.container}>
            <Container maxW="container.xl" pb="100px">
                <Skeleton isLoaded={!isLoading} borderRadius="xl">
                    <Certificate
                        certificatesData={certificates}
                        onDownload={handleDownload}
                        loading={isLoading}
                    />
                </Skeleton>
            </Container>
        </Box>
    );
};

export default CertificatePage;