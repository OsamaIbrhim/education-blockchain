import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  primary: {
    50: '#e3f2f9',
    100: '#c5e4f3',
    200: '#a2d4ec',
    300: '#7ac1e4',
    400: '#47a9da',
    500: '#0088cc',
    600: '#005f99',
    700: '#004f80',
    800: '#003f66',
    900: '#002f4d',
  },
  gray: {
    50: '#f9f9f9',
    900: '#1a202c',
  },
};

const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Roboto', sans-serif`,
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'lg',
      fontWeight: 'bold',
    },
    sizes: {
      lg: {
        h: '48px',
        fontSize: 'lg',
        px: '32px',
      },
    },
    variants: {
      solid: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
        },
      },
      outline: {
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.50',
        },
      },
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'gray.900',
      color: 'gray.100',
    },
    a: {
      color: 'primary.300',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
});

export default theme;
