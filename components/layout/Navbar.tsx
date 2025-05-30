import React from 'react';
import {
    Box, Flex, HStack, Heading, Icon, Button, Avatar, useColorModeValue, Tooltip, Spacer,
    Spinner
} from '@chakra-ui/react';
import { FaUniversity, FaSignOutAlt, FaHome, FaThLarge } from 'react-icons/fa';
import { BellIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useAppData } from 'hooks/useAppData';
import { useLanguage } from 'context/LanguageContext ';

interface NavbarProps {
    onNotificationsOpen?: () => void;
}

const Navbar = ({ onNotificationsOpen }: NavbarProps) => {
    const router = useRouter();
    const { userRole, account: address } = useAppData();
    const { language, setLanguage, t, translations } = useLanguage();

    if (Object.keys(translations).length === 0) {
        return <Spinner />;
    }

    const navLinks = [
        {
            label: t('home'), // استخدم الترجمة هنا
            icon: <FaHome />,
            href:
                userRole === 'admin' ? '/dashboard/admin'
                    : userRole === 'student' ? '/dashboard/student'
                        : userRole === 'employer' ? '/dashboard/employer'
                            : userRole === 'institution' ? '/dashboard/institution'
                                : '/', show: !!userRole
        },
    ];

    const handleLogout = () => {
        router.push('/');
    };

    const glassHeaderBg = useColorModeValue('rgba(255,255,255,0.95)', 'rgba(26,32,44,0.95)');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Box
            bg={glassHeaderBg}
            backdropFilter="blur(10px) saturate(180%)"
            py={3}
            px={{ base: 3, md: 8 }}
            position="sticky"
            top={0}
            zIndex={100}
            borderBottom="1px"
            borderColor={borderColor}
            shadow="sm"
        >
            <Flex align="center" maxW="container.xl" mx="auto">
                {/* Logo & Title */}
                <HStack spacing={3} cursor="pointer" onClick={() => router.push('/')}>
                    <Icon as={FaUniversity} w={7} h={7} color="blue.500" />
                    <Heading size="md" bgGradient="linear(to-r, blue.400, blue.600)" bgClip="text">
                        {t('systemTitle')}
                    </Heading>
                </HStack>
                <Spacer />

                <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    mx={2}
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                >
                    {language === 'ar' ? 'English' : 'العربية'}
                </Button>

                {/* Navigation Links */}
                <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                    {navLinks.filter(l => l.show).map(link => (
                        <Button
                            key={link.href}
                            leftIcon={link.icon}
                            variant={router.pathname === link.href ? 'solid' : 'ghost'}
                            colorScheme={router.pathname === link.href ? 'blue' : 'gray'}
                            fontWeight="normal"
                            onClick={() => router.push(link.href, undefined, { shallow: true })}
                            _hover={{ bg: 'blue.50', color: 'blue.600' }}
                            size="sm"
                        >
                            {link.label}
                        </Button>
                    ))}
                </HStack>

                {/* User & Logout */}
                <HStack spacing={2} marginStart={4}>
                    {/* Notification Button */}
                    {onNotificationsOpen && (
                        <Tooltip label={t('notifications')} hasArrow>
                            <Button
                                onClick={onNotificationsOpen}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                                borderRadius="full"
                                leftIcon={<BellIcon />}
                                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                            >
                                {t('notifications')}
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip label={address || t('noAddress')} hasArrow>
                        <Avatar size="sm" name={address || 'User'} bg="blue.500" />
                    </Tooltip>
                    <Tooltip label={t('logout')} hasArrow>
                        <Button
                            leftIcon={<FaSignOutAlt />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            borderRadius="full"
                            onClick={handleLogout}
                            _hover={{ bg: 'red.50', color: 'red.600' }}
                        >
                            {t('logout')}
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navbar;