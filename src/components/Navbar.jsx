import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  Grid2X2,
  WandSparkles,
  Image,
  Car,
  Camera,
  Images,
  Film,
  Truck,
  CircleHelp,
  User,
  MessageCircle,
  LogOut,
  Star,
  ScrollText,
  Instagram,
  ShieldCheck,
} from "lucide-react";

import { auth, db } from "../firebase";
import toast from "react-hot-toast";

const WHATSAPP = "919770633408";
const INSTAGRAM = "https://www.instagram.com/theposterclub_rpr";

const whatsapp = (message) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

const menuItems = [
  {
    id: "packs",
    title: "Wall Setup Packs",
    icon: Grid2X2,
    badge: "RECOMMENDED",
    badgeStyle: "bg-[#302326] text-[#F7C4E0]",
  },
  {
    id: "custom-pack",
    title: "Build your own wall setup pack",
    icon: WandSparkles,
    badge: "BEST SELLER",
    badgeStyle: "bg-[#FF496B] text-white",
  },
  {
    id: "posters",
    title: "Shop All Posters",
    icon: Image,
    badge: "2,000+ DESIGNS",
    badgeStyle: "bg-[#F8D9E4] text-[#A34E68]",
    direct: true,
  },
  {
    id: "frames",
    title: "3D Car & Figure Frames",
    icon: Car,
    direct: true,
  },
  {
    id: "retro",
    title: "Retro prints",
    icon: Camera,
    price: "Starts ₹179",
  },
  {
    id: "pocket",
    title: "Mini pocket photos",
    icon: Images,
    price: "Starts ₹99",
  },
  {
    id: "photobooth",
    title: "Photobooth strips",
    icon: Film,
    price: "Starts ₹149",
  },
];

const supportItems = [
  { id: "tracking", title: "Track Your Order", icon: Truck },
  { id: "reviews", title: "Reviews", icon: Star, detail: "4.9 ★ 43,000+" },
  { id: "help", title: "Help Center", icon: CircleHelp },
  { id: "policies", title: "About & Policies", icon: ScrollText },
];

