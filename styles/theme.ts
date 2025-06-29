import { extendTheme, type ThemeConfig, createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const fadeIn = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

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
  yellow: {
    100: '#FFFBEB',
    900: '#744210',
  },
  blue: {
    100: '#EBF8FF',
    900: '#1A365D',
  },
  red: {
    100: '#FFF5F5',
    500: '#E53E3E',
    800: '#9B2C2C',
  },
  gray: {
    50: '#f9f9f9',
    100: '#f0f0f0',
    200: '#e0e0e0',
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
  Card: {
    variants: {
      login: {
        container: {
          bg: 'yellow.100',
          color: 'yellow.900',
          p: 4,
          borderRadius: 'md',
        },
      },
      register: {
        container: {
          bg: 'blue.100',
          color: 'blue.900',
          p: 4,
          borderRadius: 'md',
        },
      },
      error: {
        container: {
          bg: 'red.100',
          color: 'red.800',
          p: 4,
          borderRadius: 'md',
        },
      },
    },
  },
  // The old VisitorNavbar style is removed from here.
};

// --- START: VisitorNavbar Multipart Style Definition ---

// 1. Define the parts for the VisitorNavbar
const visitorNavbarParts = [
  'container',
  'logo',
  'navLink',
  'langButton',
  'authButton',
];

// 2. Create the helpers for the VisitorNavbar
const {
  definePartsStyle: defineVisitorNavbarPartsStyle,
  defineMultiStyleConfig: defineVisitorNavbarMultiStyleConfig,
} = createMultiStyleConfigHelpers(visitorNavbarParts);

// 3. Define the base style for the VisitorNavbar
const visitorNavbarBaseStyle = defineVisitorNavbarPartsStyle({
  container: {
    bg: 'gray.800',
    color: 'white',
    px: 4,
  },
  navLink: {
    fontWeight: 'medium',
    _hover: {
      textDecoration: 'none',
      color: 'primary.300',
    },
  },
  langButton: {
    variant: 'ghost',
    mr: 4,
    _hover: {
      bg: 'gray.700',
    },
  },
  authButton: {
    colorScheme: 'teal',
    size: 'sm',
  },
});

// 4. Export the VisitorNavbar theme configuration
export const visitorNavbarTheme = defineVisitorNavbarMultiStyleConfig({
  baseStyle: visitorNavbarBaseStyle,
});

// --- END: VisitorNavbar Multipart Style Definition ---


// Define parts for the multipart component
const loginPageParts = [
  'container',
  'header',
  'connectButton',
  'switchButton',
  'loginBox',
  'registerBox',
  'errorBox',
  'errorText',
  'actionButton',
  'roleSelect',
];

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(loginPageParts);

const loginPageBaseStyle = definePartsStyle({
  container: {
    maxW: 'container.sm',
    py: 8,
  },
  header: {
    textAlign: 'center',
  },
  connectButton: {
    colorScheme: 'blue',
    width: 'full',
  },
  switchButton: {
    colorScheme: 'orange',
    width: 'full',
  },
  loginBox: {
    bg: 'blackAlpha.100',
    p: 4,
    borderRadius: 'md',
    width: 'full',
  },
  registerBox: {
    bg: 'blackAlpha.100',
    p: 4,
    borderRadius: 'md',
    width: 'full',
  },
  errorBox: {
    bg: 'red.100',
    p: 4,
    borderRadius: 'md',
    width: 'full',
  },
  errorText: {
    color: 'red.500',
  },
  actionButton: {
    colorScheme: 'green',
    width: 'full',
  },
  roleSelect: {
    mb: 4,
  },
});

export const loginPageTheme = defineMultiStyleConfig({ baseStyle: loginPageBaseStyle });

// --- START: CoursePage Multipart Style Definition ---

const coursePageParts = [
  'container',
  'card',
  'departmentButton',
  'courseItem',
  'welcomeMessage',
  'mainGrid'
];

const { definePartsStyle: defineCoursePagePartsStyle, defineMultiStyleConfig: defineCoursePageMultiStyleConfig } = createMultiStyleConfigHelpers(coursePageParts);

const coursePageBaseStyle = defineCoursePagePartsStyle((props) => ({
  container: {
    minH: "100vh",
    bg: mode('gray.50', 'gray.900')(props),
  },
  mainGrid: {
    templateColumns: 'repeat(12, 1fr)',
    gap: 4,
  },
  card: {
    bg: mode('white', 'gray.800')(props),
    borderRadius: "xl",
    shadow: "xl",
    borderWidth: "1px",
    borderColor: mode('gray.200', 'gray.700')(props),
    p: 6,
  },
  departmentButton: {
    justifyContent: 'flex-start',
  },
  courseItem: {
    p: 4,
    borderWidth: "1px",
    borderRadius: "md",
    borderColor: mode('gray.200', 'gray.700')(props),
  },
  welcomeMessage: {
    textAlign: 'center',
    py: 20,
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.1,
    width: '300px',
    height: '300px',
    backgroundImage: "url('/menofia-logo.png')",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    zIndex: 0,
  },
}));

export const coursePageTheme = defineCoursePageMultiStyleConfig({
  baseStyle: coursePageBaseStyle,
});

// --- END: CoursePage Multipart Style Definition ---

const styles = {
  global: {
    body: {
      bg: 'gray.900',
      color: 'white',
      animation: `0.5s ${fadeIn} ease-in-out`,
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
  components: {
    ...components,
    LoginPage: loginPageTheme,
    VisitorNavbar: visitorNavbarTheme, // Add the new VisitorNavbar theme
    CoursePage: coursePageTheme,
  },
  styles,
});

export default theme;

