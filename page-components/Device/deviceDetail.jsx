import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const DeviceDetails = () => {
  const router = useRouter();
  const { deviceID } = router.query;
  const [deviceData, setDeviceData] = useState(null);

  useEffect(() => {
    // Fetch device data for the specific deviceID
    const fetchDeviceDetails = async () => {
      try {
        const response = await axios.get(`/api/getDeviceDetails?deviceID=${deviceID}`);
        setDeviceData(response.data);
      } catch (error) {
        console.error('Error fetching device details:', error);
      }
    };

    if (deviceID) {
      fetchDeviceDetails();
    }
  }, [deviceID]);

  if (!deviceData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Device Details - {deviceData.deviceID}</h1>
      <p>Amount: {deviceData.amount}</p>
      <p>Credit Amount: {deviceData.creditAmount}</p>
      <p>Location: {deviceData.location}</p>
      <p>Timestamp: {deviceData.timestamp}</p>
      {/* Add other fields as needed */}
    </div>
  );
};

export default DeviceDetails;