/* PROFILE AVATAR */
function ProfileAvatar({ user, className = "" }) {
  const [imageError, setImageError] = useState(false);

  const initials = (
    user?.displayName?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  if (user?.photoURL && !imageError) {
    return (
      <img
        src={user.photoURL}
        alt="Profile"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className={`${className} rounded-full border border-[#EADDE0] object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#F5DCE4] font-bold text-[#93475F]`}
    >
      {initials}
    </div>
  );
}

/* POPUP CONTENT */
function PopupContent({ type, close, navigate }) {
  const [trackingInput, setTrackingInput] = useState("");

  const goToProducts = (category = "all") => {
    close();
    navigate(`/?category=${category}#bestsellers`);
  };

  const WhatsAppButton = ({ text, message }) => (
    <a
      href={whatsapp(message)}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#20CE68] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#18B95B] sm:text-base"
    >
      <MessageCircle size={19} />
      {text}
    </a>
  );

  const OutlineButton = ({ text, onClick }) => (
    <button
      onClick={onClick}
      className="w-full rounded-full border-2 border-[#E87998] px-4 py-3 text-sm font-bold text-[#A34E68] transition hover:bg-[#FBEAF0] sm:text-base"
    >
      {text}
    </button>
  );

  const CloseButton = () => (
    <button
      onClick={close}
      aria-label="Close popup"
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white transition hover:bg-[#F7E8EC] sm:right-5 sm:top-5"
    >
      <X size={21} />
    </button>
  );

  const Heading = ({ children }) => (
    <h2 className="display-font pr-10 text-3xl font-semibold leading-tight text-[#302326] sm:text-4xl">
      {children}
    </h2>
  );

  const Price = ({ children }) => (
    <p className="mt-3 text-xl text-[#A34E68] sm:text-2xl">
      {children}
    </p>
  );

  const Description = ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-[#382D31] sm:text-lg">
      {children}
    </p>
  );

  if (type === "packs") {
    return (
      <>
        <CloseButton />

        <span className="inline-flex rounded-full bg-[#302326] px-4 py-1.5 text-[10px] font-extrabold tracking-wide text-[#F7C4E0] sm:text-xs">
          RECOMMENDED
        </span>

        <div className="mt-5">
          <Heading>Wall Setup Packs</Heading>
        </div>

        <Description>
          Hand-curated poster sets designed to look perfect together.
          Printed on 300 GSM matte stock with free wall tape.
        </Description>

        <div className="mt-5 space-y-3">
          {[
            ["Starter Pack", "10 A4 posters", "₹999"],
            ["Room Makeover", "20 A4 posters", "₹1,799"],
            ["Full Wall", "30 A4 + 2 A3 posters", "₹2,499"],
          ].map(([name, description, price]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#F1DCE3] bg-white px-4 py-4 sm:px-5"
            >
              <div>
                <h3 className="text-base font-extrabold text-[#302326] sm:text-lg">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-[#76666C] sm:text-base">
                  {description}
                </p>
              </div>

              <p className="shrink-0 text-base font-extrabold text-[#A34E68] sm:text-lg">
                {price}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-[#76666C] sm:text-base">
          Themes: Cars & F1, Anime, Aesthetic Pink, Retro Bollywood,
          Cricket, Movies & more.
        </p>

        <div className="mt-6 space-y-3">
          <WhatsAppButton
            text="Choose a Pack on WhatsApp"
            message="Hi CRAFTIVA! I am interested in your Wall Setup Packs. Please share more details."
          />

          <OutlineButton
            text="Browse Posters"
            onClick={() => goToProducts("posters")}
          />
        </div>
      </>
    );
  }

  if (type === "custom-pack") {
    return (
      <>
        <CloseButton />

        <span className="inline-flex rounded-full bg-[#FF496B] px-4 py-1.5 text-[10px] font-extrabold text-white sm:text-xs">
          BEST SELLER
        </span>

        <div className="mt-5">
          <Heading>Build Your Own Wall Setup Pack</Heading>
        </div>

        <div className="mt-5 space-y-3 text-base leading-relaxed text-[#382D31] sm:text-lg">
          <p>
            1. <strong>Pick your designs</strong> from 2,000+ posters or
            send your own photos.
          </p>
          <p>
            2. <strong>Choose sizes</strong> — mix A4 and A3 for that
            gallery look.
          </p>
          <p>
            3. <strong>We print & pack</strong> them safely and ship
            Pan India.
          </p>
        </div>

        <p className="mt-5 text-base leading-relaxed text-[#382D31] sm:text-lg">
          Bundle pricing: <strong>10+ posters at ₹99 each</strong>,
          20+ at ₹89 each.
        </p>

        <div className="mt-6">
          <WhatsAppButton
            text="Start Building on WhatsApp"
            message="Hi CRAFTIVA! I want to build my own wall setup pack. Please guide me."
          />
        </div>
      </>
    );
  }

  if (["retro", "pocket", "photobooth"].includes(type)) {
    const details = {
      retro: {
        title: "Retro Prints",
        price: "₹179",
        description:
          "Your photos turned into vintage polaroid-style prints with a classic white border. Perfect for fairy-light walls and scrapbooks.",
      },
      pocket: {
        title: "Mini Pocket Photos",
        price: "₹99",
        description:
          "Wallet-size glossy photo prints you can keep everywhere — wallets, phone covers, journals and gifts.",
      },
      photobooth: {
        title: "Photobooth Strips",
        price: "₹149",
        description:
          "Classic 4-frame photobooth strips made from your pictures — the cutest gift for best friends and couples.",
      },
    };

    const item = details[type];

    return (
      <>
        <CloseButton />
        <Heading>{item.title}</Heading>
        <Price>
          Starts <strong>{item.price}</strong>
        </Price>
        <Description>{item.description}</Description>

        <div className="mt-6">
          <WhatsAppButton
            text="Order on WhatsApp"
            message={`Hi CRAFTIVA! I want to order ${item.title}. Please share details.`}
          />
        </div>
      </>
    );
  }

  if (type === "tracking") {
    return (
      <>
        <CloseButton />
        <Heading>Track Your Order</Heading>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();

            if (!trackingInput.trim()) {
              toast.error("Enter your Order ID or phone number");
              return;
            }

            window.open(
              whatsapp(
                `Hi CRAFTIVA! I want to track my order. Order ID / Phone: ${trackingInput}`
              ),
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          <input
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Order ID or phone number"
            className="min-w-0 flex-1 rounded-xl border border-[#F1DCE3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A34E68]"
          />

          <button
            type="submit"
            className="rounded-full bg-[#B95675] px-7 py-3 text-sm font-bold text-white hover:bg-[#93475F]"
          >
            Track
          </button>
        </form>

        <p className="mt-4 text-sm text-[#76666C]">
          Enter your order details to request a tracking update on WhatsApp.
        </p>
      </>
    );
  }

  if (type === "reviews") {
    return (
      <>
        <CloseButton />
        <Heading>Customer Reviews</Heading>
        <Price>★★★★★</Price>

        <Description>
          We'd love to hear about your CRAFTIVA experience.
          Share your feedback with us on WhatsApp.
        </Description>

        <div className="mt-6">
          <WhatsAppButton
            text="Share Your Feedback"
            message="Hi CRAFTIVA! I would like to share feedback about my experience."
          />
        </div>
      </>
    );
  }

  if (type === "help") {
    return (
      <>
        <CloseButton />
        <Heading>Help Center</Heading>

        <Description>
          Need help with an order, payment, customisation or delivery?
          Our team is here to help.
        </Description>

        <div className="mt-6 space-y-3">
          <WhatsAppButton
            text="Chat on WhatsApp"
            message="Hi CRAFTIVA! I need help with an enquiry."
          />

          <a
            href="mailto:karansahu@gmail.com"
            className="block rounded-full border-2 border-[#E87998] px-4 py-3 text-center text-sm font-bold text-[#A34E68]"
          >
            Email Us
          </a>
        </div>
      </>
    );
  }

  if (type === "policies") {
    return (
      <>
        <CloseButton />
        <Heading>About CRAFTIVA</Heading>

        <Description>
          We create thoughtful frames, posters and personalised gifts
          to make your spaces special.
        </Description>

        <div className="mt-5 space-y-3">
          {[
            ["Shipping Policy", "Contact us for delivery timelines and shipping details."],
            ["Return Policy", "Contact our team for assistance with damaged or incorrect orders."],
            ["Privacy Policy", "Your personal information is used to process and support your orders."],
            ["Payment Policy", "UPI prepaid orders are subject to payment verification."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-[#F1DCE3] bg-white p-4"
            >
              <h3 className="text-sm font-bold text-[#302326] sm:text-base">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#76666C] sm:text-sm">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <WhatsAppButton
            text="Contact Us"
            message="Hi CRAFTIVA! I have a question about your policies."
          />
        </div>
      </>
    );
  }

  return null;
}

/* MAIN NAVBAR */
export default function Navbar({ cartCount = 0, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();

  /* AUTH + ADMIN ROLE CHECK */
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mounted) return;

        setUser(currentUser);
        setIsAdmin(false);

        if (!currentUser) {
          setAuthLoading(false);
          return;
        }

        try {
          const adminRef = doc(db, "admins", currentUser.uid);
          const adminSnap = await getDoc(adminRef);

          if (!mounted) return;

          if (adminSnap.exists()) {
            const adminData = adminSnap.data();

            setIsAdmin(
              adminData.role === "admin" &&
              adminData.active === true
            );
          }
        } catch (error) {
          console.error("Admin verification error:", error);
          if (mounted) setIsAdmin(false);
        } finally {
          if (mounted) setAuthLoading(false);
        }
      },
      (error) => {
        console.error("Auth state error:", error);

        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const openPopup = (id) => {
    closeMenu();
    setAccountOpen(false);
    setActivePopup(id);
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setActivePopup(null);
    document.body.style.overflow = "";
  };

  const goToCategory = (category) => {
    closeMenu();
    setActivePopup(null);
    setAccountOpen(false);
    document.body.style.overflow = "";

    navigate(`/?category=${category}#bestsellers`);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!activePopup) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePopup();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePopup]);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setAccountOpen(false);
      closeMenu();
      setIsAdmin(false);

      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to logout. Please try again.");
    }
  };

  const menuLink =
    "flex min-h-[62px] w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#302326] transition hover:bg-[#F9E4EB] sm:min-h-[66px] sm:text-base";

  const iconStyle = "h-5 w-5 shrink-0 text-[#A34E68]";

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#EADDE0] bg-[#FFFAF8]">
        <div className="container-shell flex h-[68px] items-center justify-between gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F7E8EC]"
          >
            <Menu size={25} />
          </button>

          <Link to="/" className="flex flex-col items-center leading-none">
            <span className="display-font text-[28px] font-bold tracking-[-0.04em] text-[#93475F] sm:text-[32px]">
              Craftiva
            </span>
            <span className="mt-1 text-[8px] font-bold tracking-[0.28em] text-[#4A3D40]">
              FRAMES & GIFTS
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={onSearch}
              aria-label="Search products"
              className="text-[#30272A] hover:text-[#A34E68]"
            >
              <Search size={21} />
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-label="My account"
                className="flex items-center justify-center"
              >
                {authLoading ? (
                  <div className="h-8 w-8 animate-pulse rounded-full bg-[#F5DCE4]" />
                ) : user ? (
                  <ProfileAvatar user={user} className="h-8 w-8 text-xs" />
                ) : (
                  <UserRound size={21} />
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-[#EADDE0] bg-white p-3 shadow-xl">
                  {authLoading ? (
                    <p className="px-3 py-3 text-sm text-gray-500">
                      Loading account...
                    </p>
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 border-b border-[#EADDE0] px-2 pb-3">
                        <ProfileAvatar user={user} className="h-10 w-10" />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#542D3A]">
                            {user.displayName || "Welcome"}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setAccountOpen(false)}
                          className="mt-2 flex items-center gap-2 rounded-lg bg-[#F9E4EB] px-3 py-2.5 text-sm font-bold text-[#93475F]"
                        >
                          <ShieldCheck size={17} />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/my-orders"
                        onClick={() => setAccountOpen(false)}
                        className="mt-2 block rounded-lg px-3 py-2.5 text-sm hover:bg-[#F7E8EC]"
                      >
                        My Orders
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm hover:bg-[#F7E8EC]"
                    >
                      Customer Login
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* CART */}
            <Link to="/cart" aria-label="Shopping bag" className="relative">
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#A34E68] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50"
          onClick={closeMenu}
        >
          <aside
            className="flex h-full w-[88%] max-w-[390px] flex-col overflow-hidden bg-[#FFFAF8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#EADDE0] bg-white px-5 py-4">
              <Link
                to="/"
                onClick={closeMenu}
                className="display-font text-[30px] font-bold tracking-[-0.04em] text-[#93475F]"
              >
                Craftiva
              </Link>

              <button onClick={closeMenu} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {/* SHOP */}
              <section className="pt-5">
                <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B49BA3]">
                  Shop
                </p>

                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        item.direct
                          ? goToCategory(item.id)
                          : openPopup(item.id)
                      }
                      className={menuLink}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className={iconStyle} />
                        <span>{item.title}</span>
                      </span>

                      {item.badge && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold sm:text-[10px] ${item.badgeStyle}`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.price && (
                        <span className="shrink-0 text-xs font-bold text-[#A34E68] sm:text-sm">
                          {item.price}
                        </span>
                      )}
                    </button>
                  );
                })}
              </section>

              {/* SUPPORT */}
              <section className="mt-5 border-t border-[#EADDE0] pt-5">
                <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B49BA3]">
                  Support
                </p>

                {supportItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => openPopup(item.id)}
                      className={menuLink}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={iconStyle} />
                        {item.title}
                      </span>

                      {item.detail && (
                        <span className="text-xs font-bold text-[#A34E68]">
                          {item.detail}
                        </span>
                      )}
                    </button>
                  );
                })}

                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noreferrer"
                  className={`${menuLink} mt-1 bg-[#F9E0E8]`}
                >
                  <span className="flex items-center gap-3">
                    <Instagram className={iconStyle} />
                    Instagram
                  </span>

                  <span className="text-xs font-bold text-[#A34E68]">
                    @theposterclub_rpr
                  </span>
                </a>
              </section>

              {/* ACCOUNT */}
              <section className="mt-5 border-t border-[#EADDE0] pb-4 pt-5">
                <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B49BA3]">
                  Account
                </p>

                {authLoading ? (
                  <p className="px-3 py-3 text-sm text-gray-500">
                    Loading account...
                  </p>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-4">
                      <ProfileAvatar user={user} className="h-12 w-12 text-sm" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#542D3A]">
                          {user.displayName || "Welcome"}
                        </p>
                        <p className="truncate text-xs text-[#7C737B]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={closeMenu}
                        className={`${menuLink} bg-[#F9E4EB]`}
                      >
                        <span className="flex items-center gap-3 font-bold text-[#93475F]">
                          <ShieldCheck className={iconStyle} />
                          Admin Dashboard
                        </span>
                      </Link>
                    )}

                    <Link
                      to="/my-orders"
                      onClick={closeMenu}
                      className={menuLink}
                    >
                      <span className="flex items-center gap-3">
                        <Truck className={iconStyle} />
                        My Orders
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`${menuLink} w-full text-left`}
                    >
                      <span className="flex items-center gap-3 text-red-600">
                        <LogOut className="h-5 w-5" />
                        Logout
                      </span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className={menuLink}
                  >
                    <span className="flex items-center gap-3">
                      <User className={iconStyle} />
                      Customer Login
                    </span>
                  </Link>
                )}
              </section>
            </div>

            {/* FOOTER */}
            <div className="shrink-0 border-t border-[#EADDE0] bg-white px-5 py-3">
              <p className="display-font text-center text-xl font-semibold text-[#93475F]">
                Craftiva
              </p>
              <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-[#A9969D]">
                Frames · Posters · Gifts
              </p>
              <p className="mt-2 text-center text-[10px] text-[#A9969D]">
                Made with love for your spaces.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* POPUP MODALS */}
      {activePopup && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-[5px] sm:p-5"
          onClick={closePopup}
        >
          <div
            className="relative my-auto max-h-[90dvh] w-full max-w-[760px] overflow-y-auto rounded-[24px] bg-[#FFFAF8] px-5 py-7 shadow-2xl sm:rounded-[30px] sm:px-8 sm:py-8 md:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <PopupContent
              type={activePopup}
              close={closePopup}
              navigate={navigate}
            />
          </div>
        </div>
      )}
    </>
  );
}