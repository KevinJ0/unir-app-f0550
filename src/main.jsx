import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as StyletronProvider } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { StyleReset, ThemeProvider } from 'atomize';
import App from './App';

const engine = new Styletron();

const theme = {
  colors: {
    brandPrimary: '#2563EB',
    brandDark: '#0F172A',
    brandSurface: '#FFFFFF',
    brandLight: '#F8FAFC',
    success700: '#047857',
    warning700: '#B45309',
    danger700: '#B91C1C',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
  },
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  textSize: {
    size: {
      hero: '32px',
      heading: '24px',
      subheading: '18px',
      body: '14px',
      caption: '12px',
    },
  },
  rounded: {
    card: '12px',
    pill: '9999px',
    button: '8px',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyletronProvider value={engine}>
      <ThemeProvider theme={theme}>
        <StyleReset />
        <App />
      </ThemeProvider>
    </StyletronProvider>
  </React.StrictMode>
);
