import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Save, CreditCard } from "lucide-react";

import {
  subscribeToPaymentSettings,
  savePaymentSettings,
} from "../services/settingsService";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    upiId: "",
    payeeName: "CRAFTIVA",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPaymentSettings(
      (data) => {
        setSettings({
          upiId: data.upiId || "",
          payeeName: data.payeeName || "CRAFTIVA",
        });

        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to load payment settings");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      await savePaymentSettings(settings);
      toast.success("UPI settings updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">

        <Link
          to="/admin/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Store administration
        </p>

        <h1 className="display-font mt-3 text-3xl text-[#762F43] sm:text-4xl">
          Payment Settings
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Manage the UPI details customers use to pay for orders.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 border border-[#e8e5de] bg-white p-5 sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="rounded-xl bg-[#F0E5E2] p-3 text-[#762F43]">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">
                UPI Payment Details
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Customers will see these details at checkout.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-sm text-gray-500">
              Loading settings...
            </p>
          ) : (
            <>
              <div className="mt-7">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  UPI ID
                </label>

                <input
                  type="text"
                  required
                  value={settings.upiId}
                  onChange={(e) =>
                    setSettings((old) => ({
                      ...old,
                      upiId: e.target.value,
                    }))
                  }
                  placeholder="example@okaxis"
                  className="w-full rounded-xl border border-[#DFC6C5] px-4 py-4 text-sm outline-none focus:border-[#762F43]"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Enter the UPI ID linked to the account receiving payments.
                </p>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Payee Name
                </label>

                <input
                  type="text"
                  required
                  value={settings.payeeName}
                  onChange={(e) =>
                    setSettings((old) => ({
                      ...old,
                      payeeName: e.target.value,
                    }))
                  }
                  placeholder="CRAFTIVA"
                  className="w-full rounded-xl border border-[#DFC6C5] px-4 py-4 text-sm outline-none focus:border-[#762F43]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#762F43] py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#5E2334] disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Payment Settings"}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Important
          </p>

          <p className="mt-2 text-xs leading-6 text-amber-700">
            Verify the UPI ID carefully. All customer payments will be
            directed to this account. Test with a small payment before
            making the store live.
          </p>
        </div>

      </div>
    </main>
  );
}