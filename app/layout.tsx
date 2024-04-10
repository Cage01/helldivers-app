import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar";
import { Providers } from "./providers";
import Footer from "./components/footer";
import { GoogleAnalytics } from '@next/third-parties/google'
//const inter = Inter({ subsets: ["latin"] });

// const TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID
// if (TRACKING_ID != undefined) {
//   ReactGA.initialize(TRACKING_ID);
// }



export const metadata: Metadata = {
  title: "Helldiver News",
  icons: {
    icon: '/images/news.svg',
  },
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (

    <html lang="en" className="dark">

      <body style={{ overflowX: "hidden" }}>
        <Providers>
          <link href='https://fonts.googleapis.com/css?family=Lato:300,400,700' rel='stylesheet' type='text/css' />
          <Navbar />
          {children}
          <GoogleAnalytics gaId="G-DZ06VJZ0J6" />
          <Footer />
        </Providers>
      </body>

    </html>

  );
}
