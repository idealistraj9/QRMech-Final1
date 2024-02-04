import { Admin } from '@/page-components/Admin/';
import Head from 'next/head';
import { useDevice } from './DeviceProvider';
const Admin1 = () => {
  const { deviceID } = useDevice();
  return (
    <>
      <Head>
        <title>Admin</title>
      </Head>
      <p>{deviceID}</p>
      <Admin deviceID={deviceID} />
    </>
  );
};

export default Admin1;
