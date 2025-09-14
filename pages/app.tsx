import { useState } from "react";

export default function App() {
  const [bundleLoading, setBundleLoading] = useState<string | null>(null);

  const bundles = [
    { name: "Basic", price: 10 },
    { name: "Standard", price: 20 },
    { name: "Premium", price: 30 },
  ];

  const handlePayment = async (bundle: { name: string; price: number }) => {
    try {
      setBundleLoading(bundle.name);

      // Example call to your verifyPayment API
      const response = await fetch("/api/verifyPayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId: "12345", bundle }),
      });

      const data = await response.json();
      console.log("Payment Response:", data);
      alert(`Payment status: ${data.status || "Unknown"}`);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setBundleLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Select a Bundle</h1>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {bundles.map((bundle, index) => (
          <button
            key={index}
            onClick={() => handlePayment(bundle)}
            className="w-full bg-blue-500 text-white p-3 rounded-lg shadow hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
            disabled={!!bundleLoading}
          >
            {bundleLoading === bundle.name ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              `${bundle.name} – GHS ${bundle.price}`
            )}
          </button>
        ))}
      </div>
    </div>
  );
}customer");
                      setWalletBalance(walletRes.data?.balance ?? 0);
                      setPurchases(purchasesRes.data ?? []);
                    } catch (err) {
                      console.error("Failed to refresh user data:", err);
                    }

                    alert(`Deposited GHS ${newBalance} successfully!`);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade to Agent */}
      {role !== "agent" && (
        <UpgradeToAgent
          user={user}
          walletBalance={walletBalance}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Bundles */}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">
          Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})
        </h2>
        {currentPrices.bundles.map((bundle) => (
          <button
            key={bundle.name}
            onClick={() => handleBundlePurchase(bundle)}
            className="w-full bg-blue-500 text-white p-2 rounded mb-2"
            disabled={bundleLoading}
          >
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>

      {/* Agent-only components */}
      {role === "agent" && (
        <>
          <AgentReferral agent={user} />
          <BulkBundlePurchase
            agent={user}
            walletBalance={walletBalance}
            bundlePrice={currentPrices.bundles[0].price}
          />
          <AgentEarnings agent={user} />
          <AgentAnnouncements agent={user} />
          <AgentProfile agent={user} />
        </>
      )}

      {/* Purchase History */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p: any) => (
            <li key={p.id}>
              {p.network} - {p.bundle} - GHS {p.price.toFixed(2)} -{" "}
              {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <PurchaseAnalytics user={user} />
      <SupportTickets user={user} />
      <PromoCodeRedeem user={user} />
      <WhatsAppWidget />

      {/* AFA Registration */}
      <button
        onClick={handleAfaRegister}
        className="w-full bg-purple-600 text-white p-2 rounded mb-2"
        disabled={afaLoading}
      >
        Register AFA (Price: GHS {currentPrices.afa})
      </button>
    </div>
  );
      }customer");
                      setWalletBalance(walletRes.data?.balance ?? 0);
                      setPurchases(purchasesRes.data ?? []);
                    } catch (err) {
                      console.error("Failed to refresh user data:", err);
                    }

                    alert(`Deposited GHS ${newBalance} successfully!`);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade to Agent */}
      {role !== "agent" && (
        <UpgradeToAgent
          user={user}
          walletBalance={walletBalance}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Bundles */}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">
          Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})
        </h2>
        {currentPrices.bundles.map((bundle) => (
          <button
            key={bundle.name}
            onClick={() => handleBundlePurchase(bundle)}
            className="w-full bg-blue-500 text-white p-2 rounded mb-2"
            disabled={bundleLoading}
          >
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>

      {/* Agent-only components */}
      {role === "agent" && (
        <>
          <AgentReferral agent={user} />
          <BulkBundlePurchase
            agent={user}
            walletBalance={walletBalance}
            bundlePrice={currentPrices.bundles[0].price}
          />
          <AgentEarnings agent={user} />
          <AgentAnnouncements agent={user} />
          <AgentProfile agent={user} />
        </>
      )}

      {/* Purchase History */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p: any) => (
            <li key={p.id}>
              {p.network} - {p.bundle} - GHS {p.price.toFixed(2)} -{" "}
              {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <PurchaseAnalytics user={user} />
      <SupportTickets user={user} />
      <PromoCodeRedeem user={user} />
      <WhatsAppWidget />

      {/* AFA Registration */}
      <button
        onClick={handleAfaRegister}
        className="w-full bg-purple-600 text-white p-2 rounded mb-2"
        disabled={afaLoading}
      >
        Register AFA (Price: GHS {currentPrices.afa})
      </button>
    </div>
  );
            }mer");
                      setWalletBalance(walletRes.data?.balance ?? 0);
                      setPurchases(purchasesRes.data ?? []);
                    } catch (err) {
                      console.error("Failed to refresh user data:", err);
                    }

                    alert(`Deposited GHS ${newBalance} successfully!`);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade to Agent */}
      {role !== "agent" && (
        <UpgradeToAgent
          user={user}
          walletBalance={walletBalance}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Bundles */}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">
          Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})
        </h2>
        {currentPrices.bundles.map((bundle) => (
          <button
            key={bundle.name}
            onClick={() => handleBundlePurchase(bundle)}
            className="w-full bg-blue-500 text-white p-2 rounded mb-2"
            disabled={bundleLoading}
          >
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>

      {/* Agent-only components */}
      {role === "agent" && (
        <>
          <AgentReferral agent={user} />
          <BulkBundlePurchase
            agent={user}
            walletBalance={walletBalance}
            bundlePrice={currentPrices.bundles[0].price}
          />
          <AgentEarnings agent={user} />
          <AgentAnnouncements agent={user} />
          <AgentProfile agent={user} />
        </>
      )}

      {/* Purchase History */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p: any) => (
            <li key={p.id}>
              {p.network} - {p.bundle} - GHS {p.price.toFixed(2)} -{" "}
              {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <PurchaseAnalytics user={user} />
      <SupportTickets user={user} />
      <PromoCodeRedeem user={user} />
      <WhatsAppWidget />

      {/* AFA Registration */}
      <button
        onClick={handleAfaRegister}
        className="w-full bg-purple-600 text-white p-2 rounded mb-2"
        disabled={afaLoading}
      >
        Register AFA (Price: GHS {currentPrices.afa})
      </button>
    </div>
  );
}
