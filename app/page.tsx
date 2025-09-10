import Image from "next/image";

export default function Home() {
  const plans = [
    { name: "Daily Plan", price: "GHS 1", data: "50MB", validity: "1 day" },
    { name: "Weekly Plan", price: "GHS 5", data: "500MB", validity: "7 days" },
    { name: "Monthly Plan", price: "GHS 20", data: "3GB", validity: "30 days" },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <h2 className="text-4xl font-bold text-blue-800 text-center">
        Welcome to DATA BUNDLES 4GH 🇬🇭
      </h2>
      <p className="text-gray-700 text-center max-w-md">
        Buy and manage your mobile data bundles quickly and securely in Ghana.
      </p>

      {/* Data Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="border border-gray-200 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{plan.name}</h3>
            <p className="text-gray-800 mb-1">{plan.data}</p>
            <p className="text-gray-600 mb-3">{plan.validity}</p>
            <p className="text-2xl font-bold text-green-600 mb-4">{plan.price}</p>
            <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition">
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Optional Image */}
      <Image
        src="/data-bundle.png" // your image in /public
        alt="Data Bundles"
        width={300}
        height={300}
        className="mt-8"
      />
    </div>
  );
}
