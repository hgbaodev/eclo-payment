import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider>
      {/* <MyProvider> */}
      <Toaster toastOptions={{
        className: 'toast',
        position: 'top-left',
      }} />
      <Component {...pageProps} />
      {/* </MyProvider> */}
    </ThirdwebProvider>
  );
}
