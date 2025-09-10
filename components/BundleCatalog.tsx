import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Utility for formatting currency
function formatCurrency(amount: number) {
  return amount.toLocaleString("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type Bundle = {
  id: string;
  name: string;
  price: number;
};

type Admin = {
  id: string;
};

export function BundleCatalog({ admin }: { admin: Admin }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [newBundle, setNewBundle] = useState({ name: "", price: "" });
  const [editBundleId, setEditBundleId] = useState<string | null>(null);
  const [editBundle, setEditBundle] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let bundlesSub: any;
    const fetchBundles = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase.from("bundles").select("*").order("price");
      if (error) setError(error.message);
      setBundles(data || []);
      setLoading(false);
    };
    fetchBundles();

    // Real-time subscription
    bundlesSub = supabase
      .channel("bundles_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bundles" },
        fetchBundles
      )
      .subscribe();

    return () => {
      bundlesSub.unsubscribe();
    };
  }, []);

  const addBundle = async () => {
    setError("");
    if (!newBundle.name.trim() || !newBundle.price) {
      setError("Please provide both name and price.");
      return;
    }
    setAdding(true);
    const price = Number(newBundle.price);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price greater than 0.");
      setAdding(false);
      return;
    }
    const { error } = await supabase.from("bundles").insert({
      name: newBundle.name.trim(),
      price,
    });
    if (error) setError(error.message);
    setNewBundle({ name: "", price: "" });
    setAdding(false);
    // No need to refetch, real-time covers this
  };

  const startEdit = (b: Bundle) => {
    setEditBundleId(b.id);
    setEditBundle({ name: b.name, price: String(b.price) });
    setError("");
  };

  const cancelEdit = () => {
    setEditBundleId(null);
    setEditBundle({ name: "", price: "" });
    setError("");
  };

  const saveEdit = async () => {
    setError("");
    if (!editBundle.name.trim() || !editBundle.price) {
      setError("Please provide both name and price.");
      return;
    }
    const price = Number(editBundle.price);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }
    const { error } = await supabase
      .from("bundles")
      .update({ name: editBundle.name.trim(), price })
      .eq("id", editBundleId);
    if (error) setError(error.message);
    cancelEdit();
    // No need to refetch, real-time covers this
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteBundle = async () => {
    if (!deletingId) return;
    setError("");
    const { error } = await supabase.from("bundles").delete().eq("id", deletingId);
    if (error) setError(error.message);
    setDeletingId(null);
    // No need to refetch, real-time covers this
  };

  if (!admin?.id) {
    return <div>Access denied. Admin login required.</div>;
  }

  return (
    <div>
      <h3>Bundle Catalog</h3>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input
        value={newBundle.name}
        onChange={e => setNewBundle({ ...newBundle, name: e.target.value })}
        placeholder="Bundle Name"
        aria-label="Bundle Name"
        disabled={adding}
      />
      <input
        value={newBundle.price}
        onChange={e => setNewBundle({ ...newBundle, price: e.target.value })}
        placeholder="Price"
        type="number"
        min="1"
        aria-label="Bundle Price"
        disabled={adding}
      />
      <button onClick={addBundle} disabled={adding || !newBundle.name.trim() || !newBundle.price}>
        {adding ? "Adding..." : "Add Bundle"}
      </button>
      {loading ? (
        <div>Loading bundles...</div>
      ) : (
        <ul>
          {bundles.map(b =>
            editBundleId === b.id ? (
              <li key={b.id}>
                <input
                  value={editBundle.name}
                  onChange={e => setEditBundle({ ...editBundle, name: e.target.value })}
                  placeholder="Bundle Name"
                  aria-label="Edit Bundle Name"
                />
                <input
                  value={editBundle.price}
                  onChange={e => setEditBundle({ ...editBundle, price: e.target.value })}
                  placeholder="Price"
                  type="number"
                  min="1"
                  aria-label="Edit Bundle Price"
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </li>
            ) : (
              <li key={b.id}>
                {b.name}: {formatCurrency(b.price)}{" "}
                <button onClick={() => startEdit(b)} aria-label={`Edit ${b.name}`}>Edit</button>
                <button onClick={() => confirmDelete(b.id)} aria-label={`Delete ${b.name}`}>Delete</button>
              </li>
            )
          )}
          {bundles.length === 0 && <li>No bundles found.</li>}
        </ul>
      )}
      {deletingId && (
        <div style={{ marginTop: 10 }}>
          <b>Are you sure you want to delete this bundle?</b>
          <button onClick={deleteBundle} style={{ color: "red", marginLeft: 8 }}>Yes, Delete</button>
          <button onClick={() => setDeletingId(null)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
