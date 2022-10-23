import Layout from '@/components/Layout';
import '@/styles/globals.scss';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function MyApp({ Component, pageProps }) {
  const { data, error } = useSWR('/api/staticdata', fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  if (data) {
    return (
      <Layout pages={data}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}

export default MyApp;
