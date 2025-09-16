import Head from "next/head";
import Bundles from "../components/Bundles";
import Cart from "../components/Cart";
import WhatsAppSupport from "../components/WhatsAppSupport";

export default function BundlesPage(){
  return (
    <>
      <Head><title>Bundles — DataStore4gh</title></Head>
      <div className="container">
        <div className="top-row">
          <h1>Bundles</h1>
        </div>

        <Bundles />
        <Cart />
        <WhatsAppSupport />
      </div>
    </>
  );
}
