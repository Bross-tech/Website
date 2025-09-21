// components/Bundles.tsx
import { useCart } from "@/context/CartContext";

export type Bundle = {
  id: string;
  name: string;
  data: string;
  priceAgent: number;
  priceCustomer: number;
};

export default function Bundles({ role }: { role: "agent" | "customer" }) {
  const { addToCart } = useCart();

  const bundles: Bundle[] = [
    { id: "1", name: "MTN 1GB", data: "1GB", priceAgent: 4, priceCustomer: 5 },
    { id: "2", name: "MTN 2GB", data: "2GB", priceAgent: 9, priceCustomer: 10 },
    { id: "3", name: "MTN 3GB", data: "3GB", priceAgent: 14, priceCustomer: 15 },
    { id: "4", name: "MTN 4GB", data: "4GB", priceAgent: 19, priceCustomer: 20 },
  ];

  const handleAddToCart = (bundle: Bundle) => {
    const recipient = prompt("Enter recipient number (include country code)");
    if (!recipient) return;

    const price =
      role === "agent" ? bundle.priceAgent : bundle.priceCustomer;

    addToCart(bundle, price, recipient);
    alert("Added to cart!");
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {bundles.map((bundle) => {
        const price =
          role === "agent" ? bundle.priceAgent : bundle.priceCustomer;

        return (
          <div
            key={bundle.id}
            className="bg-white shadow-md p-4 rounded-lg text-center"
          >
            <h3 className="text-lg font-semibold">{bundle.name}</h3>
            <p className="text-gray-500">{bundle.data}</p>
            <p className="text-green-600 font-bold">GHS {price}</p>
            <button
              onClick={() => handleAddToCart(bundle)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Add to Cart
            </button>
          </div>
        );
      })}
    </div>
  );
}
