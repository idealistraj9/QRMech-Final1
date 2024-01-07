import { ButtonLink } from '@/components/Button';
import { Container, Spacer, Wrapper } from '@/components/Layout';
import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = () => {
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
          QRMech is a platform that allows you to manage the charging of your vihecles.
        </p>
      </div>
    </Wrapper>
  );
};

export default Hero;
