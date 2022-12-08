import Layout from '@/components/Layout';
import '@/styles/3d/x3dom.css';
import '@/styles/globals.scss';
import { PrismicProvider } from '@prismicio/react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function CompleatApp({ Component, pageProps }) {
  const { data, error } = useSWR('/api/staticdata', fetcher);

  if (error) return <div>failed to load</div>;
  // TODO: Loading component with timing and state transitions for user
  if (!data) return <div>loading...</div>;

  if (data) {
    return (
      <PrismicProvider
        internalLinkComponent={({ href, ...props }) => (
          <Link href={href}>
            <a {...props} />
          </Link>
        )}
      >
        <AnimatePresence exitBeforeEnter>
          <Layout pages={data}>
            <Component {...pageProps} />
          </Layout>
        </AnimatePresence>
      </PrismicProvider>
    );
  }
}

export default CompleatApp;
