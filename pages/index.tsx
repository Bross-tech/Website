import Head from "next/head";
import Bundles from "../components/Bundles";
import CartWidget from "../components/CartWidget";
import WhatsAppSupport from "../components/WhatsAppSupport";

export default function Home() {
  return (
    <>
      <Head>
        <title>DATA STORE 4GH</title>
      </Head>
      <main style={{ padding: 20 }}>
        <h1>Welcome to DATA STORE 4GH 🇬🇭⚡</h1>
        <p>Your go-to platform for data services in Ghana!</p>

        <Bundles onAdd={(b) => (window as any).__addToCart?.(b)} />

        <CartWidget />
        <WhatsAppSupport />
      </main>
    </>
  );
}
