import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Phone,
} from "lucide-react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import toast from "react-hot-toast";
import { auth, db } from "../firebase";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [details, setDetails] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save customer profile in Firestore
  const saveUserProfile = async (user, extraDetails = {}) => {
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName || extraDetails.name || "",
        email: user.email || "",
        phone: user.phoneNumber || extraDetails.phone || "",
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  // Email login and signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (details.password.length < 6) {
          toast.error("Password must contain at least 6 characters.");
          return;
        }

        if (!/^[0-9]{10}$/.test(details.phone.trim())) {
          toast.error("Enter a valid 10-digit phone number.");
          return;
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          details.email.trim(),
          details.password
        );

        const user = credential.user;

        await updateProfile(user, {
          displayName: details.name.trim(),
        });

        await saveUserProfile(user, {
          name: details.name.trim(),
          phone: details.phone.trim(),
        });

        toast.success("Account created successfully!");
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          details.email.trim(),
          details.password
        );

        await saveUserProfile(credential.user);

        toast.success("Welcome back!");
      }

      navigate("/");
    } catch (error) {
      console.error("Authentication error:", error);

      const messages = {
        "auth/email-already-in-use": "Email already registered. Please sign in.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/weak-password": "Password must contain at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };

      toast.error(
        messages[error.code] || error.message || "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      await saveUserProfile(result.user);

      toast.success("Google sign-in successful!");

      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);

      const messages = {
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/popup-blocked": "Please allow popups and try again.",
        "auth/unauthorized-domain": "This website domain is not authorized in Firebase.",
        "auth/account-exists-with-different-credential":
          "An account already exists with this email using another sign-in method.",
      };

      toast.error(
        messages[error.code] || error.message || "Google sign-in failed."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-76px)] bg-white md:grid-cols-2">

      {/* LEFT PANEL */}
      <section className="relative hidden overflow-hidden bg-ink p-14 text-white md:flex md:flex-col md:justify-between">

        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10" />

        <div className="absolute -right-20 top-32 h-72 w-72 rounded-full border border-white/10" />

        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <Link
          to="/"
          className="display-font relative z-10 text-3xl font-semibold tracking-[0.15em]"
        >
          CRAFTIVA<span className="text-[#C46A4A]">.</span>
        </Link>

        <div className="relative z-10">
          <p className="eyebrow text-[#D99A7E]">
            Objects worth keeping
          </p>

          <h1 className="display-font mt-6 max-w-lg text-6xl leading-[1.1]">
            Good things are better{" "}
            <em className="text-[#D99A7E]">collected.</em>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">
            Discover pieces that reflect your personality.
            Keep track of your favourites, orders and next discoveries.
          </p>
        </div>

        <p className="relative z-10 eyebrow text-white/40">
          CRAFTIVA · Curated for your space
        </p>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex items-center justify-center px-6 py-14 sm:px-10">

        <div className="w-full max-w-[410px]">

          {/* MOBILE LOGO */}
          <div className="mb-8 md:hidden">
            <Link
              to="/"
              className="display-font text-3xl font-semibold tracking-[0.12em] text-ink"
            >
              CRAFTIVA<span className="text-accent">.</span>
            </Link>
          </div>

          <p className="eyebrow text-accent">
            {mode === "login" ? "Welcome back" : "Start your journey"}
          </p>

          <h2 className="display-font mt-3 text-5xl text-ink">
            {mode === "login" ? "Sign in." : "Join us."}
          </h2>

          <p className="mt-3 text-sm text-muted">
            {mode === "login"
              ? "Sign in to continue exploring."
              : "Create an account and discover something special."}
          </p>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="mt-8 flex w-full items-center justify-center gap-3 border border-[#ded9d0] px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-ink hover:bg-[#F7F5EF] disabled:opacity-50"
          >
            {googleLoading ? (
              "Connecting to Google..."
            ) : (
              <>
                <svg
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.94 46.98 31.85 46.98 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>

                Continue with Google
              </>
            )}
          </button>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e5e0d8]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Or continue with email
            </span>

            <div className="h-px flex-1 bg-[#e5e0d8]" />
          </div>

          {/* EMAIL FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME AND PHONE */}
            {mode === "signup" && (
              <>
                <div className="flex items-center gap-3 border border-[#ded9d0] px-4 transition focus-within:border-ink">
                  <User size={17} className="text-muted" />

                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Full name"
                    value={details.name}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3.5 text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 border border-[#ded9d0] px-4 transition focus-within:border-ink">
                  <Phone size={17} className="text-muted" />

                  <input
                    required
                    name="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit phone number"
                    value={details.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent py-3.5 text-sm outline-none"
                  />
                </div>
              </>
            )}

            {/* EMAIL */}
            <div className="flex items-center gap-3 border border-[#ded9d0] px-4 transition focus-within:border-ink">
              <Mail size={17} className="text-muted" />

              <input
                required
                name="email"
                type="email"
                placeholder="Email address"
                value={details.email}
                onChange={handleChange}
                className="w-full bg-transparent py-3.5 text-sm outline-none"
              />
            </div>

            {/* PASSWORD WITH SHOW/HIDE */}
            <div className="flex items-center gap-3 border border-[#ded9d0] px-4 transition focus-within:border-ink">
              <Lock size={17} className="text-muted" />

              <input
                required
                name="password"
                type={showPassword ? "text" : "password"}
                minLength={6}
                placeholder="Password"
                value={details.password}
                onChange={handleChange}
                className="w-full bg-transparent py-3.5 text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted transition hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-between bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}

              <ArrowRight size={17} />
            </button>

          </form>

          {/* SWITCH LOGIN / SIGNUP */}
          <p className="mt-7 text-center text-xs text-muted">
            {mode === "login"
              ? "New to CRAFTIVA?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setMode((prev) =>
                  prev === "login" ? "signup" : "login"
                );
                setShowPassword(false);
              }}
              className="ml-2 font-bold text-ink underline underline-offset-4"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          {/* ADMIN LOGIN */}
          <p className="mt-8 text-center text-[10px] text-muted">
            Admin?{" "}

            <Link
              to="/admin/login"
              className="font-semibold text-ink underline underline-offset-4"
            >
              Admin sign in
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}