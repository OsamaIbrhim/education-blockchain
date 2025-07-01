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
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { useAppData } from 'hooks/useAppData';

const CertificatePage = () => {
    const { t } = useLanguage();
    const { certificates, isLoading: loading } = useAppData();
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [certificateList, setCertificateList] = useState(certificates);
    const [isAddingCertificate, setIsAddingCertificate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const styles = useMultiStyleConfig('CoursePage', {});

    const tabs = new Map([
        ['Overview', 'overview'],
        ['Issued Certificates', 'issued'],
        ['Pending Certificates', 'pending'],
    ]);

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
        setIsAddingCertificate(false);
    };

    const handleAddCertificateClick = () => {
        setIsAddingCertificate(true);
    };

    const handleSaveCertificate = () => {
        setIsAddingCertificate(false);
        setSelectedTab(null);
    };

    return (
        <Box sx={styles.container}>
            <Container maxW="container.xl" pb="100px">
                <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                    {/* Left Card: Certificate Type Selection */}
                    <GridItem colSpan={{ base: 12, md: 3 }}>
                        <Box sx={styles.card}>
                            <Heading size="md" mb={4}>
                                {t('certificateTypes')}
                            </Heading>
                            <VStack spacing={4} align="stretch">
                                {Array.from(tabs.keys()).map((tab) => (
                                    <Button
                                        key={tab}
                                        variant={selectedTab === tab ? 'solid' : 'outline'}
                                        colorScheme="teal"
                                        onClick={() => {
                                            setSelectedTab(tab);
                                            setIsAddingCertificate(false);
                                        }}
                                    >
                                        {tab}
                                    </Button>
                                ))}
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* Main Content */}
                    <GridItem colSpan={{ base: 12, md: 6 }}>
                        {loading ? (
                            Array.from({ length: 1 }).map((_, index) => (
                                <Skeleton key={index} height="350px" borderRadius="xl" />
                            ))
                        ) : (
                            <Box sx={styles.card} position="relative" minH="350px">
                                {isAddingCertificate ? (
                                    <VStack spacing={4} align="stretch">
                                        <Heading size="md" mb={4}>
                                            {t('addNewCertificate')}
                                        </Heading>
                                        <FormControl>
                                            <FormLabel>{t('certificateName')}</FormLabel>
                                            <Input placeholder={t('enterCertificateName')} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>{t('certificateDescription')}</FormLabel>
                                            <Input placeholder={t('enterCertificateDescription')} />
                                        </FormControl>
                                    </VStack>
                                ) : selectedTab ? (
                                    <VStack spacing={4} align="stretch">
                                        <Heading size="md" mb={4}>
                                            {t('certificatesIn')} {tabs.get(selectedTab)}
                                        </Heading>
                                        <Input
                                            placeholder={t('searchCertificate')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            mb={4}
                                        />
                                    </VStack>
                                ) : (
                                    <>
                                        <VStack sx={styles.welcomeMessage}>
                                            <Heading size="lg">{t('universityName')}</Heading>
                                        </VStack>
                                        <Box sx={styles.logo} />
                                    </>
                                )}
                            </Box>
                        )}
                    </GridItem>

                    {/* Actions */}
                    <GridItem colSpan={{ base: 12, md: 3 }}>
                        <Box sx={styles.card}>
                            <Heading size="md" mb={4}>
                                {t('actions')}
                            </Heading>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={() => {
                                    setIsAddingCertificate(true);
                                    setSelectedTab(null);
                                }}
                                isDisabled={isAddingCertificate}
                            >
                                {t('addNewCertificate')}
                            </Button>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
};

export default CertificatePage;