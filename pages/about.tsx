import React from 'react';
import { Box, Badge, useMultiStyleConfig } from '@chakra-ui/react';


const AboutPage = () => {
    const styles = useMultiStyleConfig('ComingSoon');
    return (
        <Box sx={styles.container} cursor={'pointer'} onClick={() => window.history.back()}>
            Coming Soon ...
        </Box>
    );
};

export default AboutPage;
