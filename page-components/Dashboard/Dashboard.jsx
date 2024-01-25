import { Spacer, Wrapper } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';
import { useCurrentUser } from '@/lib/user';
import Popup from 'reactjs-popup';

const DashboardPage = () => {
  const { data: { user } = {}, isValidating } = useCurrentUser();
  const [cars, setCars] = useState([]);
  const Amount = useRef();
  const [imgURL, setImgURL] = useState('');
  const [moneyPaid, setmoneyPaid] = useState('');
  const [payment, setPayment] = useState('');
  const [paymentid, setPaymentid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  const [creditUpdated, setCreditUpdated] = useState('');
  var creditUpdated1 = '';
  const isWebBrowser = () => typeof window !== 'undefined';

  // Function to construct Payconiq universal URL for Android
  const constructPayconiqUniversalUrl = (paymentResponseData) => {
    const returnUrl = encodeURIComponent('http://localhost:3000/dashboard'); // Update this URL with your actual web page URL
    const deeplinkUrl = paymentResponseData._links.deeplink.href;
    console.log(deeplinkUrl);
    // Construct Payconiq universal URL for Android
    const universalUrl = `${deeplinkUrl}#Intent;scheme=payconiq;package=com.payconiq.mobile;S.browser_fallback_url=${returnUrl};end`;
    return universalUrl;
  };

  // Function to get payment details
  const getPaymentDetails = async (paymentId) => {
    const apiKey = 'fbae8c3f-c2b3-4d44-be7c-37147654ac5c';
    const apiUrl = `/api/paymentDetails?paymentId=${paymentId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      setPayment(response.data.status);
      console.log(response.data);

      if (
        response.data.status === 'SUCCEEDED' &&
        creditUpdated1 !== 'updated'
      ) {
        setMsg(
          'Payment successful! Do not close this window; you will be redirected soon.'
        );
        setmoneyPaid(response.data.transferAmount);
        try {
          await axios.post('/api/updateCredit', {
            name: user.username,
            amount: moneyPaid,
          });

          console.log('Credit updated');
          setCreditUpdated('updated');
          creditUpdated1 = 'updated';

          // Delay the page reload by 5 seconds
          setTimeout(() => {
            router.reload();
          }, 5000);
        } catch (error) {
          console.error('Error updating credit:', error.message);
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  };

  // Function to handle payment
  const handlePayment = async (e) => {
    e.preventDefault();
    const amt = Amount.current.value;

    try {
      // Step 1: Create a Payconiq payment
      const paymentData = {
        merchantId: '5e99a4841dffb500067c6d62',
        paymentProfileId: '5e99a48d1dffb500067c6d63',
        amount: amt,
        currency: 'EUR',
        reference: 'Test payment',
        description: '',
        callbackUrl: 'https://www.testcallback.com/payconiq/payment',
      };

      const paymentResponse = await axios.post('/api/payconiq', paymentData);

      // Step 2: Construct Payconiq universal URL
      const universalUrl = constructPayconiqUniversalUrl(paymentResponse.data);

      // Step 3: Open Payconiq application
      if (isWebBrowser()) {
        // If the user is on a web browser
        if (navigator.userAgent.match(/Android/i)) {
          // For Android devices, try to open the Payconiq app
          window.location.href = universalUrl;
        } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          // For iOS devices, attempt to open the Payconiq app
          window.location.href = universalUrl;
          // Note: Opening external apps on iOS may require additional user interaction
        } else {
          // For other devices, show the modal
          setShowModal(true);
          setImgURL(paymentResponse.data._links.qrcode.href);
        }
      } else {
        // If not on a web browser, assume it's a mobile device
        window.location.href = universalUrl;
      }

      // Set payment-related state variables
      setmoneyPaid(paymentResponse.data.amount);
      setPaymentid(paymentResponse.data.paymentId);
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  useEffect(() => {
    const checkCreditStatus = async () => {
      if (creditUpdated === 'updated') {
        // Credit was successfully updated, show success message
        setMsg(
          'Credit purchase successful! Your credit has been update shrotly.'
        );
      } else if (creditUpdated === 'failed') {
        // Credit update failed, show appropriate failure message
        setMsg('Credit purchase failed. Please try again.');
      }
    };

    checkCreditStatus();
  }, [creditUpdated]);

  useEffect(() => {
    if (!isValidating && !user) {
      router.replace('/login');
    }
  }, [isValidating, user]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (username) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/fetchUserData?username=${username}`
          );
          if (response.ok) {
            const userData = await response.json();
            setCars(userData);
          } else {
            throw new Error('Failed to fetch data');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [username]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (paymentid) {
        getPaymentDetails(paymentid);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentid]);

  // Function to handle MQTT button click
  const handleMQTTButtonClick = async (command) => {
    try {
      const deviceID = sessionStorage.getItem('deviceID');
      const userCredits = cars.credit;

      if (!deviceID) {
        console.error('Device ID not found in sessionStorage');
        return;
      }

      // Check if credits are zero and send stop command
      if (userCredits === 0 && command === 'start') {
        console.log('Zero credits. Sending stop command.');
        await sendStopCommand(deviceID);
        return;
      }

      // Send the command via MQTT
      const response = await axios.post('/api/mqtt', {
        deviceID: deviceID,
        Command: command,
      });

      if (response.data.success) {
        console.log(`${command} command sent successfully`);
      } else {
        console.error(`Failed to send ${command} command`);
      }
    } catch (error) {
      console.error(`Error handling ${command} button click:`, error.message);
    }
  };

  // Helper function to send stop command
  const sendStopCommand = async (deviceID) => {
    try {
      const response = await axios.post('/api/mqtt', {
        deviceID: deviceID,
        Command: 'stop',
      });

      if (response.data.success) {
        console.log('Stop command sent successfully');
      } else {
        console.error('Failed to send stop command');
      }
    } catch (error) {
      console.error('Error sending stop command:', error.message);
    }
  };

  return (
    <>
      <Wrapper className={styles.mainpage}>
        <Spacer size={2} axis="vertical" />
        {/* Car Details Section */}
        <div className={styles.carDetails}>
          <img src="/images/car.png" alt="" className={styles.img} />

          <h2 className={styles.title}>Car Details</h2>
          <p>Car name: {cars.carnickname}</p>
          <p>Car Model: {cars.carmodelname}</p>
          <p>License Plate: {cars.carnoplate}</p>
        </div>

        {/* Credit Balance Section */}
        <div className={styles.creditBalance}>
          <h2 className={styles.title}>Credit Balance</h2>
          <p style={{ fontSize: '24px' }}>{cars.credit} credits</p>
          <Button
            type="button"
            onClick={() => handleMQTTButtonClick('start')}
            className={styles.purchaseButton}
            size="large"
            disabled={Amount <= 0}
          >
            Charge!!
          </Button>
          <span></span>
          <Button
            type="button"
            onClick={() => handleMQTTButtonClick('stop')}
            className={styles.purchaseButton}
            size="large"
          >
            Stop
          </Button>
        </div>

        {/* Purchase Credits Section */}
        <div className={styles.purchaseCredits}>
          <h2 className={styles.title}>Purchase Credits</h2>
          <Input
            type="number"
            placeholder="Enter Amount"
            ariaLabel="Purchase Amount"
            size="large"
            ref={Amount}
          />

          <Spacer size={0.5} axis="vertical" />
          <Button
            type="button"
            onClick={handlePayment}
            className={styles.purchaseButton}
            size="large"
            disabled={Amount <= 0}
          >
            Purchase
          </Button>
          <p>{msg}</p>
        </div>
      </Wrapper>

      {/* Payment Modal */}
      <Popup open={showModal} onClose={() => setShowModal(false)} modal nested>
        {(close) => (
          <div className={styles.modal}>
            <button className={styles.close} onClick={close}>
              &times;
            </button>
            <div className={styles.content}>
              <img src={imgURL} alt="Loading..." className={styles.qr} />
              <div className={styles.popup}>
                <h4>
                  <b>Do not close or refresh the page between payment!</b>
                </h4>
                <h4>Scan from Payconiq app and enter pin.</h4>
              </div>
              <h3>Payment status: {payment}</h3>
              <h1>{msg}</h1>
            </div>
          </div>
        )}
      </Popup>
    </>
  );
};

export default DashboardPage;
