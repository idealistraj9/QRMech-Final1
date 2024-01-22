import { ButtonLink } from '@/components/Button';
import { Container, Spacer, Wrapper } from '@/components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Hero.module.css';
import React from 'react';
import { onMount } from 'svelte';

const Hero = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = React.useState();

  React.useEffect(() => {
    // Get the deviceID from the URL query parameters
    const { deviceID } = router.query;

    // Update the state and sessionStorage with the new deviceID
    setDeviceID(deviceID);
    sessionStorage.setItem('deviceID', deviceID );

    // Do something with the deviceID if needed
    console.log('Device ID:', deviceID);
  }, [router.query]);

  return (
    <Wrapper>
      <div>
        <Spacer size={10} axis="vertical" />
        <h1 className={styles.title}>
          <span className={styles.nextjs}>QRMech</span>
        </h1>
        <Container justifyContent="center" className={styles.buttons}>
          <Container>
            <Link passHref href="/login">
              <ButtonLink className={styles.button}>Get Started</ButtonLink>
            </Link>
          </Container>
          <Spacer size={8} axis="vertical" />
          <Spacer axis="horizontal" size={1} />
        </Container>
        <p className={styles.subtitle}>
          QRMech is a platform that allows you to manage the charging of your
          vehicles.
        </p>
      </div>
    </Wrapper>
  );
};

export default Hero;
