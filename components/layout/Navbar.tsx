import React from 'react';
import {
    Box, Flex, HStack, Heading, Icon, Button, Avatar, useColorModeValue, Tooltip, Spacer
} from '@chakra-ui/react';
import { FaUniversity, FaSignOutAlt, FaHome, FaThLarge } from 'react-icons/fa';
import { BellIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useAppData } from 'hooks/useAppData';

interface NavbarProps {
    onNotificationsOpen?: () => void;
}

const Navbar = ({ onNotificationsOpen }: NavbarProps) => {
    const router = useRouter();
    const { userRole, account: address } = useAppData();

    // أزرار التنقل حسب الدور
    const navLinks = [
        {
            label: 'الرئيسية | Home', icon: <FaHome />, href:
                userRole === 'admin' ? '/dashboard/admin'
                    : userRole === 'student' ? '/dashboard/student'
                        : userRole === 'employer' ? '/dashboard/employer'
                            : userRole === 'institution' ? '/dashboard/institution'
                                : '/', show: !!userRole
        },
        { label: 'المؤسسات المعتمدة', href: '/dashboard/admin/verifiedInstitutions', show: userRole === 'admin' },
        { label: 'قيد التحقق', href: '/dashboard/admin/pendingInstitutions', show: userRole === 'admin' },
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
                        نظام الشهادات اللامركزي
                    </Heading>
                </HStack>
                <Spacer />

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
                <HStack spacing={2} ml={4}>
                    {/* Notification Button */}
                    {onNotificationsOpen && (
                        <Tooltip label="الإشعارات | Notifications" hasArrow>
                            <Button
                                onClick={onNotificationsOpen}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                                borderRadius="full"
                                leftIcon={<BellIcon />}
                                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                            >
                                إشعارات
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip label={address || 'No address'} hasArrow>
                        <Avatar size="sm" name={address || 'User'} bg="blue.500" />
                    </Tooltip>
                    <Tooltip label="تسجيل الخروج | Logout" hasArrow>
                        <Button
                            leftIcon={<FaSignOutAlt />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            borderRadius="full"
                            onClick={handleLogout}
                            _hover={{ bg: 'red.50', color: 'red.600' }}
                        >
                            تسجيل الخروج | Logout
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navbar;