import '@/assets/base.css';
import { Layout } from '@/components/Layout';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './api/authContext.js';
import { DeviceProvider } from './DeviceProvider.jsx';
import './globals.css';
export default function MyApp({ Component, pageProps }) {
  return (
    <DeviceProvider>
      <ThemeProvider>
        <Layout>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
          <Toaster />
        </Layout>
      </ThemeProvider>
    </DeviceProvider>
  );
}
