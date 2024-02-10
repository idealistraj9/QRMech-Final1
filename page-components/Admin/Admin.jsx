// Admin.jsx
import { useCurrentUser } from '@/lib/user';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const Admin = () => {
  const { data: { user } = {}, isValidating } = useCurrentUser();
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    // Fetch device data from the server
    const fetchDeviceData = async () => {
      try {
        // Retrieve device data
        const deviceDataResponse = await axios.get('/api/getAllDeviceData');
        setDeviceData(deviceDataResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchDeviceData function
    fetchDeviceData();
  }, []); // Empty dependency array to fetch device data only once when the component mounts

  // Extract unique device IDs
  const uniqueDeviceIDs = [...new Set(deviceData.map((data) => data.deviceID))];

  return (
    <>
      <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 xl:w-1/3 mx-auto justify-center text-center items-center self-center m-3 p-5">
        <div className="mt-4 w-11/12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            Devices
          </h2>
          <div className="bg-blue-400 rounded-md p-5 w-full">
            {uniqueDeviceIDs.map((deviceID) => (
              <div key={deviceID} className="mb-4 flex justify-center flex-col">
                <Link href={`/admin/device/?deviceid=${deviceID}`}>
                  <a className="text-lg md:text-xl lg:text-2xl font-bold mb-2">
                    Device ID: {deviceID}
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
