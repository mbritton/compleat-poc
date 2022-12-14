import Document, { Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
  render() {
    return (
      <Html>
        <Head>
          <script
            async
            defer
            src="https://static.cdn.prismic.io/prismic.js?new=true&repo=compleat"
          ></script>
          <link
            href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,600;1,500&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,500&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,500&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
          <script>X3DOM_SECURITY_OFF = true;</script>
          <script async src="http://www.x3dom.org/release/x3dom.js"></script>
          <link
            rel="stylesheet"
            href="https://prismic-io.s3.amazonaws.com/compleat/17f5a7fd-4671-4306-8a62-24a5ca2d13ec_x3dom.css"
          ></link>
          {/* <script
            src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.147.0/three.js"
            integrity="sha512-yewcaF6iD3IU62N4N33Y8C7Zo3jx50MUaEMII/kQAdWnLdw4f3rab2Ay9Xp4O6waXDZhx7i/nvm+qGuJhXF+uw=="
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
          ></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
