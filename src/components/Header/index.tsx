import Link from 'next/link';
import Head from 'next/head';

import { IHeader } from './@interfaces';
import styles from './header.module.scss';

export default function Header({ pageTitle }: IHeader) {
  return (
    <header className={styles.headerContainer}>
      <Head>
        <title>{pageTitle} | spacetraveling</title>
      </Head>

      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
