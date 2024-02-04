// DeviceContext.js
import { createContext, useContext, useState } from 'react';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [deviceID, setDeviceID] = useState(null);

  return (
    <DeviceContext.Provider value={{ deviceID, setDeviceID }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  return useContext(DeviceContext);
};
