import { Spacer, Wrapper } from '@/components/Layout';
import { Button } from '@/components/Button';
import { ButtonLink } from '@/components/Button/Button';
import { Input } from '@/components/Input';
import { TextLink } from '@/components/Text';
import { fetcher } from '@/lib/fetch';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import 'reactjs-popup/dist/index.css';
import styles from './Dashboard.module.css';
import { useCurrentUser } from '@/lib/user';
import Popup from 'reactjs-popup';
import { useAuth } from '../../pages/api/authContext';

const DashboardPage = () => {
  const { data: { user } = {}, mutate, isValidating } = useCurrentUser();
  const [cars, setCars] = useState([]);
  const Amount = useRef();
  const [imgURL, setImgURL] = useState('');
  const [payment, setPayment] = useState('');
  const [paymentid, setPaymentid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [username, setUsername] = useState('');
  const { data } = useCurrentUser();
  const router = useRouter();
  const axios = require('axios');
  const { isAuthenticated, loading } = useAuth();

  const initiatePayment = async (amt, des) => {
    const paymentData = {
      merchantId: '5e99a4841dffb500067c6d62',
      paymentProfileId: '5e99a48d1dffb500067c6d63',
      amount: amt,
      currency: 'EUR',
      reference: 'Test payment',
      description: '',
      callbackUrl: 'https://www.testcallback.com/payconiq/payment',
    };

    try {
      const response = await axios.post('/api/payconiq', paymentData);
      setImgURL(response.data._links.qrcode.href);
      // console.log('Payment initiated:', response.data);
      setPaymentid(response.data.paymentId);
      // console.log(paymentid);
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  const getPaymentDetails = async (paymentId) => {
    const apiKey = 'fbae8c3f-c2b3-4d44-be7c-37147654ac5c'; // Replace with your actual API key
    const apiUrl = `/api/paymentDetails?paymentId=${paymentId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      setPayment(response.data.status);
      // console.log('Payment details:', response.data.status);
      if (response.data.status === 'SUCCEEDED') {
        setMsg('payment successful!');
        // toast.success('payment successful!');
      }
      return response.data.status; // Return payment details
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const amt = Amount.current.value;
    const des = '.'; // Access .current.value directly
    try {
      const response = await initiatePayment(amt, des);
      setShowModal(true); // Display modal with QR code
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  //---------------------------
  const handleMQTTButtonClick = async (e) => {
    // e.preventDefault();
    try {
      const response = await axios.post('/api/mqtt', {
        message: 'Low credit alert',
      });
      if (response.data.success) {
        // Handle successful MQTT message sent
        console.log('MQTT message sent successfully');
      } else {
        // Handle failure to send MQTT message
        console.error('Failed to send MQTT message');
      }
    } catch (error) {
      // Handle API call error
      console.error('Error sending MQTT message:', error);
    }
  };
  //-----------------------------
  useEffect(() => {
    // Client-side check to avoid triggering during SSR
    if (!isValidating) {
      if (!user) {
        router.replace('/login');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isValidating]);

  useEffect(() => {
    if (data && data.user) {
      setUsername(data.user.username);
    }
  }, [data]);
  
  useEffect(() => {
    fetchAndUpdatePaymentStatus();
    const interval = setInterval(() => {
      fetchAndUpdatePaymentStatus();
    }, 5000);
    if (paymentid) {
      getPaymentDetails(paymentid);
    }
    return () => clearInterval(interval);
  }, [paymentid]);

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
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
      }
    };
    fetchData();
  }, [username]);
  console.log(cars.credit);
  if (cars.credit < 500) {
    handleMQTTButtonClick();
  }
  const fetchAndUpdatePaymentStatus = async () => {
    if (paymentid) {
      try {
        const status = await getPaymentDetails(paymentid);
        setPayment(status);
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    }
  };
  return (
    <>
      <Wrapper className={styles.mainpage}>
        <Spacer size={2} axis="vertical" />
        <div className={styles.carDetails}>
          <img
            src="/images/bike.png"
            alt=""
            height={'250px'}
            className={styles.img}
          />
          <h2 className={styles.title}>Car Details</h2>
          <p>Car name: {cars.carnickname}</p>
          <p>car Model: {cars.carmodelname}</p>
          <p>License Plate: {cars.carnoplate}</p>
        </div>

        {/* Credit Balance Section */}
        <div className={styles.creditBalance}>
          <h2 className={styles.title}>Credit Balance</h2>
          <p style={{ fontSize: '24px' }}>{cars.credit} credits</p>
        </div>

        {/* Purchase Credits Section */}
        <div className={styles.purchaseCredits}>
          <h2 className={styles.title}>Purchase Credits</h2>
          <Input
            type="number"
            // value={handlePayment}
            onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
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
        </div>
      </Wrapper>
      {/* <img src={imgURL} alt="Payment QR Code" />
      {payment} */}

      <Popup open={showModal} onClose={() => setShowModal(false)} modal nested>
        {(close) => (
          <div className={styles.modal}>
            <button className={styles.close} onClick={close}>
              &times;
            </button>
            <div className={styles.content}>
              <img src={imgURL} alt="Payment QR Code" className={styles.qr} />
              <div className={styles.popup}>
                <h4>
                  <b>do not close or refresh the page between payment!</b>
                </h4>
                <h4>scan from payconiq app and enter pin.</h4>
              </div>
              <h3>payment status : {payment}</h3>
              {/* Display the QR code here */}
              <h1>{msg}</h1>
            </div>
          </div>
        )}
      </Popup>
    </>
  );
};

export default DashboardPage;
