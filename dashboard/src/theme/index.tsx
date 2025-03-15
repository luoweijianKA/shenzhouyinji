import React, { useMemo } from 'react';
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme,
} from 'styled-components';
import { Text, TextProps } from 'rebass';
import { Colors } from './styled';

export * from './components';

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
};

const mediaWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css;
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  (accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `;
  return accumulator;
}, {}) as any;

const white = '#FFFFFF';
const black = '#000000';

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#ABAFC4' : '#151515',
    text2: darkMode ? '#C3C5CB' : '#565A69',
    text3: darkMode ? '#6C7284' : '#B5B8BF',
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#FFFFFF' : '#151515',
    text7: darkMode ? '#FEBF32' : '#FEBF32',
    text8: darkMode ? '#151515' : '#0D98B4',
    text9: darkMode ? '#ABAFC4' : '#151515',
    text10: darkMode ? '#C3C5CB' : '#565A69',

    // btn bg
    btnBg1: darkMode ? '#A734E9' : '#A734E9',
    btnBg2: darkMode ? '#E85B31' : '#E85B31',

    // backgrounds / greys
    bg1: darkMode ? '#073880' : '#FFFFFF',
    bg2: darkMode ? '#C1CADF' : '#F7F8FA',
    bg3: darkMode ? '#222531' : '#EDEEF2',
    bg4: darkMode ? '#ABAFC4' : '#CED0D9',
    bg5: darkMode ? '#212429' : '#F7F8FA',
    bg6: darkMode ? '#F9CA67' : '#E85B31',
    bg7: darkMode ? '#6C7284' : '#0C979C',
    bg8: darkMode ? '#E85B31' : '#E85B31',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#073880' : '#FEBF32',
    primary2: darkMode ? '#CF9852' : '#17171A',
    primary3: darkMode ? '#8094ae' : '#17171A',
    primary4: darkMode ? '#ABAFC4' : '#F6DDE8',
    primary5: darkMode ? '#153d6f70' : '#FDEAF1',
    primary6: darkMode ? '#40444F' : '#FEBF32',
    primary7: darkMode ? '#FEBF32' : '#17171A',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#E85B31',
    primaryText2: darkMode ? '#6da8ff' : '#06253B',

    // secondary colors
    secondary1: darkMode ? '#2172E5' : '#ff007a',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // other
    red1: '#FF0000',
    red2: '#F82D3A',
    red3: '#D60000',
    red4: '#FD4040',
    green1: '#198754',
    yellow1: '#FFE270',
    yellow2: '#FFFFFF',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    success: '#198754',
  };
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
    title: css`
      background: linear-gradient(91.26deg, #a9cdff 0%, #72f6d1 21.87%, #a0ed8d 55.73%, #fed365 81.77%, #faa49e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-family: Poppins;
      font-style: normal;
      font-weight: 300;
    `,
  };
}

export default function ThemeProvider({
  children,
}: {
  children: any;
}) {
  const darkMode = true;

  const themeObject = useMemo(() => theme(darkMode), [darkMode]);

  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {children}
    </StyledComponentsThemeProvider>
  );
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`;

export const IconWrapper = styled.img<{ size: string; margin?: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  margin: ${({ margin }) => margin ?? '0'};
`;

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />;
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />;
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />;
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />;
  },
  body(props: TextProps) {
    return (
      <TextWrapper fontWeight={400} fontSize={16} color={'primary1'} {...props} />
    );
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />;
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />;
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />;
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />;
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />;
  },
  italic(props: TextProps) {
    return (
      <TextWrapper
        fontWeight={500}
        fontSize={12}
        fontStyle={'italic'}
        color={'text2'}
        {...props}
      />
    );
  },
  error({ error, ...props }: { error?: boolean } & TextProps) {
    return (
      <TextWrapper
        fontWeight={500}
        color={error ? 'red1' : 'red1'}
        {...props}
      />
    );
  },
};

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: "DM Sans", sans-serif;
  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: "DM Sans", sans-serif;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  color: rgba(0,0,0,0.87) !important;
  font-weight: 400 !important;
  font-family: "DM Sans",sans-serif !important;
  font-size: 1rem;
  line-height: 1.5;
  background-color: rgb(250, 251, 251);
}

 a {
   color: ${colors(false).blue1}; 
 }

 p {
   margin: 0;
 }

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on', pnum' on, 'lnum';
  
}
`;

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
}

body {
  min-height: 100vh;
  background-position: 0 -30vh;
  background-repeat: no-repeat;
}
`;

export const EmptyProposals = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
