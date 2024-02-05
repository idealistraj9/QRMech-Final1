// Admin.jsx
import { useCurrentUser } from '@/lib/user';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const { data: { user } = {}, isValidating } = useCurrentUser();
  const [deviceData, setDeviceData] = useState([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState(null);

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

  // Function to group device data by deviceID
  const groupDeviceData = () => {
    const groupedData = {};

    // Group device data by deviceID
    deviceData.forEach((data) => {
      const { deviceID } = data;
      if (!groupedData[deviceID]) {
        groupedData[deviceID] = [];
      }
      groupedData[deviceID].push(data);
    });

    return groupedData;
  };

  // Function to handle deviceID click
  const handleDeviceIDClick = (deviceID) => {
    setSelectedDeviceID(deviceID === selectedDeviceID ? null : deviceID);
  };

  return (
    <>
      <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 xl:w-1/3 mx-auto justify-center text-center items-center self-center m-3 p-5">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
          Admin Page
        </h1>

        <div className="mt-4 w-11/12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            Devices
          </h2>
          <div className='bg-blue-400 rounded-md p-5 w-full'> 
            {Object.entries(groupDeviceData()).map(([deviceID, dataGroup]) => (
              <div key={deviceID} className="mb-4 flex justify-center flex-col">
                <button
                  onClick={() => handleDeviceIDClick(deviceID)}
                  className="text-lg md:text-xl lg:text-2xl font-bold mb-2 focus:outline-none"
                >
                  Device ID: {deviceID}
                </button>
                {selectedDeviceID === deviceID && (
                  <ul className="flex list-disc list-inside flex-col text-left">
                    {dataGroup.map((data) => (
                      <li
                        key={data._id}
                        className="mb-2 flex flex-col bg-slate-700 rounded-lg p-2"
                      >
                        <span className="ml-2 font-bold">Amount: {data.amount},</span>
                        <span className="ml-2 font-bold">
                          Credit Amount: {data.creditAmount}
                        </span>
                        <span className="ml-2 font-bold">
                          location: {data.location}
                        </span>
                        
                        <span className="ml-2 font-bold">
                          timestamp: {data.timestamp}
                        </span>
                        {/* Add other fields as needed */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
