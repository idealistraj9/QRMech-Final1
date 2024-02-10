import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const DeviceDetails = () => {
  const router = useRouter();
  const { deviceid } = router.query;
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        console.log('Fetching device details for deviceid:', deviceid);
        const response = await axios.get(
          `/api/getDeviceDetails?deviceid=${deviceid}`
        );
        console.log('API response:', response.data);
        setDeviceData(response.data);
      } catch (error) {
        console.error('Error fetching device details:', error);
      }
    };

    if (deviceid) {
      fetchDeviceDetails();
    }
  }, [deviceid]);

  if (!deviceData || deviceData.length === 0) {
    return <p>No device details found for the given ID.</p>;
  }

  return (
    <div className="mx-auto p-4 w-11/12">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Device Details - {deviceData[0].deviceID}
      </h1>
      <div className="bg-blue-600 p-4 rounded-lg overflow-auto text-center">
        <table className="w-full ">
          <thead>
            <tr className="text-white ">
              <th className="w-1/4 py-2">Amount</th>
              <th className="w-1/4 py-2">Credit Amount</th>
              <th className="w-1/4 py-2">Location</th>
              <th className="w-1/4 py-2">Timestamp</th>
              {/* Add other fields as needed */}
            </tr>
          </thead>
          <tbody >
            {deviceData.map((device, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'}
              >
                <td className="py-2">{device.amount}</td>
                <td className="py-2">{device.creditAmount}</td>
                <td className="py-2">{device.location}</td>
                <td className="py-2">{device.timestamp}</td>
                {/* Add other fields as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceDetails;
