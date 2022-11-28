import Layout from '@/components/Layout';
import '@/styles/globals.scss';
import useSWR from 'swr';
import { AnimatePresence } from 'framer-motion';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../prismicio';
import Link from 'next/link';
import '@/styles/3d/x3dom.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

function MyApp({ Component, pageProps }) {
  const { data, error } = useSWR('/api/staticdata', fetcher);

  if (error) return <div>failed to load</div>;
  // TODO: Component with timing and state transitions for user
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
            <PrismicPreview repositoryName={repositoryName}>
              <Component {...pageProps} />
            </PrismicPreview>
          </Layout>
        </AnimatePresence>
      </PrismicProvider>
    );
  }
}

export default MyApp;
