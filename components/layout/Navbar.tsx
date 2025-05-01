import React from 'react';
import {
    Box,
    Flex,
    HStack,
    Heading,
    Icon,
    InputGroup,
    InputLeftElement,
    Input,
    IconButton,
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Avatar,
    useColorModeValue,
    Portal,
    Badge,
    ScaleFade,
    useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUniversity, FaSearch, FaQuestionCircle, FaCog, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';

const MotionFlex = motion(Flex);

interface NavbarProps {
    address?: string;
    exams?: any[];
    onNotificationsOpen?: () => void;
    pageName?: string;
}

const Navbar = ({ address, exams = [], onNotificationsOpen, pageName = 'لوحة تحكم | Dashboard' }: NavbarProps) => {
    const router = useRouter();
    const glassHeaderBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
    const glassHeaderHoverBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const searchBg = useColorModeValue('gray.100', 'gray.700');
    const searchHoverBg = useColorModeValue('gray.200', 'gray.600');
    const menuListBg = useColorModeValue('white', 'gray.800');

    const handleProfile = () => {
        router.push('/dashboard/institution/profile');
    };

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <Box
            bg={glassHeaderBg}
            backdropFilter="blur(10px) saturate(180%)"
            py={4}
            px={8}
            position="sticky"
            top={0}
            zIndex={10}
            borderBottom="1px"
            borderColor={borderColor}
            transition="all 0.3s ease"
            _hover={{
                bg: glassHeaderHoverBg
            }}
        >
            <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
                <MotionFlex
                    spacing={8}
                    align="center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Heading
                        size="lg"
                        bgGradient="linear(to-r, blue.400, blue.600)"
                        bgClip="text"
                        display="flex"
                        alignItems="center"
                        cursor="pointer"
                        onClick={() => router.push('/dashboard/institution')}
                        _hover={{ transform: 'scale(1.02)' }}
                        transition="all 0.2s"
                    >
                        <Icon as={FaUniversity} mr={3} />
                        {pageName}
                    </Heading>
                </MotionFlex>

                <HStack spacing={6}>
                    {/* Search Bar */}
                    <InputGroup
                        maxW="300px"
                        display={{ base: 'none', md: 'flex' }}
                        transition="all 0.3s"
                        _hover={{ transform: 'translateY(-1px)' }}
                    >
                        <InputLeftElement>
                            <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="بحث... | Search..."
                            variant="filled"
                            bg={searchBg}
                            _hover={{ bg: searchHoverBg }}
                            borderRadius="full"
                        />
                    </InputGroup>

                    {/* Quick Actions */}
                    <HStack spacing={4}>
                        {/* Help */}
                        <Tooltip label="المساعدة | Help" hasArrow>
                            <IconButton
                                aria-label="Help"
                                icon={<FaQuestionCircle />}
                                variant="ghost"
                                colorScheme="blue"
                                _hover={{ bg: 'blue.50', color: 'blue.500' }}
                            />
                        </Tooltip>

                        {/* Settings */}
                        <Tooltip label="الإعدادات | Settings" hasArrow>
                            <IconButton
                                aria-label="Settings"
                                icon={<FaCog />}
                                variant="ghost"
                                _hover={{ bg: 'purple.50', color: 'purple.500' }}
                            />
                        </Tooltip>

                        {/* Notifications */}
                        <Tooltip label="الإشعارات | Notifications" hasArrow>
                            <IconButton
                                aria-label="Notifications"
                                icon={<FaBell />}
                                variant="ghost"
                                position="relative"
                                onClick={onNotificationsOpen}
                                _hover={{ bg: 'orange.50', color: 'orange.500' }}
                            >
                                {exams?.filter(exam => exam.status === 'pending')?.length > 0 && (
                                    <ScaleFade in={true}>
                                        <Badge
                                            colorScheme="red"
                                            variant="solid"
                                            borderRadius="full"
                                            position="absolute"
                                            top="-2px"
                                            right="-2px"
                                            fontSize="xs"
                                            transform="scale(0.8)"
                                        >
                                            {exams.filter(exam => exam.status === 'pending').length}
                                        </Badge>
                                    </ScaleFade>
                                )}
                            </IconButton>
                        </Tooltip>

                        {/* Profile Menu */}
                        <Menu>
                            <Tooltip label="الملف الشخصي | Profile" hasArrow>
                                <MenuButton
                                    as={Button}
                                    rounded="full"
                                    variant="link"
                                    cursor="pointer"
                                    minW={0}
                                    _hover={{ transform: 'scale(1.05)' }}
                                    transition="all 0.2s"
                                >
                                    <Avatar
                                        size="sm"
                                        name={address || 'User'}
                                        bg="blue.500"
                                    />
                                </MenuButton>
                            </Tooltip>
                            <Portal>
                                <MenuList
                                    shadow="xl"
                                    border="1px"
                                    borderColor={borderColor}
                                    bg={menuListBg}
                                    p={2}
                                >
                                    {/* Dashboard */}
                                    <MenuItem
                                        icon={<FaUniversity />}
                                        _hover={{ bg: 'blue.50', color: 'blue.500' }}
                                        onClick={() => router.push('/dashboard/institution')}
                                        borderRadius="md"
                                        mb={1}
                                    >
                                        لوحة التحكم | Dashboard
                                    </MenuItem>
                                    {/* Profile */}
                                    <MenuItem
                                        icon={<FaUser />}
                                        _hover={{ bg: 'blue.50', color: 'blue.500' }}
                                        onClick={handleProfile}
                                        borderRadius="md"
                                        mb={1}
                                    >
                                        الملف الشخصي | Profile
                                    </MenuItem>
                                    {/* Logout */}
                                    <MenuItem
                                        icon={<FaSignOutAlt />}
                                        onClick={handleLogout}
                                        _hover={{ bg: 'red.50', color: 'red.500' }}
                                        borderRadius="md"
                                    >
                                        تسجيل الخروج | Logout
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </HStack>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navbar; 