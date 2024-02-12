import { ButtonLink } from '@/components/Button';
import { Container, Spacer, Wrapper } from '@/components/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import styles from './Hero.module.css';
import React from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const axiosSession = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Update with your API endpoint
  withCredentials: true,
});

const Hero = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = React.useState();
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [started, setstarted] = useState('');

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.deviceID) {
      // Set deviceID in session
      // axiosSession.post('/api/setDeviceID', { deviceID: params.deviceID });
      setDeviceID(params.deviceID);
      sessionStorage.setItem('deviceID', params.deviceID);
      // Set deviceID as a default header for all Axios requests
      axiosSession.defaults.headers.common['Device-ID'] = params.deviceID;
      console.log(params.deviceID)
    }
  }, [setDeviceID]);

  // Function to construct Payconiq universal URL for Android
  const constructPayconiqUniversalUrl = (paymentResponseData) => {
    const returnUrl = encodeURIComponent(window.location.href); // Update this URL with your actual web page URL
    const deeplinkUrl = paymentResponseData._links.deeplink.href;

    // Construct Payconiq universal URL for Android
    const universalUrl = `${deeplinkUrl}#Intent;scheme=payconiq;package=com.payconiq.mobile;S.browser_fallback_url=${returnUrl};end`;
    return universalUrl;
  };

  // Function to handle payment
  const handlePayment = async () => {
    try {
      // Step 1: Create a Payconiq payment
      const paymentData = {
        merchantId: process.env.PAYCONIQ_MERCHANT_ID,
        paymentProfileId: process.env.PAYCONIQ_PROFILE_ID,
        amount: amount,
        currency: 'EUR',
        reference: 'Test payment',
        description: '',
        callbackUrl: 'https://3ec6-2409-40c1-1011-8023-fdfd-5892-9ade-7317.ngrok-free.app',
      };

      const paymentResponse = await axios.post('/api/payconiq', paymentData);

      // Step 2: Construct Payconiq universal URL
      const universalUrl = constructPayconiqUniversalUrl(paymentResponse.data);

      // Step 3: Open Payconiq application
      if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone|iPad|iPod/i)
      ) {
        // For Android or iOS devices, try to open the Payconiq app
        window.location.href = universalUrl;
      } else {
        // Handle other devices or show a message to the user
        alert('Open the Payconiq app to complete the payment.');
      }

      // Set payment-related state variables
      setPaymentId(paymentResponse.data.paymentId);
      setShowModal(true);
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  // Function to get payment details
  const getPaymentDetails = async (paymentId) => {
    try {
      const response = await axios.get(
        `/api/paymentDetails?paymentId=${paymentId}`
      );
      setPaymentStatus(response.data.status);

      if (response.data.status === 'SUCCEEDED') {
        await axiosSession.post('/api/savePaymentToDatabase', {
          deviceID: deviceID,
          amount: amount,
          creditAmount: amount, // Update as needed based on your logic
        });
        console.log('Payment successful!');
        setstarted('charging Started !!!');
        // Perform any additional actions on successful payment
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  useEffect(() => {
    if (paymentId && showModal) {
      const intervalId = setInterval(() => {
        getPaymentDetails(paymentId);
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [paymentId, showModal]);

  return (
    <Wrapper>
      <div>
        <Spacer size={10} axis="vertical" />
        <h1 className={styles.title}>
          <span className={styles.nextjs}>QRMech</span>
        </h1>
        <Container justifyContent="center" className={styles.buttons}>
          <Container className="flex flex-col gap-3">
            <Link
              passHref
              href={{
                pathname: '/login',
                query: {
                  deviceId: `${deviceID}`,
                },
              }}
            >
              <ButtonLink className={styles.button}>
                <b>Get Started</b>
              </ButtonLink>
            </Link>
            <Spacer axis="horizontal" size={1} />
            {/* Popup with dropdown and pay button */}
            <Popup
              trigger={
                <ButtonLink
                  className="p-5 bg-blue-600 border-none"
                  onClick={handlePayment}
                >
                  <b>Pay With Payconiq</b>
                </ButtonLink>
              }
              modal
              closeOnDocumentClick
            >
              {(close) => (
                <div className="bg-blue-600 p-6 rounded-md shadow-md max-w-md mx-auto w-80">
                  <h2 className="text-2xl font-bold mb-4">Select Amount</h2>
                  <label htmlFor="amountDropdown" className="sr-only">
                    Select Amount
                  </label>
                  <select
                    id="amountDropdown"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                  >
                    <option value="" disabled defaultValue>
                      Please Select
                    </option>
                    <option value={100}>100 Euros</option>
                    <option value={200}>200 Euros</option>
                    <option value={300}>300 Euros</option>
                  </select>

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        handlePayment();
                        close();
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
                    >
                      Pay
                    </button>
                    <button
                      onClick={close}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </Popup>
          </Container>
          <Spacer size={8} axis="vertical" />
          <Spacer axis="horizontal" size={1} />
        </Container>
        <p className={styles.subtitle}>
          QRMech is a platform that allows you to manage the charging of your
          vehicles.
        </p>
      </div>

      {/* Payment Modal */}
      <Popup open={showModal} onClose={() => setShowModal(false)} modal nested>
        {(close) => (
          <div className="bg-blue-600 p-6 rounded-md shadow-md max-w-md mx-auto w-80">
            <button className={styles.close} onClick={close}>
              &times;
            </button>
            <div className={styles.content}>
              <h3>Payment status: {paymentStatus} </h3>
              <h3>{started} </h3>
            </div>
          </div>
        )}
      </Popup>
    </Wrapper>
  );
};

export default Hero;
