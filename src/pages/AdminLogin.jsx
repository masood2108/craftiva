import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

import { auth, db } from "../firebase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const adminRef = doc(db, "admins", credential.user.uid);
      const adminSnap = await getDoc(adminRef);

      if (
        !adminSnap.exists() ||
        adminSnap.data().role !== "admin" ||
        adminSnap.data().active !== true
      ) {
        await auth.signOut();
        throw new Error("This account is not authorized as an administrator.");
      }

      toast.success("Welcome to CRAFTIVA Admin");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-[420px] bg-white p-8 shadow-sm md:p-12">
        <p className="eyebrow text-accent">CRAFTIVA Management</p>

        <h1 className="display-font mt-3 text-4xl">
          Admin access
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in with your authorized administrator account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            required
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#ded9d0] px-4 py-3.5 text-sm outline-none focus:border-ink"
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#ded9d0] px-4 py-3.5 text-sm outline-none focus:border-ink"
          />

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-accent disabled:opacity-50"
          >
            <LockKeyhole size={15} />
            {loading ? "Verifying..." : "Secure sign in"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-7 block text-center text-xs text-muted underline underline-offset-4"
        >
          Back to storefront
        </Link>
      </div>
    </main>
  );
}