import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("unauthorized");
        return;
      }

      try {
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (
          adminSnap.exists() &&
          adminSnap.data().role === "admin" &&
          adminSnap.data().active === true
        ) {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } catch (error) {
        console.error("Admin verification failed:", error);
        setStatus("unauthorized");
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return <div className="p-20 text-center">Verifying admin access...</div>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}