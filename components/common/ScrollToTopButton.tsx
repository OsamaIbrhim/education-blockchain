import React from 'react';
import {
  Box,
  IconButton,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpCircle } from 'react-icons/bs';

const MotionBox = motion(Box);

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

interface ScrollToTopButtonProps {
  showScrollTop: boolean;
  scrollToTop: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ showScrollTop, scrollToTop }) => {
  return (
    <AnimatePresence>
      {showScrollTop && (
        <MotionBox
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={99}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <IconButton
            aria-label="Scroll to top"
            icon={<BsArrowUpCircle />}
            onClick={scrollToTop}
            size="lg"
            colorScheme="blue"
            rounded="full"
            shadow="lg"
            _hover={{
              transform: "translateY(-2px)",
              shadow: "xl",
            }}
            sx={{
              animation: `${floatAnimation} 2s ease-in-out infinite`
            }}
          />
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
