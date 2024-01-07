import '@/assets/base.css';
import { Layout } from '@/components/Layout';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './api/authContext.js';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Layout>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
        <Toaster />
      </Layout>
    </ThemeProvider>
  );
}
