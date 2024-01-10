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
  var creditUpdated1 = ''


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
      setmoneyPaid(response.data.amount);
      setPaymentid(response.data.paymentId);
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

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
      console.log(response.data)
      if (response.data.status === 'SUCCEEDED' && creditUpdated1 != "updated") {
        setMsg('payment successful!');
        try {
          await axios.post('/api/updateCredit', {
            name: user.username,
            amount: moneyPaid,
          });
          console.log('Credit updated');
          setCreditUpdated("updated");
          creditUpdated1 = 'updated';
          router.reload(); // Set the flag to true after credit update
          // console.log(creditUpdated);
        } catch (error) {
          console.error('Error updating credit:', error.message);
        }

      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
    // console.log("hi")
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const amt = Amount.current.value;
    const des = '.';
    try {
      await initiatePayment(amt, des);
      setShowModal(true);
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

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

  useEffect(() => {
    if (cars.credit < 500) {
      handleMQTTButtonClick();
    }
  }, [cars.credit]);

  const handleMQTTButtonClick = async () => {
    try {
      const response = await axios.post('/api/mqtt', {
        message: 'Low credit alert',
      });
      if (response.data.success) {
        console.log('MQTT message sent successfully');
      } else {
        console.error('Failed to send MQTT message');
      }
    } catch (error) {
      console.error('Error sending MQTT message:', error);
    }
  };

  return (
    <>
      <Wrapper className={styles.mainpage}>
        <Spacer size={2} axis="vertical" />
        <div className={styles.carDetails}>
          <img
            src="/images/car.png"
            alt=""
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
            onChange={(e) => setmoneyPaid(parseInt(e.target.value))}
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
