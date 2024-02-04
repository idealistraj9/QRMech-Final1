// Admin.jsx
import { useCurrentUser } from '@/lib/user';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const { data: { user } = {}, isValidating } = useCurrentUser();
  const [deviceID, setDeviceID] = useState('');
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    // Fetch deviceID from the server
    const fetchDeviceID = async () => {
      try {
        // Retrieve deviceID from session
        const response = await axios.get('/api/getDeviceID');
        setDeviceID(response.data.deviceID);

        // Fetch device data from the server
        const deviceDataResponse = await axios.get('/api/getAllDeviceData');
        setDeviceData(deviceDataResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchDeviceID function
    fetchDeviceID();
  }, []); // Empty dependency array to fetch the deviceID only once when the component mounts

  return (
    <>
      <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 xl:w-1/3 mx-auto justify-center text-center items-center self-center m-3 p-5">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
          Admin Page
        </h1>
        

        <div className="mt-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            Device Data:
          </h2>
          <ul className="list-disc list-inside">
            {deviceData.map((data) => (
              <li key={data._id} className="mb-2 flex flex-col bg-slate-700 rounded-lg p-2">
                <span className="font-bold">Device ID: {data.deviceID}</span> 
                <span className="ml-2 font-bold">Amount: {data.amount},</span> 
                <span className="ml-2 font-bold">Credit Amount: {data.creditAmount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Admin;
