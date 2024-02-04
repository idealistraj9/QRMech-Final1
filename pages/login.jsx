import { Login } from '@/page-components/Auth';
import Head from 'next/head';


const LoginPage = () => {
  // const { deviceID } = useDevice();
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Login />
    </>
  );
};

export default LoginPage;
