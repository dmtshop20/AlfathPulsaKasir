import React, { useState, useEffect, useRef, useMemo } from "react";
// POS Refined Version 2.0

import {
  LogOut,
  Loader2,
  LayoutDashboard,
  Calculator,
  Boxes,
  ArrowRightLeft,
  ClipboardCheck,
  Clock,
  Settings,
  ShoppingBag,
  Percent,
  Search,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  UserCircle,
  Store,
  PlusSquare,
  CreditCard,
  Banknote,
  ScanBarcode,
  CheckCircle2,
  Bell,
  RefreshCw,
  User,
  Key,
  RotateCcw,
  ShoppingCart,
  X,
  Eye,
  LayoutList,
  ClipboardList,
  Users,
  MapPin,
  Smartphone,
  Wifi,
  Save,
  Package,
  PackagePlus,
  AlertTriangle,
  Calendar,
  Check,
  Camera,
  Barcode,
  TrendingUp,
  Sparkles,
  Box,
  Database,
  Edit,
  Lock,
  Activity,
  LayoutGrid,
  Tag,
  ChevronRight,
  Hand,
  Menu,
  Info,
  ArrowRight,
  History as HistoryIcon,
  Zap,
  Mail,
  Sun,
  Moon,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { io } from "socket.io-client";
import { auth, db, signInWithGoogle } from "./lib/firebase";
import { 
  query, 
  collection, 
  orderBy, 
  startAfter, 
  limit, 
  where, 
  getDocs, 
  writeBatch, 
  doc, 
  addDoc, 
  deleteDoc, 
  setDoc,
  updateDoc
} from "firebase/firestore";
import { api } from "./services/api";
import { useBarcodeScanner } from "./hooks/useBarcodeScanner";

import { ProductTable } from "./components/ProductTable";
import { CustomSelect } from "./components/CustomSelect";
const ScannerModal = ({
  onClose,
  onScan,
}: {
  onClose: () => void;
  onScan: (result: string) => void;
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initScanner() {
      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              html5QrCode
                .stop()
                .then(() => {
                  onScan(decodedText);
                  onClose();
                })
                .catch((e) => console.error("Stop error:", e));
            }
          },
          (errorMessage) => {},
        );
      } catch (err: any) {
        console.error("Scanner start error:", err);
        if (isMounted) {
          setErrorMsg(
            "Kamera tidak aktif. Berikan izin akses kamera di setelan browser.",
          );
        }
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch((e) => console.error("Cleanup stop error:", e));
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm bg-white rounded-[40px] overflow-hidden relative shadow-[0_0_80px_rgba(30,58,138,0.4)] border border-white/20">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 animate-pulse">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tighter leading-none text-base">
                SCANNER AKTIF
              </h3>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">
                Alfath Pulsa System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 md:p-6 relative aspect-square">
          <div
            id="reader-container"
            ref={scannerRef}
            className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-inner bg-black border-2 border-slate-800"
          ></div>

          <div className="absolute inset-x-0 top-1/2 h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20 pointer-events-none"></div>

          {errorMsg && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-8 text-center bg-slate-950/90 backdrop-blur-md">
              <div className="text-white max-w-xs">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-sm font-bold leading-relaxed mb-6 uppercase tracking-tight">
                  {errorMsg}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 md:py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-slate-100 transition-all"
                >
                  Segarkan Browser
                </button>
              </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none border-[60px] border-black/10 rounded-2xl md:rounded-3xl"></div>
        </div>

        <div className="p-4 md:p-6 bg-white">
          <div className="flex items-center gap-4 text-slate-500 bg-slate-50 p-4 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-wide leading-relaxed">
              Letakkan kode di tengah area pindaian. Sensor akan bekerja
              otomatis setelah fokus tercapai.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { top: 90%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  
  // Specific check for multi-field query indexes
  if (errMessage.includes("index") || errMessage.includes("FAILED_PRECONDITION")) {
    console.error("Firestore Index Error: You may need to create a composite index in Firebase Console. Check browser console logs for the direct link.");
    if (operationType !== OperationType.LIST && operationType !== OperationType.GET) {
      alert("Indeks Database Diperlukan: Hubungi admin untuk aktivasi indeks query.");
    }
    return;
  }

  if (errMessage.includes("quota-exceeded") || errMessage.includes("Quota exceeded")) {
    alert("Kuota Firebase Habis: Batas harian paket gratis telah tercapai. Saldo & bonus mungkin tidak update sampai kuota reset.");
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Don't crash on list/snapshot errors in production as much as possible
  if (operationType === OperationType.LIST || operationType === OperationType.GET) {
    if (errMessage.includes("permission-denied") || errMessage.includes("Missing or insufficient permissions")) {
      console.warn("Permission denied for:", path);
      return; 
    }
  }

  alert(`Kesalahan Database (${operationType}): ${errMessage.substring(0, 100)}...`);
  
  // Only throw for CRITICAL write errors that we cannot recover from
  if (operationType === OperationType.WRITE || operationType === OperationType.CREATE || operationType === OperationType.UPDATE || operationType === OperationType.DELETE) {
    throw new Error(JSON.stringify(errInfo));
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore Data States
  const [users, setUsers] = useState<any[]>([]);
  const [resetUser, setResetUser] = useState<any | null>(null);
  const [newPassInput, setNewPassInput] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [lastProductDoc, setLastProductDoc] = useState<any>(null);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const PRODUCTS_PAGE_SIZE = 2000;

  // Pagination Logic for Products
  const loadMoreProducts = async () => {
    if (!hasMoreProducts || !lastProductDoc) return;
    try {
      const nextQuery = query(
        collection(db, "products"),
        orderBy("name"),
        startAfter(lastProductDoc),
        limit(PRODUCTS_PAGE_SIZE)
      );
      const snap = await getDocs(nextQuery);
      if (snap.empty) {
        setHasMoreProducts(false);
        return;
      }
      const newProds = snap.docs.map((d) => ({ id: d.id, ...d.data() as any }));
      setProducts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newProds.filter(p => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });
      setLastProductDoc(snap.docs[snap.docs.length - 1]);
      setHasMoreProducts(snap.docs.length === PRODUCTS_PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more products:", error);
    }
  };

  const loadMoreSales = async () => {
    if (!hasMoreSales || !lastSalesDoc) return;
    try {
      const salesBaseQuery = collection(db, "sales");
      let nextQuery;
      if (profile?.role === "ADMIN") {
        nextQuery = query(
          salesBaseQuery,
          orderBy("createdAt", "desc"),
          startAfter(lastSalesDoc),
          limit(SALES_PAGE_SIZE)
        );
      } else {
        nextQuery = query(
          salesBaseQuery,
          where("branchId", "==", profile?.branchId),
          orderBy("createdAt", "desc"),
          startAfter(lastSalesDoc),
          limit(SALES_PAGE_SIZE)
        );
      }
      
      const snap = await getDocs(nextQuery);
      if (snap.empty) {
        setHasMoreSales(false);
        return;
      }
      const newSales = snap.docs.map((d) => ({ id: d.id, ...d.data() as any }));
      setSales((prev) => {
        const existingIds = new Set(prev.map(s => s.id));
        const filteredNew = newSales.filter(s => !existingIds.has(s.id));
        return [...prev, ...filteredNew];
      });
      setLastSalesDoc(snap.docs[snap.docs.length - 1]);
      setHasMoreSales(snap.docs.length === SALES_PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more sales:", error);
    }
  };

  const handleFullDatabaseSearch = async () => {
    if (!searchTerm || searchTerm.length < 3) return;
    setIsSearchingProducts(true);
    try {
      const searchUpper = searchTerm.toUpperCase();
      // 1. Search by Barcode
      const qBarcode = query(collection(db, "products"), where("barcode", "==", searchTerm));
      const snapBarcode = await getDocs(qBarcode);
      let results = snapBarcode.docs.map(d => ({ id: d.id, ...d.data() as any }));

      // 2. Prefix Search by Name if no barcode match
      if (results.length === 0) {
        const qName = query(
          collection(db, "products"),
          where("name", ">=", searchUpper),
          where("name", "<=", searchUpper + "\uf8ff"),
          limit(20)
        );
        const snapName = await getDocs(qName);
        results = snapName.docs.map(d => ({ id: d.id, ...d.data() as any }));
      }

      if (results.length > 0) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProds = results.filter(r => !existingIds.has(r.id));
          return [...prev, ...newProds];
        });
        // We use the results directly for suggestions
        setSearchSuggestions(results.slice(0, 10));
      } else {
        // Fallback for search phrases
        alert("Pencarian spesifik tidak membuahkan hasil. Silakan cari per kategory di menu Produk.");
      }
    } catch (e) {
      console.error("Full search error:", e);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  const stocks = useMemo(() => {
    const result: any[] = [];
    products.forEach((p) => {
      if (p.stocks) {
        Object.entries(p.stocks).forEach(([branchId, qty]) => {
          result.push({
            id: `${branchId}_${p.id}`,
            productId: p.id,
            branchId,
            qty: qty,
          });
        });
      }
    });
    return result;
  }, [products]);
  const [sales, setSales] = useState<any[]>([]);
  const [hasMoreSales, setHasMoreSales] = useState(true);
  const [lastSalesDoc, setLastSalesDoc] = useState<any>(null);
  const SALES_PAGE_SIZE = 100;
  const [voucherSNs, setVoucherSNs] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<any>({
    allowCashierStockInput: true,
  });
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commissionsSummary, setCommissionsSummary] = useState<any>(null);
  const [branchSummaries, setBranchSummaries] = useState<Record<string, any>>({});
  const [shoppingPlans, setShoppingPlans] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [dailySummaries, setDailySummaries] = useState<any[]>([]);

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "pos"
    | "inventory"
    | "employees"
    | "settings"
    | "branch_stocks"
    | "shopping_list"
    | "audit"
    | "shift"
    | "cashier_stock"
    | "reports"
    | "incentive"
  >("dashboard");
  const [auditSidebarTab, setAuditSidebarTab] = useState<
    "incoming" | "disposal" | "transfer" | "logs"
  >("incoming");
  const [auditProductSearch, setAuditProductSearch] = useState("");
  const [auditSelectedProductId, setAuditSelectedProductId] = useState("");
  const [posSubView, setPosSubView] = useState<
    "billing" | "history" | "maintenance" | "transfer"
  >("billing");
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [quickAuditProduct, setQuickAuditProduct] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // General App States
  const [cart, setCart] = useState<
    { product: any; qty: number; sn?: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [posSelectedCategory, setPosSelectedCategory] = useState("Semua");
  const [posSelectedBrand, setPosSelectedBrand] = useState("Semua");
  const [adminSalesBranchFilter, setAdminSalesBranchFilter] = useState("");
  const [adminLogBranchFilter, setAdminLogBranchFilter] = useState("");

  const [adminSalesDateFilter, setAdminSalesDateFilter] = useState("today");
  const [adminLogDateFilter, setAdminLogDateFilter] = useState("today");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportSubTab, setReportSubTab] = useState<"summary" | "excel">("summary");
  const [reportEndDate, setReportEndDate] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [scanIndicator, setScanIndicator] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<"overview" | "sales" | "inventory">("overview");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [isProcessingStock, setIsProcessingStock] = useState(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);

  // Helper to attribute commissions correctly even with rolling shifts (shared device)
  const isCommissionForUser = (c: any, u: any) => {
    if (!u) return false;
    if (c.cashierName) {
      const isMatch = c.cashierName === u.name || (u.alternativeNames && u.alternativeNames.includes(c.cashierName));
      return isMatch && c.branchId === u.branchId;
    }
    return c.cashierId === u.id;
  };

  const getMyCommissions = () => {
    return commissions.filter(c => c.branchId === profile?.branchId);
  };

  const [shiftOpen, setShiftOpen] = useState(() => {
    try {
      return localStorage.getItem("shift_open") === "true";
    } catch {
      return false;
    }
  });
  const [cashierName, setCashierName] = useState(() => {
    try {
      return (
        (typeof window !== "undefined"
          ? localStorage.getItem("cashier_name")
          : "") || ""
      );
    } catch {
      return "";
    }
  });
  const [shiftType, setShiftType] = useState<"Pagi" | "Malam" | null>(() => {
    try {
      return localStorage.getItem("shift_type") as any;
    } catch {
      return null;
    }
  });
  const [shiftStartTime, setShiftStartTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem("shift_start_time");
    } catch {
      return null;
    }
  });
  const [shiftLogicalDate, setShiftLogicalDate] = useState(() => {
    try {
      return localStorage.getItem("shift_logical_date") || "";
    } catch {
      return "";
    }
  });
  const [isOnline, setIsOnline] = useState(true);

  const bestSellers = useMemo(() => {
    const salesMap = new Map<string, number>();
    sales.filter(s => s.status !== "refunded").forEach(s => {
      s.items?.forEach((it: any) => {
        salesMap.set(it.productId, (salesMap.get(it.productId) || 0) + it.qty);
      });
    });

    return products
      .filter(p => !p.visibleBranchIds || p.visibleBranchIds === "*" || (profile?.branchId && p.visibleBranchIds.split(",").map((id: string) => id.trim()).includes(profile.branchId)))
      .map(p => ({ ...p, totalSold: salesMap.get(p.id) || 0 }))
      .filter(p => p.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 6)
      .sort((a, b) => a.sellingPrice - b.sellingPrice);
  }, [products, sales, profile?.branchId]);
  const [showShiftSummary, setShowShiftSummary] = useState<number | null>(null);
  const [actualCashInput, setActualCashInput] = useState<string>("");
  const [checkoutSuccessData, setCheckoutSuccessData] = useState<{ total: number; itemsCount: number; timestamp: string; branchId?: string } | null>(null);
  const [globalAlerts, setGlobalAlerts] = useState<{ id: string; message: string; type: "info" | "warning" | "success" }[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ message: string; resolve: (res: boolean) => void } | null>(null);

  // Expose async confirm triggers globally
  const triggerConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({ message, resolve });
    });
  };

  useEffect(() => {
    const handleCustomAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: "info" | "warning" | "success" }>;
      const message = customEvent.detail?.message || String(customEvent.detail);
      const type = customEvent.detail?.type || "info";
      
      const id = Math.random().toString(36).substring(2, 9);
      setGlobalAlerts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss
      setTimeout(() => {
        setGlobalAlerts((prev) => prev.filter((a) => a.id !== id));
      }, 5000);
    };

    window.addEventListener("app-custom-alert" as any, handleCustomAlert);

    // Override original window.alert safety
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      // Dispatches custom event
      window.dispatchEvent(
        new CustomEvent("app-custom-alert", {
          detail: { message: msg, type: "info" }
        })
      );
    };

    return () => {
      window.removeEventListener("app-custom-alert" as any, handleCustomAlert);
      window.alert = originalAlert;
    };
  }, []);

  const getProductName = (p: any, fallback?: string) => {
    if (!p) return fallback || "Bonus";
    const provider = p.provider || p.brand || "";
    let displayName = p.name || fallback || "Produk";
    
    // Enhanced names for Voucher/Perdana
    if (p.category === "Voucher" || p.category?.includes("Perdana")) {
      if (displayName.toLowerCase().startsWith("voucher")) {
        displayName = displayName.replace(/voucher/i, provider || "Voucher").trim();
      } else if (provider && !displayName.toLowerCase().includes(provider.toLowerCase())) {
        displayName = `${provider} ${displayName}`.trim();
      }
    }
    return displayName;
  };

  const getShiftTypePref = (type?: string) => {
    if (!type) return "";
    if (type.includes(" - ")) return type.split(" - ")[0];
    return type;
  };

  const getShiftKeeperName = (sh: any) => {
    if (!sh) return "Kasir";
    if (sh.shiftType && sh.shiftType.includes(" - ")) return sh.shiftType.split(" - ")[1];
    return sh.cashier?.name || "Kasir";
  };

  const getSaleCashierName = (sale: any) => {
    if (!sale) return "Kasir";
    if (sale.cashierName) return sale.cashierName;
    if (!sale.createdAt) return sale.cashier?.name || "Kasir";
    
    const saleTime = new Date(sale.createdAt).getTime();
    const activeShift = shifts.find((sh: any) => {
      if (sh.branchId !== sale.branchId) return false;
      const openTime = new Date(sh.openTime).getTime();
      const closeTime = sh.closeTime ? new Date(sh.closeTime).getTime() : Date.now() + 60000;
      return saleTime >= openTime && saleTime <= closeTime;
    });
    if (activeShift) {
      return getShiftKeeperName(activeShift);
    }
    return sale.cashier?.name || "Kasir";
  };

  const getCommissionCashierName = (comm: any) => {
    if (!comm) return "Karyawan";
    if (comm.cashierName) return comm.cashierName;
    const commTime = new Date(comm.createdAt).getTime();
    const activeShift = shifts.find((sh: any) => {
      if (sh.branchId !== comm.branchId) return false;
      const openTime = new Date(sh.openTime).getTime();
      const closeTime = sh.closeTime ? new Date(sh.closeTime).getTime() : Date.now() + 60000;
      return commTime >= openTime && commTime <= closeTime;
    });
    if (activeShift) {
      return getShiftKeeperName(activeShift);
    }
    return comm.cashier?.name || "Karyawan";
  };

  useEffect(() => {
    // connectivity check
    const checkConn = async () => {
      try {
        const res = await api.getHealth();
        setIsOnline(res.status === "ok");
      } catch {
        setIsOnline(false);
      }
    };
    checkConn();
    const interval = setInterval(checkConn, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist Shift
  useEffect(() => {
    try {
      localStorage.setItem("shift_open", shiftOpen.toString());
      localStorage.setItem("cashier_name", cashierName);
      if (shiftType) localStorage.setItem("shift_type", shiftType);
      else localStorage.removeItem("shift_type");
      if (shiftStartTime)
        localStorage.setItem("shift_start_time", shiftStartTime);
      else localStorage.removeItem("shift_start_time");
      if (shiftLogicalDate)
        localStorage.setItem("shift_logical_date", shiftLogicalDate);
      else localStorage.removeItem("shift_logical_date");
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }, [shiftOpen, cashierName, shiftType, shiftStartTime, shiftLogicalDate]);

  // Handle Initial Redirect based on Role
  useEffect(() => {
    if (profile && activeMenu === "dashboard") {
      if (profile?.role === "CASHIER") setActiveMenu("pos");
      if (profile?.role === "AUDIT") setActiveMenu("audit");
    }
  }, [profile]);

  useEffect(() => {
    if (activeMenu === "shift" && !shiftOpen) {
      const hour = new Date().getHours();
      setShiftType(hour >= 7 && hour < 19 ? "Pagi" : "Malam");
      if (!cashierName && profile?.name) {
        setCashierName(profile.name);
      }
    }
  }, [activeMenu, shiftOpen, profile, cashierName]);

  // Form States
  const [newBranch, setNewBranch] = useState("");
  const [auditSelectedBranch, setAuditSelectedBranch] = useState("");
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [transferDrillPath, setTransferDrillPath] = useState<string[]>([]);
  const [transferSearch, setTransferSearch] = useState("");
  const [selectedTransferProduct, setSelectedTransferProduct] =
    useState<any>(null);
  const [shoppingListBranch, setShoppingListBranch] = useState("");
  const [shoppingListCategory, setShoppingListCategory] = useState("");
  const [hiddenShoppingBranchIds, setHiddenShoppingBranchIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hiddenShoppingBranchIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleBranchShoppingHidden = (branchId: string) => {
    setHiddenShoppingBranchIds((prev) => {
      const next = prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId];
      localStorage.setItem("hiddenShoppingBranchIds", JSON.stringify(next));
      return next;
    });
  };

  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planDraftItems, setPlanDraftItems] = useState<
    { productId: string; branchQtys: { [bid: string]: string } }[]
  >([]);
  const [planDraftTitle, setPlanDraftTitle] = useState("");

  // Product Form States
  const [showProductForm, setShowProductForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserDraft, setNewUserDraft] = useState({ username: "", password: "", name: "", role: "CASHIER", branchId: "" });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerCallback, setScannerCallback] = useState<
    (code: string) => void
  >(() => {});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Voucher Batch Input
  const [showVoucherAudit, setShowVoucherAudit] = useState<any>(null); // Current product being audited for SN
  const [scannedSNs, setScannedSNs] = useState<string[]>([]);

  const [prodCategory, setProdCategory] = useState("Aksesoris");
  const [prodSubCategory, setProdSubCategory] = useState("Kabel Data");
  const [prodBrand, setProdBrand] = useState("Robot");
  const [prodProvider, setProdProvider] = useState("Telkomsel");
  const [prodType, setProdType] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCapital, setProdCapital] = useState("");
  const [prodSell, setProdSell] = useState("");
  const [prodDiscount, setProdDiscount] = useState("");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodExpiredAt, setProdExpiredAt] = useState("");
  const [prodMinStock, setProdMinStock] = useState("0");
  const [prodCommission, setProdCommission] = useState("0");
  const [prodMasterSN, setProdMasterSN] = useState("");
  const [prodVisibleBranchIds, setProdVisibleBranchIds] = useState<string>("*");

  const PRODUCT_HIERARCHY = {
    "Aksesoris": {
      brands: ["Robot", "Vivan", "Foomee", "Oraimo", "Baseus", "Anker", "Jete", "Lenyes", "Kivee", "Olike", "Rexsi", "Acome", "Ugreen", "Newest"],
      models: ["Charger", "Kepala Charger", "Flashdisk", "Headset", "Headset Bluetooth", "Kabel Data", "Powerbank", "Tempered Glass", "Speaker", "Casing"]
    },
    "Voucher": {
      providers: ["Telkomsel", "Indosat", "XL", "Axis", "Tri", "Smartfren"]
    },
    "Kartu Perdana Kuota": {
      providers: ["Telkomsel", "Indosat", "XL", "Axis", "Tri", "Smartfren"]
    },
    "Kartu Perdana Biasa": {
      providers: ["Telkomsel", "Indosat", "XL", "Axis", "Tri", "Smartfren"]
    },
    "Handphone": {
      brands: {
        "Samsung": ["Galaxy S24", "Galaxy A55", "Galaxy A35", "Galaxy S23"],
        "iPhone": ["iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12"],
        "Xiaomi": ["Redmi Note 13", "Xiaomi 13T", "Poco X6"],
        "Vivo": ["V30", "Y27", "Y17s"],
        "Oppo": ["Reno 11", "A98", "A58"],
        "Realme": ["12 Pro+", "C67", "C55"],
        "Infinix": ["Note 40", "Hot 40", "Smart 8"],
        "Redmi": ["Note 12", "12", "10"]
      }
    }
  };

  const DEFAULT_CATEGORIES = [
    "Aksesoris",
    "Voucher",
    "Kartu Perdana Kuota",
    "Kartu Perdana Biasa",
    "Handphone",
    "Parfum",
    "Lain-lain"
  ];
  const BRANDS = [
    "Robot",
    "Vivan",
    "Rexsi",
    "Kivee",
    "Olike",
    "Oraimo",
    "Foomee",
    "Grotic",
    "Lenyes",
    "Jete",
    "Baseus",
    "Acome",
    "Ugreen",
    "Newest",
  ];
  const PROVIDERS = [
    "Telkomsel",
    "Indosat",
    "XL",
    "Smartfren",
    "Tri",
    "Axis",
  ];
  const ACC_SUB_CATEGORIES = [
    "Kabel Data",
    "Charger",
    "Kepala Charger",
    "Headset",
    "Headset Bluetooth",
    "Handsfree",
    "Powerbank",
    "Tempered Glass",
    "Speaker",
    "Casing",
    "Baterai",
    "Flashdisk",
  ];

  // Dynamic Suggestion Lists for Product Form
  const dynamicCategories = useMemo(() => {
    const existing = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...existing]));
  }, [products]);

  const dynamicBrands = useMemo(() => {
    if (prodCategory === "Aksesoris") return PRODUCT_HIERARCHY["Aksesoris"].brands;
    if (prodCategory === "Handphone") return Object.keys(PRODUCT_HIERARCHY["Handphone"].brands);
    if (["Voucher", "Kartu Perdana Kuota", "Kartu Perdana Biasa"].includes(prodCategory))
      return PRODUCT_HIERARCHY["Voucher"].providers;
    
    const existing = products.map((p) => p.brand).filter(Boolean);
    return Array.from(new Set([...BRANDS, ...existing]));
  }, [products, prodCategory]);

  const dynamicSubCategories = useMemo(() => {
    if (prodCategory === "Aksesoris") {
      return PRODUCT_HIERARCHY["Aksesoris"].models;
    }
    if (prodCategory === "Handphone" && prodBrand && PRODUCT_HIERARCHY["Handphone"].brands[prodBrand]) {
      return PRODUCT_HIERARCHY["Handphone"].brands[prodBrand];
    }
    return [];
  }, [products, prodCategory, prodBrand]);

  const dynamicProviders = useMemo(() => {
    if (["Voucher", "Kartu Perdana Kuota", "Kartu Perdana Biasa"].includes(prodCategory))
      return PRODUCT_HIERARCHY["Voucher"].providers;
    
    const existing = products.map((p) => p.provider).filter(Boolean);
    return Array.from(new Set([...PROVIDERS, ...existing]));
  }, [products, prodCategory]);


  // Derive all categories present in products + defaults
  const ALL_CATEGORIES = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...products
      .filter(p => p.category && p.category !== "UMUM" && p.category !== "LAINNYA")
      .map(p => p.category!)
  ])).filter(c => c !== "UMUM" && c !== "LAINNYA");

  // Auto-focus search input in POS
  useEffect(() => {
    if (activeMenu === "pos" && shiftOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeMenu, shiftOpen]);

  // Global Key Listener for Quick Search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (activeMenu === "pos" && shiftOpen && searchInputRef.current) {
        // If not in an input, focus the search input
        if (document.activeElement?.tagName !== "INPUT" && e.key.length === 1) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [activeMenu, shiftOpen]);

  // Enhanced search and sort by price logic
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (!val) {
      setSearchSuggestions([]);
      return;
    }

    const searchLower = val.toLowerCase();
    const searchWords = searchLower.split(/\s+/).filter(Boolean);

    const filtered = products
      .filter((p) => {
        if (!p) return false;

        // Visibility check
        const visibleIds = p.visibleBranchIds || "*";
        const isVisible = visibleIds === "*" || (profile?.branchId && visibleIds.split(",").map((id: string) => id.trim()).includes(profile.branchId));
        if (!isVisible && profile?.role !== "ADMIN") return false; 

        const name = (p.name || "").toLowerCase();
        const barcode = (p.barcode || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const provider = (p.provider || "").toLowerCase();

        return searchWords.every(word => 
          name.includes(word) || 
          barcode.includes(word) || 
          type.includes(word) ||
          brand.includes(word) ||
          category.includes(word) ||
          provider.includes(word)
        );
      })
      .sort((a, b) => {
        // Price comparison (Lowest to Highest)
        const getPrice = (p: any) => p.discountPrice > 0 ? p.discountPrice : p.sellingPrice;
        const priceA = getPrice(a);
        const priceB = getPrice(b);
        
        if (priceA !== priceB) return priceA - priceB;
        
        // Secondary sort: Relevance (starts with)
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        const startsA = nameA.startsWith(searchLower);
        const startsB = nameB.startsWith(searchLower);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        return nameA.localeCompare(nameB);
      })
      .slice(0, 15);
    setSearchSuggestions(filtered);
  };

  // Setup Firebase Listeners
  const naturalSort = (a: string, b: string) => {
    return (a || "").localeCompare(b || "", undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const formatDateLocal = (dateInput: any) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b])), [branches]);

  const branchModalData = useMemo(() => {
    return branches
      .map((b) => {
        const branchStocks = stocks.filter((s) => s.branchId === b.id);
        const totalModal = branchStocks.reduce((sum, s) => {
          const prod = productMap.get(s.productId) as any;
          return sum + (prod?.purchasePrice || 0) * (s.qty || 0);
        }, 0);
        const totalItems = branchStocks.reduce(
          (sum, s) => sum + (s.qty || 0),
          0,
        );
        return { ...b, totalModal, totalItems };
      })
      .sort((a, b) => naturalSort(a.name, b.name));
  }, [branches, stocks, products, productMap]);

  // --- SUMMARIES ---
  // Managed by loadData in main sync useEffect

  // --- CORE SYSTEM LISTENERS ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.getMe();
          setProfile(userData);
          const [bData, pData, cData] = await Promise.all([
            api.getBranches(),
            api.getProducts(),
            fetch("/api/config", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }).then((res) => res.json()),
          ]);
          setBranches(
            bData.sort((a: any, b: any) =>
              (a.name || "").localeCompare(b.name || ""),
            ),
          );
          setProducts(pData);
          setAppConfig(cData);
          setAuthLoading(false);
        } catch (err) {
          localStorage.removeItem("token");
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // --- REAL-TIME SYNC ---
  useEffect(() => {
    const socket = io();

    socket.on("saleProcessed", (data: { items: any[] }) => {
      // Update local products state with new stock values
      setProducts(prev => prev.map(product => {
        const soldItem = data.items.find(item => item.productId === product.id);
        if (soldItem) {
          const newStocks = { ...product.stocks };
          const branchId = soldItem.branchId;
          newStocks[branchId] = (newStocks[branchId] || 0) - soldItem.qty;
          return { ...product, stocks: newStocks };
        }
        return product;
      }));
    });

    socket.on("productUpdated", (updatedProduct: any) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
    });

    socket.on("productDeleted", (data: { id: string }) => {
      setProducts(prev => prev.filter(p => p.id !== data.id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- AUTH HANDLERS ---
  const handleLoginSubmit = async (credentials: any) => {
    setAuthLoading(true);
    try {
      const { user: userData } = await api.login(credentials);
      setProfile(userData);
      const [bData, pData] = await Promise.all([api.getBranches(), api.getProducts()]);
      setBranches(bData.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' })));
      setProducts(pData);
      if (userData.role === "ADMIN") setActiveMenu("dashboard");
      else if (userData.role === "AUDIT") setActiveMenu("audit");
      else if (userData.role === "CASHIER") setActiveMenu("pos");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const { user: userData } = await api.loginWithGoogle(idToken);
      setProfile(userData);
      const [bData, pData] = await Promise.all([api.getBranches(), api.getProducts()]);
      setBranches(bData.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' })));
      setProducts(pData);
      if (userData.role === "ADMIN") setActiveMenu("dashboard");
      else if (userData.role === "AUDIT") setActiveMenu("audit");
      else if (userData.role === "CASHIER") setActiveMenu("pos");
    } catch (err: any) {
      alert("Google Login Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAppLogout = () => {
    localStorage.removeItem("token");
    setProfile(null);
    setActiveMenu("pos");
  };

  // Effect to reset UI states when menu changes
  useEffect(() => {
    setShowUserForm(false);
  }, [activeMenu]);

  // --- BRANCH & ROLE DEPENDENT DATA LISTENERS ---
  const lastEffectiveBranchId = useRef<string | null>(null);

  // --- DATA SYNC (Stocks, Sales, Summaries, etc.) ---
  // Reacts only to filter changes, not every menu click
  const shopListAlertCount = useMemo(() => {
    if (profile?.role !== "ADMIN") return 0;
    let alertCount = 0;
    products.forEach((p) => {
      if (p.minStock > 0) {
        const visibleIds = p.visibleBranchIds || "*";
        branches.forEach((b) => {
          // Check if branch is disabled/hidden from shopping list
          if (hiddenShoppingBranchIds.includes(b.id)) return;

          const isProductVisibleInBranch = visibleIds === "*" || visibleIds.split(",").map((id: string) => id.trim()).includes(b.id);
          if (!isProductVisibleInBranch) return;

          const s = stocks.find(st => st.branchId === b.id && st.productId === p.id);
          if ((s ? s.qty : 0) <= p.minStock) alertCount++;
        });
      }
    });
    return alertCount;
  }, [products, branches, stocks, profile, hiddenShoppingBranchIds]);

  useEffect(() => {
    if (!profile || profile.role === "PENDING") return;

    const isAdmin = profile.role === "ADMIN";
    
    // Determine target branch for data sync
    let effectiveBranchId = profile.branchId;
    if (activeMenu === "audit") {
      effectiveBranchId = auditSelectedBranch || (isAdmin ? "" : "N/A");
    } else if (isAdmin) {
      effectiveBranchId = adminSalesBranchFilter;
    }

    const loadData = async () => {
      try {
        // Memuat sebagian secara parallel, sebagian berurutan agar tidak overload koneksi
        const pData = await api.getProducts().catch(e => { console.error("Products Load Error:", e); return products; });
        const sData = await api.getSales({ branchId: effectiveBranchId }).catch(e => { console.error("Sales Load Error:", e); return sales; });
        const cData = await api.getCommissions({ branchId: effectiveBranchId }).catch(e => { console.error("Commissions Load Error:", e); return commissions; });
        
        const [shData, uData, aData, dsData] = await Promise.all([
          api.getShifts({ branchId: effectiveBranchId }).catch(e => { console.error("Shifts Load Error:", e); return shifts; }),
          api.getUsers().catch(e => { console.error("Users Load Error:", e); return users; }),
          api.getAdjustments().catch(e => { console.error("Adjustments Load Error:", e); return adjustments; }),
          api.getDailySummaries().catch(e => { console.error("Daily Summaries Load Error:", e); return dailySummaries; })
        ]);
        
        setProducts(pData);
        setSales(sData);
        setCommissions(cData);
        setShifts(shData);
        setUsers(uData);
        setAdjustments(aData);
        setDailySummaries(dsData || []);
        
        // --- RESTORE OPEN SHIFT FROM DATABASE ---
        if (profile?.branchId) {
          const openShift = shData.find((s: any) => s.status === "open" && s.branchId === profile?.branchId);
          
          if (openShift) {
             setShiftOpen(true);
             const type = openShift.shiftType || "Pagi";
             let parsedType = type;
             let parsedName = openShift.cashier?.name || "Kasir";
             if (type.includes(" - ")) {
                 const parts = type.split(" - ");
                 parsedType = parts[0];
                 parsedName = parts[1];
             }
             setShiftType(parsedType as any);
             setCashierName(parsedName);
             setShiftStartTime(openShift.openTime);
             setShiftLogicalDate(openShift.shiftDate);
             
             localStorage.setItem("shift_open", "true");
             localStorage.setItem("current_shift_id", openShift.id);
             localStorage.setItem("shift_type", parsedType);
             localStorage.setItem("cashier_name", parsedName);
             localStorage.setItem("shift_start_time", openShift.openTime);
             localStorage.setItem("shift_logical_date", openShift.shiftDate);
          } else {
             // Jika di lokal buka pencatuman, tapi di DB sudah tutup/hapus, maka sinkronisasi paksa
             if (localStorage.getItem("shift_open") === "true") {
                 setShiftOpen(false);
                 setCashierName("");
                 setShiftType(null);
                 setShiftStartTime(null);
                 localStorage.removeItem("shift_open");
                 localStorage.removeItem("current_shift_id");
             }
          }
        }
        
        // Also sync commission summaries
        if (isAdmin) {
          syncCommissionsSummary(); // Get global summary for owner
        } else {
          syncCommissionsSummary(profile?.branchId || undefined); // Get branch summary for cashier
        }
      } catch (err) {
        console.error("General data load error:", err);
      }
    };

    loadData();

    // Setup Sockets for real-time updates
    const socket = io();
    socket.on("saleProcessed", () => loadData());
    socket.on("productUpdated", () => loadData());
    socket.on("stockUpdated", () => loadData());

    return () => {
      socket.disconnect();
    };
  }, [
    profile?.id, profile?.role, profile?.branchId, 
    activeMenu === "dashboard", activeMenu === "audit", activeMenu === "reports", 
    adminSalesBranchFilter, auditSelectedBranch,
    branches.length
  ]);




  const syncCommissionsSummary = async (targetBranchId?: string) => {
    try {
      const summary = await api.getCommissionSummary(targetBranchId);
      
      // Map server response { total, byBranch } to what the app expects
      const formattedSummary = {
        ...summary,
        totalEarned: summary.total // Fix mismatch in property name
      };
      
      setCommissionsSummary(formattedSummary);

      // If we got byBranch data, update the overall branchSummaries state
      if (summary.byBranch) {
        const newBranchSummaries: Record<string, any> = {};
        Object.entries(summary.byBranch).forEach(([bid, amount]) => {
          newBranchSummaries[bid] = { totalEarned: amount };
        });
        setBranchSummaries(newBranchSummaries);
      }
    } catch (err) {
      console.error("Sync Commissions Summary Error:", err);
    }
  };

  useEffect(() => {
    if (
      branches.length > 0 &&
      !auditSelectedBranch &&
      (profile?.role === "AUDIT" || profile?.role === "ADMIN")
    ) {
      setAuditSelectedBranch(profile?.branchId || branches[0]?.id || "");
    }
  }, [branches, profile, auditSelectedBranch]);

  // Handle Global Barcode Scanner
  useBarcodeScanner((barcode) => {
    if (!profile) return;
    setScanIndicator(barcode);
    setTimeout(() => setScanIndicator(null), 2000);

    if (showProductForm) {
      setProdBarcode(barcode);
      return;
    }

    if (profile?.role === "CASHIER" && activeMenu === "pos" && shiftOpen) {
      // Priority 1: Check Master Barcode
      const productByBarcode = products.find((p) => p.barcode === barcode);
      if (productByBarcode) {
        addToCart(productByBarcode);
        return;
      }

      // Priority 2: Check SN Master field (for Vouchers)
      const productByMasterSN = products.find((p) => p.masterSN === barcode);
      if (productByMasterSN) {
        addToCart(productByMasterSN);
        return;
      }
    } else if (activeMenu === "audit") {
      if (!auditSelectedBranch) return;
      
      const product = products.find((p) => p.barcode === barcode || p.masterSN === barcode);
      if (product) {
        setQuickAuditProduct(product);
      } else {
        setSearchTerm(barcode);
      }
    } else {
      setSearchTerm(barcode); // Auto-filter table
    }
  });

  // --- ACTIONS ---

  // Admin: Update User Role/Branch
  const updateUser = async (uid: string, field: string, value: string) => {
    try {
      await api.updateUser(uid, { [field]: value });
      const [uData] = await Promise.all([api.getUsers()]);
      setUsers(uData);
    } catch(err) {
      console.error(err);
      alert("Gagal update karyawan");
    }
  };

  const deleteUser = async (uid: string, name: string) => {
    if (uid === user?.uid)
      return alert("Anda tidak bisa menghapus akun Anda sendiri!");
    if (
      !window.confirm(
        `Hapus akses karyawan "${name || "Tanpa Nama"}" secara permanen?`,
      )
    )
      return;
    try {
      await api.deleteUser(uid);
      const uData = await api.getUsers();
      setUsers(uData);
      alert("Karyawan berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus karyawan.");
    }
  };

  const handleCreateUser = async () => {
    if (!newUserDraft.username || !newUserDraft.password || !newUserDraft.name) {
      return alert("Mohon lengkapi data user.");
    }
    try {
      // Ensure empty branchId is null for consistency
      const payload = {
        ...newUserDraft,
        branchId: newUserDraft.branchId === "" ? null : newUserDraft.branchId
      };
      await api.register(payload);
      const uData = await api.getUsers();
      setUsers(uData);
      setShowUserForm(false);
      setNewUserDraft({ username: "", password: "", name: "", role: "CASHIER", branchId: "" });
      alert("Akun berhasil ditambahkan!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menambah akun.");
    }
  };

  // Admin: Add Branch
  const handleAddBranch = async () => {
    if (!newBranch.trim()) return;
    try {
      await fetch('/api/branches', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
              name: newBranch,
              address: 'Baru',
              phone: ''
          })
      });
      setNewBranch("");
      const bData = await api.getBranches();
      setBranches(bData.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' })));
    } catch(err) {
      console.error(err);
    }
  };

  const currentBranchData = branches.find((b) => b.id === profile?.branchId);
  const drawerCashValue = currentBranchData?.drawerCash || 0;

  // Admin: Save New or Edit Product Master
  const generateAutoBarcode = () => {
    const prefix =
      prodCategory === "Aksesoris"
        ? "ACC"
        : prodCategory === "Voucher"
          ? ""
          : "PRD";
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}${random}`;
  };

  const handleCleanupAdjustments = async () => {
    if (profile?.role !== "ADMIN") return;
    if (!window.confirm("Hapus riwayat penyesuaian stok (adjustments) lama?")) return;
    
    try {
      await api.cleanupAdjustments();
      alert("Riwayat penyesuaian stok berhasil dibersihkan!");
      // Refresh adjustments if needed
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal membersihkan riwayat.");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate barcode if empty
    let finalBarcode = prodBarcode;
    if (!finalBarcode.trim()) {
      finalBarcode = generateAutoBarcode();
    }

    if (!prodType || !prodCapital || !prodSell) {
      alert("Mohon lengkapi field wajib: Tipe/Nama, Modal & Harga Jual!");
      return;
    }

    let generatedName = prodType;
    if (prodCategory === "Aksesoris") {
      generatedName = `${prodBrand} - ${prodSubCategory} - ${prodType}`;
    } else if (prodCategory === "Voucher") {
      generatedName = `Voucher ${prodProvider} - ${prodType}`;
    } else {
      generatedName = `${prodCategory} ${prodProvider} - ${prodType}`;
    }

    try {
      // Duplicate detection
      const duplicateName = products.find(p => p.name.toLowerCase() === generatedName.toLowerCase() && (!editingProduct || p.id !== editingProduct.id));
      const duplicateBarcode = products.find(p => p.barcode === finalBarcode && (!editingProduct || p.id !== editingProduct.id));
      
      if (duplicateName) {
        if (!window.confirm(`Produk dengan nama "${generatedName}" sudah ada. Tetap lanjutkan?`)) return;
      }
      
      if (duplicateBarcode) {
        alert(`Gagal: Barcode/SN "${finalBarcode}" sudah digunakan oleh produk lain!`);
        return;
      }

      const data = {
        name: generatedName,
        category: prodCategory,
        brand: prodBrand,
        provider: prodProvider,
        subCategory: prodSubCategory,
        barcode: finalBarcode,
        masterSN: prodMasterSN,
        visibleBranchIds: prodVisibleBranchIds,
        status: "ACTIVE",
        description: prodDesc,
        purchasePrice: Number(prodCapital),
        sellingPrice: Number(prodSell),
        discountPrice: Number(prodDiscount) || 0,
        expiredAt: prodExpiredAt || null,
        minStock: Number(prodMinStock) || 0,
        commissionAmount: Number(prodCommission) || 0,
        unit: "Pcs",
      };

      if (editingProduct) {
        // For simplicity, using same create endpoint or I could add PUT
        await api.createProduct({ ...data, id: editingProduct.id }); 
        alert("Master produk berhasil diperbarui!");
      } else {
        await api.createProduct(data);
        alert("Master produk berhasil disimpan!");
      }

      // Refresh products
      const pData = await api.getProducts();
      setProducts(pData);

      setShowProductForm(false);
      setEditingProduct(null);
      setProdType("");
      setProdDesc("");
      setProdCapital("");
      setProdSell("");
      setProdDiscount("");
      setProdBarcode("");
      setProdExpiredAt("");
      setProdMinStock("0");
      setProdCommission("0");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Hapus master produk "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Produk berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus produk.");
    }
  };

  const startEditing = (p: any) => {
    setEditingProduct(p);
    setProdCategory(p.category || "Aksesoris");
    setProdSubCategory(p.subCategory || "Kabel Data");
    setProdBrand(p.brand || "Robot");
    setProdProvider(p.provider || "Telkomsel");
    setProdType(p.name.split(" - ").pop() || ""); // Guessing type from generated name
    setProdDesc(p.description || "");
    setProdCapital(p.purchasePrice?.toString() || "");
    setProdSell(p.sellingPrice?.toString() || "");
    setProdDiscount(p.discountPrice?.toString() || "");
    setProdBarcode(p.barcode || "");
    setProdMasterSN(p.masterSN || "");
    setProdExpiredAt(p.expiredAt || "");
    setProdMinStock(p.minStock?.toString() || "0");
    setProdCommission(p.commissionAmount?.toString() || "0");
    setProdVisibleBranchIds(p.visibleBranchIds || "*");
    setShowProductForm(true);
  };

  // Audit: Update Physical Stock for selected branch
  const handleAuditStock = async (productId: string, qtyStr: string) => {
    if (!auditSelectedBranch) return alert("Pilih Cabang Dulu!");
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const qty = parseInt(qtyStr);
    if (isNaN(qty)) return;

    const oldQty = (product.stocks || {})[auditSelectedBranch] || 0;
    
    if (qty === oldQty) return;

    try {
      await api.adjustStock({
        branchId: auditSelectedBranch,
        productId,
        newQty: qty,
        oldQty: oldQty,
        reason: "Opname Stok (Tabel Audit)",
        type: qty > oldQty ? "STOCK_IN" : "STOCK_OUT",
        cashierId: profile?.id
      });
      // Refresh local products
      const pData = await api.getProducts();
      setProducts(pData);
    } catch (e: any) {
      console.error(e);
      alert("Gagal update stok.");
    }
  };

  const handleSaveVoucherSNs = async () => {
    if (!auditSelectedBranch || !showVoucherAudit) return;
    if (scannedSNs.length === 0) return alert("Belum ada SN yang di-scan!");

    try {
      await api.bulkVouchers({
        branchId: auditSelectedBranch,
        productId: showVoucherAudit.id,
        sns: scannedSNs,
        productName: showVoucherAudit.name
      });

      // Refresh data
      const pData = await api.getProducts();
      setProducts(pData);
      
      setShowVoucherAudit(null);
      setScannedSNs([]);
      alert(`Berhasil Menambahkan ${scannedSNs.length} Voucher Baru!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menyimpan SN Voucher.");
    }
  };

  const removeScannedSN = (idx: number) => {
    setScannedSNs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cashier: Cart Logic
  const getBranchStock = (branchId: string, productId: string) => {
    const s = stocks.find(
      (s) => s.branchId === branchId && s.productId === productId,
    );
    return s ? s.qty : 0;
  };

  const addToCart = (product: any) => {
    if (!shiftOpen) {
      alert("Shift belum dibuka! Harap Buka Shift terlebih dahulu sebelum melayani transaksi.");
      setActiveMenu("shift");
      return;
    }

    const availableStock = getBranchStock(profile?.branchId || "", product.id);
    setCart((prev) => {
      const exists = prev.find(
        (item) => item.product.id === product.id,
      );
      const currentQty = prev
        .filter((i) => i.product.id === product.id)
        .reduce((s, x) => s + x.qty, 0);

      if (currentQty + 1 > availableStock) {
        alert("Stok Cabang Tidak Mencukupi!");
        return prev;
      }

      if (exists)
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    const availableStock = getBranchStock(profile?.branchId || "", id);
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const newQty = item.qty + delta;
          if (newQty > availableStock) {
            alert("Melebihi Stok!");
            return item;
          }
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId: string, sn?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.sn === sn)),
    );
  };

  const handleRefund = async (sale: any) => {
    console.log("handleRefund called", sale);
    
    if (!sale) {
       alert("Error: Data penjualan tidak ditemukan. Hubungi pengembang.");
       return;
    }
    
    if (sale.status === "refunded") return alert("Transaksi ini sudah di-refund.");
    const confirmRefund = await triggerConfirm("Refund seluruh transaksi ini? Stok akan dikembalikan ke cabang.");
    if (!confirmRefund) return;

    setIsProcessingRefund(true);
    try {
      await api.refundSale(sale.id);
      
      // Update local state
      setSales(prev => prev.map(s => s.id === sale.id ? { ...s, status: "refunded" } : s));
      
      // Refresh products to show updated stocks
      const pData = await api.getProducts();
      setProducts(pData);
      
      alert("Transaksi berhasil di-refund!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal melakukan refund.");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleStockAdjustment = async (
    productId: string,
    qty: number,
    reason?: string,
    targetBranchId?: string,
  ) => {
    const branchId = targetBranchId || profile?.branchId;
    if (!branchId || qty <= 0) return;
    try {
      const p = products.find(p => p.id === productId);
      const currentStock = (p?.stocks || {})[branchId] || 0;
      
      if (currentStock < qty) {
        throw new Error(
          `Stok saat ini (${currentStock}) tidak mencukupi untuk pemusnahan/pengurangan sebesar ${qty}!`,
        );
      }

      await api.adjustStock({
        productId,
        branchId,
        qty: -qty,
        type: "STOCK_OUT",
        reason: reason || "Koreksi Stok / Pemusnahan",
        cashierId: profile?.id
      });
      const pData = await api.getProducts();
      setProducts(pData);
      alert("Pemusnahan Stok Berhasil Dicatat.");
    } catch (err: any) {
      alert(err.message || "Gagal Update Stok");
    }
  };

  const handleStockAddition = async (
    productId: string,
    qty: number,
    supplier?: string,
    targetBranchId?: string,
  ) => {
    const branchId = targetBranchId || profile?.branchId;
    if (!branchId || qty <= 0 || isProcessingStock) return;
    setIsProcessingStock(true);
    try {
      await api.adjustStock({
        productId,
        branchId,
        qty: qty,
        type: "STOCK_IN",
        reason: supplier
          ? `Input Cabang via: ${supplier}`
          : "Penambahan Stok Cabang",
        cashierId: profile?.id
      });
      const pData = await api.getProducts();
      setProducts(pData);
      alert("Stok Berhasil Ditambahkan.");
    } catch (err: any) {
      alert(err.message || "Gagal Update Stok");
    } finally {
      setIsProcessingStock(false);
    }
  };

  const handleStockTransfer = async (
    productId: string,
    qty: number,
    targetBranchId: string,
    sourceBranchIdParam?: string,
  ) => {
    const sourceBranchId = sourceBranchIdParam || profile?.branchId;
    if (
      !sourceBranchId ||
      !targetBranchId ||
      sourceBranchId === targetBranchId ||
      qty <= 0 ||
      isProcessingTransfer
    ) {
      return alert("Data transfer tidak valid!");
    }

      setIsProcessingTransfer(true);
      try {
        await api.transferStock({
          productId,
          qty,
          sourceBranchId,
          targetBranchId,
        });
        const pData = await api.getProducts();
        setProducts(pData);
        setTimeout(() => {
          alert("Stok Berhasil Ditransfer! (Otomatis Sync saat Online)");
        }, 100);
      } catch (e: any) {
        setTimeout(() => {
          alert(e.message || "Gagal transfer stock");
        }, 100);
      } finally {
        setIsProcessingTransfer(false);
      }
    };

  const cartTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => {
      if (!item?.product) return sum;
      const price =
        item.product.discountPrice > 0
          ? item.product.discountPrice
          : item.product.sellingPrice || 0;
      return sum + price * (item.qty || 0);
    }, 0);
  }, [cart]);

  const sortedProductsBySales = React.useMemo(() => {
    const itemStats: { [id: string]: { qty: number; product: any } } = {};
    const branchId = profile?.branchId;

    // Filter products visible in this branch
    const branchProducts = products.filter(p => {
      const visibleIds = p.visibleBranchIds || "*";
      const isVisible = visibleIds === "*" || (branchId && visibleIds.split(",").map((id: string) => id.trim()).includes(branchId));
      return isVisible;
    });

    sales.forEach((s) => {
      if (s.branchId !== branchId || s.status === "refunded") return;
      (s.items || []).forEach((item: any) => {
        const pId = item.productId || item.id;
        if (!pId) return;
        if (!itemStats[pId]) {
          const product = branchProducts.find((p) => p.id === pId);
          if (!product) return;
          itemStats[pId] = { qty: 0, product };
        }
        if (itemStats[pId]) {
          itemStats[pId].qty += (item.qty || 0);
        }
      });
    });

    const sorted = Object.values(itemStats)
      .sort((a, b) => b.qty - a.qty)
      .map((entry) => ({
        ...entry.product,
        salesCount: entry.qty
      }));

    const existingIds = new Set(sorted.map((p) => p.id));
    const unsorted = branchProducts.filter(p => !existingIds.has(p.id))
      .map(p => ({ ...p, salesCount: 0 }))
      .sort((a, b) => {
        const getPrice = (px: any) => px.discountPrice > 0 ? px.discountPrice : px.sellingPrice;
        return getPrice(a) - getPrice(b);
      });

    return [...sorted, ...unsorted];
  }, [sales, products, profile?.branchId]);

  const fastAccessProducts = React.useMemo(() => {
    return sortedProductsBySales.slice(0, 24);
  }, [sortedProductsBySales]);

  const posFilteredProducts = React.useMemo(() => {
    const branchId = profile?.branchId;
    if (!branchId) return [];
    
    // 1. Filter products visible in this branch
    let list = products.filter(p => {
      const visibleIds = p.visibleBranchIds || "*";
      return visibleIds === "*" || visibleIds.split(",").map((id: string) => id.trim()).includes(branchId);
    });

    // 2. Filter by category
    if (posSelectedCategory && posSelectedCategory !== "Semua") {
      list = list.filter(p => p.category === posSelectedCategory);
    }

    // 3. Filter by search input (if any)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchWords = searchLower.split(/\s+/).filter(Boolean);
      list = list.filter(p => {
        const name = (p.name || "").toLowerCase();
        const barcode = (p.barcode || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const provider = (p.provider || "").toLowerCase();
        const masterSN = (p.masterSN || "").toLowerCase();
        
        return searchWords.every(word => 
          name.includes(word) || 
          barcode.includes(word) || 
          brand.includes(word) || 
          category.includes(word) || 
          provider.includes(word) ||
          masterSN.includes(word)
        );
      });
    }

    return list;
  }, [products, posSelectedCategory, searchTerm, profile?.branchId]);

  useEffect(() => {
    if (activeMenu !== "pos" || !searchTerm || !profile?.branchId) return;

    // 1. Check if it matches a regular Product Barcode exactly
    const foundProduct = products.find((p) => p.barcode === searchTerm);
    if (foundProduct) {
      addToCart(foundProduct);
      setSearchTerm("");
      setSearchSuggestions([]);
      setScanIndicator(`Produk: ${foundProduct.name}`);
      setTimeout(() => setScanIndicator(null), 2000);
      return;
    }

    // 2. Check if it matches a Master SN exactly (for Vouchers)
    const foundByMasterSN = products.find((p) => p.masterSN === searchTerm);
    if (foundByMasterSN) {
      addToCart(foundByMasterSN);
      setSearchTerm("");
      setSearchSuggestions([]);
      setScanIndicator(`Voucher Master: ${foundByMasterSN.name}`);
      setTimeout(() => setScanIndicator(null), 2000);
      return;
    }
  }, [searchTerm, products, activeMenu, profile?.branchId]);

  const [isSyncingOldSales, setIsSyncingOldSales] = useState(false);

  const handleSyncOldSales = async () => {
    if (!profile || profile.role !== "ADMIN") return;
    if (!window.confirm("Sinkronisasi riwayat penjualan ke ringkasan permanen? Ini akan memastikan statistik dashboard lengkap.")) return;
    
    setIsSyncingOldSales(true);
    try {
        // Fetch ALL products for accurate capital calculation during sync
        const prodSnap = await getDocs(collection(db, "products"));
        const fullProductMap = new Map(prodSnap.docs.map(d => [d.id, d.data()]));

        const salesRef = collection(db, "sales");
        // We might want to limit this if there are 100k sales, but let's assume safe for now
        const snap = await getDocs(query(salesRef, orderBy("createdAt", "desc"), limit(2000)));
        const salesToProcess = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        
        const summaries: Record<string, { revenue: number; profit: number; commissions: number; count: number; branchId: string; date: string }> = {};
        
        salesToProcess.forEach(s => {
            const dayKey = (s.shiftDate || getLogicalShiftDate(new Date(s.createdAt))).replace(/\//g, "-");
            const summaryId = `${s.branchId}_${dayKey}`;
            
            if (!summaries[summaryId]) {
                summaries[summaryId] = { revenue: 0, profit: 0, commissions: 0, count: 0, branchId: s.branchId, date: dayKey };
            }
            
            summaries[summaryId].revenue += (s.total || 0);
            summaries[summaryId].commissions += (s.totalCommission || 0);
            summaries[summaryId].count += 1;
            
            // Re-calculate profit if missing
            if (s.totalProfit !== undefined) {
                summaries[summaryId].profit += s.totalProfit;
            } else {
                const capital = (s.items || []).reduce((sum: number, it: any) => {
                    const pPrice = it.purchasePrice !== undefined ? it.purchasePrice : (fullProductMap.get(it.id) as any)?.purchasePrice || 0;
                    return sum + (Number(pPrice) * Number(it.qty || 0));
                }, 0);
                summaries[summaryId].profit += ((s.total || 0) - capital);
            }
        });
        
        const batch = writeBatch(db);
        Object.entries(summaries).forEach(([id, data]) => {
            batch.set(doc(db, "daily_summaries", id), {
                ...data,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        });
        
        await batch.commit();
        alert("Sinkronisasi selesai! Data ringkasan berhasil diperbarui.");
    } catch (e) {
        console.error("Sync Old Sales Error:", e);
        alert("Gagal sinkronisasi data lama.");
    } finally {
        setIsSyncingOldSales(false);
    }
  };

  const handleCheckout = async () => {
    const p = profile;

    if (!shiftOpen) {
      alert("Shift belum dibuka! Harap Buka Shift terlebih dahulu.");
      return;
    }

    if (shiftOpen && shiftType) {
      const nowHour = new Date().getHours();
      let isOverdue = false;
      let cleanedShiftType = shiftType;
      // Handle the case where shiftType is combined with name (e.g., "Pagi - Budi")
      if (typeof shiftType === 'string' && shiftType.includes(" - ")) {
          cleanedShiftType = shiftType.split(" - ")[0] as any;
      }

      if (cleanedShiftType === "Pagi" && (nowHour >= 19 || nowHour < 7)) {
          isOverdue = true;
      } else if (cleanedShiftType === "Malam" && (nowHour >= 7 && nowHour < 19)) {
          isOverdue = true;
      }

      if (isOverdue) {
          if (!window.confirm(`Waktu shift ${cleanedShiftType} telah berakhir. Transaksi akan tetap masuk ke shift aktif saat ini, namun disarankan untuk segera tutup shift. Lanjut Transaksi?`)) {
              return;
          }
      }
    }

    if (cart.length === 0 || !p?.branchId || isProcessingCheckout) return;

    setIsProcessingCheckout(true);

    const currentCart = [...cart];
    const currentTotal = cartTotal;

    try {
      let totalCommission = 0;
      const items = currentCart.map((i) => {
        const commPerItem = i.product.commissionAmount || 0;
        const itemComm = commPerItem * i.qty;
        totalCommission += itemComm;
        
        return {
          productId: i.product.id,
          qty: i.qty,
          price: i.product.discountPrice > 0 ? i.product.discountPrice : i.product.sellingPrice,
          subtotal: (i.product.discountPrice > 0 ? i.product.discountPrice : i.product.sellingPrice) * i.qty,
          commission: itemComm
        };
      });

      await api.createSale({
        branchId: p.branchId,
        cashierId: p.id,
        items,
        total: currentTotal,
        totalCommission,
        customerName: "" // Optional
      });

      // Clear Cart
      setCart([]);
      setShowMobileCart(false);

      // Refresh Products/Stocks (Optional, for UI update)
      const pData = await api.getProducts();
      setProducts(pData);

      setCheckoutSuccessData({
        total: currentTotal,
        itemsCount: currentCart.reduce((acc, c) => acc + c.qty, 0),
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        branchId: p.branchId
      });
      
      setGlobalAlerts(prev => [...prev, { 
        id: Date.now().toString(), 
        message: "Pembayaran Berhasil!", 
        type: "success" 
      }]);
    } catch (e: any) {
      console.error("Checkout Error:", e);
      alert(e.message || "Gagal memproses transaksi.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const getLogicalShiftDate = (d = new Date()) => {
    const date = new Date(d);
    // If before 6 AM, count as previous day (logical date)
    if (date.getHours() < 6) {
      date.setDate(date.getDate() - 1);
    }
    // Return YYYY-MM-DD in LOCAL time
    return formatDateLocal(date);
  };

  const handleOpenShift = async () => {
    if (!profile?.branchId) return alert("Cabang belum di set Admin!");
    if (!cashierName.trim()) return alert("Masukkan Nama Penjaga!");
    if (!shiftType) return alert("Pilih Tipe Shift (Pagi/Malam)!");

    const lastShiftType = localStorage.getItem("last_shift_type");
    const lastShiftDate = localStorage.getItem("last_shift_date");
    const logicalDate = getLogicalShiftDate();

    // Logika Lanjutkan Shift
    if (
      lastShiftType === shiftType &&
      lastShiftDate === logicalDate &&
      !shiftOpen
    ) {
      const confirmMsg = `Sistem mendeteksi Anda baru saja menutup Shift ${shiftType} hari ini.\n\nApakah Anda ingin MELANJUTKAN shift sebelumnya agar laporan tetap rapi?\n\n(Klik 'OK' untuk Lanjutkan, 'Cancel' untuk Mulai Baru)`;
      if (window.confirm(confirmMsg)) {
        const oldStart = localStorage.getItem("last_shift_start_time");
        const oldName = localStorage.getItem("last_cashier_name");
        const oldLogical = localStorage.getItem("last_shift_logical_date");

        if (oldStart && oldName) {
          setShiftStartTime(oldStart);
          setCashierName(oldName);
          setShiftLogicalDate(oldLogical || logicalDate);
          setShiftOpen(true);
          localStorage.setItem("shift_open", "true");
          localStorage.setItem("shift_start_time", oldStart);
          localStorage.setItem("cashier_name", oldName);
          if (oldLogical) localStorage.setItem("shift_logical_date", oldLogical);
          return;
        }
      }
    }

    const startTime = new Date().toISOString();
    const activeLogicalDate = getLogicalShiftDate();
    
    setShiftStartTime(startTime);
    setShiftLogicalDate(activeLogicalDate);
    setShiftOpen(true);

    try {
      const shift = await api.openShift({
        branchId: profile.branchId,
        cashierId: profile.id, // profile.id not uid
        initialCash: drawerCashValue,
        shiftDate: activeLogicalDate,
        shiftType: `${shiftType} - ${cashierName.trim() || profile?.name || "Kasir"}`
      });
      localStorage.setItem("current_shift_id", shift.id);
    } catch (e) {
      console.error("Shift Open Error:", e);
    }

    // Simpan untuk backup/lanjutkan nanti
    localStorage.setItem("last_shift_type", shiftType);
    localStorage.setItem("last_shift_date", logicalDate);
    localStorage.setItem("last_shift_start_time", startTime);
    localStorage.setItem("last_cashier_name", cashierName);
    localStorage.setItem("last_shift_logical_date", activeLogicalDate);
  };

  const handleWithdrawCommission = async (branchId: string) => {
    if (!window.confirm("Cairkan seluruh bonus yang tersedia untuk cabang ini?")) return;
    setIsProcessingWithdraw(true);
    try {
      await api.withdrawCommission(branchId);
      // Refresh commissions
      const cData = await api.getCommissions({ branchId });
      setCommissions(cData);
      alert("Bonus berhasil dicairkan!");
    } catch (err: any) {
      console.error(err);
      alert("Gagal mencairkan bonus.");
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  const handleCloseShift = () => {
    console.log("handleCloseShift called, profile:", profile);
    if (!profile?.branchId) {
       console.log("handleCloseShift aborted: no profile or branchId");
       alert("Error: Profile atau Branch ID tidak ditemukan. Silakan login kembali/refresh.");
       return;
    }
    if (
      !window.confirm(
        "Yakin ingin menutup shift? Pastikan semua transaksi sudah selesai.",
      )
    )
      return;

    const total = sales
      .filter(
        (s) =>
          s.branchId === profile?.branchId &&
          s.status !== "refunded" &&
          shiftStartTime &&
          new Date(s.createdAt || s.timestamp || 0).getTime() >=
            new Date(shiftStartTime).getTime(),
      )
      .reduce((acc, s) => acc + (s.total || 0), 0);

    // DRAFT SUMMARY
    setShowShiftSummary(total);
  };

  const finalizeCloseShift = async (actualInput?: string) => {
    if (isClosingShift) return;
    setIsClosingShift(true);

    const sId = localStorage.getItem("current_shift_id");
    const closingTime = new Date().toISOString();

    try {
      // 1. If actualInput is provided, update the shift record
      if (actualInput !== undefined && showShiftSummary !== null && sId) {
        const actual = parseInt(actualInput) || 0;
        const expected = showShiftSummary + drawerCashValue;
        const diff = actual - expected;

        await api.updateShift(sId, {
          actualCash: actual,
          totalSales: showShiftSummary,
          difference: diff,
          status: "closed"
        });
      }

      // 2. Reset shift state
      setShiftOpen(false);
      setCashierName("");
      setShiftType(null);
      setShiftStartTime(null);
      setShiftLogicalDate("");
      setShowShiftSummary(null);
      setActualCashInput("");
      localStorage.removeItem("current_shift_id");
      localStorage.removeItem("shift_open");
      localStorage.removeItem("cashier_name");
      localStorage.removeItem("shift_type");
      localStorage.removeItem("shift_start_time");
      localStorage.removeItem("shift_logical_date");

      alert("Shift berhasil ditutup & dipatenkan.");
    } catch (e) {
      console.error("Shift Closing Error:", e);
      alert("Gagal menutup shift. Silakan coba lagi.");
    } finally {
      setIsClosingShift(false);
    }
  };

  const currentShiftSales = useMemo(() => {
    if (!shiftOpen || !shiftStartTime) return [];
    return sales.filter(
      (s) =>
        s.branchId === profile?.branchId &&
        s.status !== "refunded" &&
        new Date(s.createdAt || s.timestamp || 0).getTime() >=
          new Date(shiftStartTime).getTime()
    );
  }, [sales, shiftOpen, shiftStartTime, profile?.branchId]);

  const currentShiftTotalSales = useMemo(() => {
    return currentShiftSales.reduce((sum, s) => sum + (s.total || 0), 0);
  }, [currentShiftSales]);

  const [dashboardDateRange, setDashboardDateRange] = useState<"today" | "week" | "month" | "all">("today");

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const todayStr = getLogicalShiftDate(now).replace(/\//g, "-");

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    if (day !== 1) startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = formatDateLocal(startOfWeek).replace(/\//g, "-");

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = formatDateLocal(startOfMonth).replace(/\//g, "-");

    // Filter summaries directly
    const filteredSummaries = dailySummaries.filter((s) => {
      // Filter by branch if owner selected one
      const branchMatch = !adminSalesBranchFilter || s.branchId === adminSalesBranchFilter;
      if (!branchMatch) return false;

      // Extract physical or logical shift date
      const summaryDateStr = (s.date || "").replace(/\//g, "-");

      if (dashboardDateRange === "today") return summaryDateStr === todayStr;
      if (dashboardDateRange === "week") return summaryDateStr >= startOfWeekStr;
      if (dashboardDateRange === "month") return summaryDateStr >= startOfMonthStr;
      return true; // "all"
    });

    // Per-Branch breakdown
    const branchBreakdown: Record<string, number> = {};

    const stats = filteredSummaries.reduce(
      (acc, s) => {
        // Aggregate revenue
        acc.revenue += s.revenue || 0;
        acc.profit += s.profit || 0;
        acc.count += s.count || 0;

        // Group by branch
        branchBreakdown[s.branchId] = (branchBreakdown[s.branchId] || 0) + (s.revenue || 0);

        return acc;
      },
      { revenue: 0, profit: 0, count: 0 }
    );

    return { ...stats, branchBreakdown };
  }, [dailySummaries, adminSalesBranchFilter, dashboardDateRange]);

  // --- VIEW RENDERING HELPERS ---
  const getPageTitle = () => {
    switch (activeMenu) {
      case "pos":
        return "Sistem Kasir Aksesoris & Voucher";
      case "shift":
        return "Manajemen Shift";
      case "dashboard":
        return "Dashboard Pusat";
      case "settings":
        return "Pengaturan Cabang";
      case "reports":
        return "Laporan Shift & Pendapatan";
      case "inventory":
        return "Master Produk Global";
      case "employees":
        return "Manajemen Akses Karyawan";
      case "audit":
        return "Audit Stok By Cabang";
      case "branch_stocks":
        return "Laporan Stok per Cabang";
      case "shopping_list":
        return "Daftar Belanja (Low Stock)";
      case "incentive":
        return "Bonus & Insentif Karyawan";
      default:
        return String(activeMenu || "ALFATH PULSA").toUpperCase();
    }
  };

  const getMobileNav = () => {
    const items = [];
    if (profile?.role === "ADMIN") {
      items.push({ id: "dashboard", icon: LayoutDashboard, label: "Dash" });
      items.push({ id: "reports", icon: TrendingUp, label: "Laporan" });
      items.push({ id: "inventory", icon: Boxes, label: "Barang" });
      items.push({ id: "branch_stocks", icon: Database, label: "Stok" });
      items.push({ id: "incentive", icon: Sparkles, label: "Bonus" });
      items.push({ id: "audit", icon: ClipboardCheck, label: "Opname" });
      items.push({ id: "employees", icon: Users, label: "Karyawan" });
      items.push({ id: "settings", icon: Settings, label: "Cabang" });
    } else if (profile?.role === "CASHIER") {
      items.push({ id: "pos", icon: Calculator, label: "POS" });
      items.push({ id: "shift", icon: Clock, label: "Shift" });
      items.push({ id: "incentive", icon: Sparkles, label: "Bonus" });
      items.push({
        id: "cashier_stock",
        icon: PackagePlus,
        label: "Stok",
        locked: !appConfig.allowCashierStockInput,
      });
    } else if (profile?.role === "AUDIT") {
      items.push({ id: "audit", icon: ClipboardCheck, label: "Opname" });
      items.push({ id: "reports", icon: TrendingUp, label: "Laporan" });
    }
    return items;
  };

  // --- CONDITIONAL LOADING & GUARD SCREENS ---
  if (authLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-10 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin shadow-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Smartphone className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-black text-slate-900 tracking-[0.4em] uppercase">Alfath Pulsa</h1>
          <div className="flex items-center gap-2.5 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.2em] leading-none">Menyiapkan Sistem...</p>
          </div>
          
          <button 
            onClick={() => {
              localStorage.clear();
              handleAppLogout();
              window.location.reload();
            }}
            className="mt-6 text-[8px] text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest cursor-pointer border-b border-transparent hover:border-blue-200 pb-0.5 transition-all"
          >
            Reset & Muat Ulang Jika Macet
          </button>
        </div>
      </div>
    );

  if (!profile) {
    return (
      <div className="flex min-h-[100dvh] bg-slate-900 font-sans items-center justify-center p-4">
        <div className="bg-white p-6 md:p-10 rounded-[32px] border border-slate-200 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transform rotate-3">
            <Store className="w-10 h-10 text-white transform -rotate-3" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
            Alfath Pulsa POS
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">
            Enterprise Multi-Branch System
          </p>
          <div className="bg-amber-50 rounded-xl p-2 mb-6 border border-amber-200">
             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
               Debug Build: 2026-05-18 v4
             </p>
          </div>
          
          <div className="mt-8 flex flex-col gap-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleLoginSubmit(Object.fromEntries(formData));
                }}
                className="space-y-4 text-left"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    name="username"
                    type="text" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Masukkan Username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-black py-4 px-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] mt-4"
                >
                  Masuk ke Sistem <ArrowRight className="w-4 h-4" />
                </button>
              </form>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                   localStorage.clear();
                   window.location.reload();
                }}
                className="w-full text-slate-400 font-bold py-2 px-4 rounded-2xl hover:bg-slate-50 transition text-[8px] uppercase tracking-widest"
              >
                Clear Cache & Force Reload
              </button>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Hubungi Admin Pusat untuk Aktivasi Akun
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile?.role)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Menyiapkan Profil...</p>
          <button 
            onClick={() => {
              localStorage.clear();
              handleAppLogout();
              window.location.reload();
            }}
            className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest cursor-pointer underline underline-offset-4"
          >
            Reset & Logout Jika Macet
          </button>
        </div>
      </div>
    );

  if (profile?.role === "PENDING") {
    return (
      <div className="flex min-h-[100dvh] bg-slate-50 font-sans items-center justify-center p-4">
        <div className="bg-white p-4 md:p-8 rounded border border-amber-200 max-w-md w-full text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
            Akun Menunggu Review
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
            Akun Anda ({profile.email}) sukses terdaftar. Namun Admin belum
            menugaskan hak akses (Role) dan entitas Cabang Anda.
          </p>
          <button
            onClick={handleAppLogout}
            className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-red-500"
          >
            Log Out / Ganti Akun
          </button>
        </div>
      </div>
    );
  }

  const generateWhatsAppMessage = (items: any[]) => {
    let message = `*Rencana Belanja Alfath Pulsa*\n`;
    message += `_Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}_\n\n`;

    const branchGroups: {
      [branchId: string]: { productName: string; qty: number }[];
    } = {};

    items.forEach((it) => {
      const p = products.find((prod) => prod.id === it.productId);
      const productName = p?.name || "Unknown Product";
      const branchQtys = (it.branchQtys || {}) as { [s: string]: string };

      Object.entries(branchQtys).forEach(([bId, qtyStr]) => {
        const qty = parseInt(qtyStr || "0") || 0;
        if (qty > 0) {
          if (!branchGroups[bId]) branchGroups[bId] = [];
          branchGroups[bId].push({ productName, qty });
        }
      });
    });

    let totalItems = 0;

    branches
      .slice()
      .sort((a, b) => naturalSort(a.name, b.name))
      .forEach((b) => {
        const bItems = branchGroups[b.id];
        if (bItems && bItems.length > 0) {
          message += `*📍 ${b.name}*\n`;
          let bTotal = 0;
          bItems
            .sort((a, b) => naturalSort(a.productName, b.productName))
            .forEach((item) => {
              message += `  • ${item.productName}: ${item.qty} pcs\n`;
              bTotal += item.qty;
              totalItems += item.qty;
            });
          message += `  _> Total Cabang: ${bTotal} pcs_\n\n`;
        }
      });

    message += `*➤ TOTAL KESELURUHAN: ${totalItems} pcs*\n`;

    message += `\n_Mohon segera diproses, Terimakasih._`;
    return message;
  };

  // --- MAIN UI ---
  return (
    <>
      <div className="flex h-[100dvh] bg-slate-50 font-sans text-slate-800 overflow-hidden">
        {/* --- DESKTOP/TABLET SIDEBAR --- */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />
        )}
        <aside className={`${isSidebarOpen ? 'flex w-64' : 'hidden'} fixed md:static inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex-col shrink-0 z-50 h-[100dvh] shadow-xl md:shadow-none`}>
          <div className="h-16 flex items-center px-4 md:px-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
            <Store className="w-6 h-6 text-blue-500 mr-3 shrink-0" />
            <div className="truncate text-left">
              <h1 className="font-bold text-white tracking-tight leading-tight truncate">
                ALFATH PULSA
              </h1>
              <p className="text-[7px] text-blue-400 font-black uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">
                Manajemen Sistem
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
                {branches.find((b) => b.id === profile?.branchId)?.name ||
                  "Pusat"}
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 md:py-4 space-y-1 hide-scrollbar">
            {profile?.role === "ADMIN" && (
              <>
                <MenuCategory title="Pusat Komando" />
                <MenuItem
                  icon={LayoutDashboard}
                  label="Dashboard Pusat"
                  active={activeMenu === "dashboard"}
                  onClick={() => setActiveMenu("dashboard")}
                />
                <MenuItem
                  icon={TrendingUp}
                  label="Shift & Pendapatan"
                  active={activeMenu === "reports"}
                  onClick={() => setActiveMenu("reports")}
                />
                <MenuItem
                  icon={Sparkles}
                  label="Bonus & Insentif"
                  active={activeMenu === "incentive"}
                  onClick={() => setActiveMenu("incentive")}
                />
                <MenuItem
                  icon={Users}
                  label="Atur Akses Karyawan"
                  active={activeMenu === "employees"}
                  onClick={() => setActiveMenu("employees")}
                />
                <MenuItem
                  icon={Settings}
                  label="Cabang & Lokasi"
                  active={activeMenu === "settings"}
                  onClick={() => setActiveMenu("settings")}
                />
                <MenuCategory title="Data Master" />
                <MenuItem
                  icon={Boxes}
                  label="Inventori Global"
                  active={activeMenu === "inventory"}
                  onClick={() => setActiveMenu("inventory")}
                />
                <MenuItem
                  icon={ClipboardCheck}
                  label="Opname Cabang"
                  active={activeMenu === "audit"}
                  onClick={() => setActiveMenu("audit")}
                />
                <MenuItem
                  icon={Database}
                  label="Stok per Cabang"
                  active={activeMenu === "branch_stocks"}
                  onClick={() => setActiveMenu("branch_stocks")}
                />
              </>
            )}

            {profile?.role === "CASHIER" && (
              <>
                <MenuCategory title="Stasiun Transaksi" />
                <MenuItem
                  icon={Calculator}
                  label="Kasir (POS)"
                  active={activeMenu === "pos"}
                  onClick={() => setActiveMenu("pos")}
                />
                <MenuItem
                  icon={Clock}
                  label="Manajemen Shift"
                  active={activeMenu === "shift"}
                  onClick={() => setActiveMenu("shift")}
                />
                <MenuItem
                  icon={Sparkles}
                  label="Bonus Saya"
                  active={activeMenu === "incentive"}
                  onClick={() => setActiveMenu("incentive")}
                />
                <MenuItem
                  icon={PackagePlus}
                  label="Input Stok Cabang"
                  active={activeMenu === "cashier_stock"}
                  onClick={() => setActiveMenu("cashier_stock")}
                  locked={
                    !appConfig.allowCashierStockInput ||
                    branches.find((b) => b.id === profile?.branchId)
                      ?.allowEmployeeInput === false
                  }
                />
              </>
            )}

            {profile?.role === "AUDIT" && (
              <>
                <MenuCategory title="Gudang & Logistik" />
                <MenuItem
                  icon={ClipboardCheck}
                  label="Opname Cabang"
                  active={activeMenu === "audit"}
                  onClick={() => setActiveMenu("audit")}
                />
                <MenuItem
                  icon={TrendingUp}
                  label="Shift & Pendapatan"
                  active={activeMenu === "reports"}
                  onClick={() => setActiveMenu("reports")}
                />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800 shrink-0 space-y-2">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-900/20"
              >
                <ScanBarcode className="w-4 h-4" /> Pasang Aplikasi (PWA)
              </button>
            )}

            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded border border-slate-700 mb-3 overflow-hidden">
              <UserCircle className="w-8 h-8 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">
                  {profile?.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${profile?.role === "ADMIN" ? "bg-blue-500/20 text-blue-400" : profile?.role === "AUDIT" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
                  >
                    {profile?.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAppLogout}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 py-2.5 rounded transition-colors uppercase tracking-widest border border-slate-700"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </aside>

        {/* --- DASHBOARD CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 pb-[68px] md:pb-0 relative h-[100dvh]">
          {/* HEADER */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-sm relative">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button className="p-2 -ml-2 text-slate-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="w-6 h-6" />
              </button>
              <Store className="w-6 h-6 text-blue-600 md:hidden shrink-0" />
              <div className="flex flex-col justify-center">
                <h2 className="text-sm md:text-md font-extrabold uppercase tracking-tight text-slate-800 truncate leading-tight">
                  {getPageTitle()}
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                  Akses Log: {profile?.name} ({profile?.email})
                </p>
              </div>
              <div className="hidden sm:block h-5 w-px bg-slate-200 shrink-0 mx-2"></div>
              {profile?.role === "CASHIER" && (
                <span
                  className={`hidden sm:flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border items-center gap-1.5 shrink-0 ${shiftOpen ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
                >
                  <Clock className="w-3 h-3" />{" "}
                  {shiftOpen ? "Shift Aktif" : "Shift Off"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {profile?.role === "ADMIN" && (
                <button
                  onClick={() => setActiveMenu("shopping_list")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-black text-[9px] uppercase tracking-widest transition-all ${activeMenu === "shopping_list" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Daftar Belanja
                  {shopListAlertCount > 0 ? (
                    <span className="w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-full text-[8px] animate-pulse">
                      {shopListAlertCount}
                    </span>
                  ) : null}
                </button>
              )}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-black text-[9px] uppercase tracking-widest hover:bg-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Pasang App
                </button>
              )}
              {scanIndicator && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded animate-pulse">
                  <ScanBarcode className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Scanner On: {scanIndicator}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"}`} />
                <span className="text-[7px] font-black uppercase text-slate-600 tracking-widest hidden xs:block">
                  {isOnline ? "Sistem Online" : "Koneksi Bermasalah"}
                </span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0 shadow-sm cursor-pointer transition-all"
                title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <button
                onClick={handleAppLogout}
                className="lg:hidden w-8 h-8 rounded bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* WORKSPACES */}
          <main className="flex-1 overflow-hidden flex bg-slate-50/50 relative h-full">
            {/* --- 1. ADMIN: PENGATURAN AKSES KARYAWAN --- */}
            {activeMenu === "employees" && profile?.role === "ADMIN" && (
              <div className="flex-1 flex flex-col p-4 md:p-4 md:p-6 overflow-hidden">
                <div className="bg-white rounded shadow-sm border border-slate-200 flex flex-col h-full">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                        Atur Role & Cabang Tim
                      </h3>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                        Isi "Nama Karyawan" agar muncul di pilihan shift kasir.
                        Jika 1 Akun dipakai 2 orang, pisahkan nama di kolom Petugas.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowUserForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                      + Tambah Akun Login
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                      <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Detail Karyawan
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Hak Akses (Role)
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Penempatan Cabang
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                            Tindakan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {users.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  defaultValue={emp.name || emp.displayName || ""}
                                  onBlur={(e) => {
                                    if (e.target.value !== (emp.name || emp.displayName || "")) {
                                      updateUser(emp.id, "name", e.target.value);
                                    }
                                  }}
                                  placeholder="Petugas 1..."
                                  className="block w-full font-bold text-slate-800 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none px-2 py-0.5 rounded transition-all text-sm"
                                />
                                <input
                                  type="text"
                                  defaultValue={emp.alternativeNames || ""}
                                  onBlur={(e) => {
                                    if (e.target.value !== (emp.alternativeNames || "")) {
                                      updateUser(
                                        emp.id,
                                        "alternativeNames",
                                        e.target.value,
                                      );
                                    }
                                  }}
                                  placeholder="Petugas 2, 3 (Pisah Koma)..."
                                  className="block w-full text-[9px] font-medium text-slate-400 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none px-2 py-0.5 rounded transition-all italic shadow-sm"
                                />
                                <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-60 italic">
                                  {emp.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={emp.role}
                                onChange={(e) =>
                                  updateUser(emp.id, "role", e.target.value)
                                }
                                className={`text-xs font-bold uppercase tracking-widest px-2 py-1.5 rounded border focus:ring-2 focus:ring-blue-500 ${
                                  emp.role === "PENDING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : emp.role === "ADMIN"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-slate-50 text-slate-700 border-slate-300"
                                }`}
                              >
                                <option value="PENDING">
                                  PENDING (Terkunci)
                                </option>
                                <option value="ADMIN">ADMIN PUSAT</option>
                                <option value="CASHIER">KASIR TOKO</option>
                                <option value="AUDIT">TIM AUDIT</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={emp.branchId || ""}
                                onChange={(e) =>
                                  updateUser(emp.id, "branchId", e.target.value)
                                }
                                className="text-xs font-bold uppercase tracking-widest px-2 py-1.5 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 w-full max-w-[200px]"
                              >
                                <option value="">
                                  -- BELUM DITEMPATKAN --
                                </option>
                                <optgroup label="Daftar Cabang Aktif">
                                  {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.name}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => setResetUser(emp)}
                                  className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-orange-100"
                                  title="Reset Password"
                                >
                                  <Key className="w-5 h-5" />
                                </button>
                                {emp.id !== user?.uid && (
                                  <button
                                    onClick={() => deleteUser(emp.id, emp.name)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                    title="Hapus Karyawan"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Reset Password */}
            {resetUser && (
              <div className="fixed inset-0 z-[5000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-left">
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                          Ganti Password
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                          User: {resetUser.username || resetUser.email || resetUser.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setResetUser(null)}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Password Baru
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={newPassInput}
                          onChange={(e) => setNewPassInput(e.target.value)}
                          placeholder="Masukkan password baru..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-4 focus:ring-orange-100 outline-none transition-all font-bold"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setResetUser(null)}
                        className="flex-1 py-3 px-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={async () => {
                          if (!newPassInput) return alert("Password tidak boleh kosong.");
                          setIsUpdatingPass(true);
                          try {
                            await api.updateUser(resetUser.id, { password: newPassInput });
                            alert("Password berhasil diperbarui!");
                            setResetUser(null);
                            setNewPassInput("");
                          } catch (err) {
                            alert("Gagal memperbarui password.");
                          } finally {
                            setIsUpdatingPass(false);
                          }
                        }}
                        disabled={isUpdatingPass}
                        className="flex-[2] py-3 px-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUpdatingPass ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- 2. ADMIN: PENGATURAN CABANG --- */}
            {activeMenu === "reports" &&
              (profile?.role === "ADMIN" || profile?.role === "AUDIT") && (
                <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full bg-slate-50 content-fade">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
                    <div>
                      <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Laporan Shift & Cabang
                      </h2>
                      <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
                        Analisis Perbandingan Pendapatan Siang vs Malam
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setReportSubTab("summary")}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportSubTab === "summary" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          Analisis
                        </button>
                        <button
                          onClick={() => setReportSubTab("excel")}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportSubTab === "excel" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          Tabel Excel
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Dari Tanggal
                        </span>
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Sampai Tanggal
                        </span>
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <select
                        value={adminSalesBranchFilter}
                        onChange={(e) =>
                          setAdminSalesBranchFilter(e.target.value)
                        }
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-100 h-[38px]"
                      >
                        <option value="">Semua Cabang</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      {(reportStartDate || reportEndDate) && (
                        <button
                          onClick={() => {
                            setReportStartDate("");
                            setReportEndDate("");
                          }}
                          className="h-[38px] px-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="content-fade">
                    {reportSubTab === "summary" ? (
                      <div className="grid grid-cols-1 xl:grid-cols-1 sm:grid-cols-2 gap-8">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />{" "}
                          Laporan Pendapatan Shift
                        </div>
                        <span className="text-[10px] text-slate-400 normal-case font-bold">
                          {reportStartDate && reportEndDate
                            ? `${reportStartDate} s/d ${reportEndDate}`
                            : "3 Hari Terakhir"}
                        </span>
                      </h3>
                      <div className="space-y-6">
                        {/* Summary Today & Yesterday */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Shift Hari Ini", date: new Date() },
                            { label: "Shift Kemarin", date: new Date(Date.now() - 86400000) }
                          ].map((day) => {
                            const logical = getLogicalShiftDate(day.date);
                            const stats = sales.filter(s => 
                              (s.shiftDate || getLogicalShiftDate(new Date(s.createdAt || s.timestamp || 0))) === logical &&
                              (!adminSalesBranchFilter || s.branchId === adminSalesBranchFilter) &&
                              s.status !== "refunded"
                            ).reduce((acc, s) => {
                              acc.revenue += (s.total || 0);
                              const capital = (s.items || []).reduce((sum: number, it: any) => {
                                let pPrice = it.purchasePrice;
                                if (pPrice === undefined || pPrice === null) {
                                  const m = products.find(p => p.id === (it.productId || it.id));
                                  pPrice = m?.buyingPrice || 0; // Use buyingPrice as per schema
                                }
                                return sum + (pPrice * (it.qty || 0));
                              }, 0);
                              acc.profit += ((s.total || 0) - capital);
                              return acc;
                            }, { revenue: 0, profit: 0 });
                            
                            return (
                              <div key={day.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{day.label}</p>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-sm font-black text-slate-800">Rp {stats.revenue.toLocaleString("id-ID")}</p>
                                  <p className="text-[9px] font-bold text-emerald-600 uppercase">Laba: Rp {stats.profit.toLocaleString("id-ID")}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {["Pagi", "Malam"].map((type) => {
                            const filteredForType = sales.filter((s) => {
                              const physicalDate = new Date(s.createdAt || s.timestamp || 0);
                              const saleLogicalStr = s.shiftDate || getLogicalShiftDate(physicalDate);
                              const saleLogicalDate = new Date(saleLogicalStr);
                              
                              const branchMatch = !adminSalesBranchFilter || s.branchId === adminSalesBranchFilter;

                              let dateMatch = true;
                              if (reportStartDate && reportEndDate) {
                                const start = new Date(reportStartDate);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(reportEndDate);
                                end.setHours(23, 59, 59, 999);
                                dateMatch = saleLogicalDate >= start && saleLogicalDate <= end;
                              } else {
                                const todayStr = getLogicalShiftDate();
                                const todayDate = new Date(todayStr);
                                const diffDays = Math.round((todayDate.getTime() - saleLogicalDate.getTime()) / (1000 * 3600 * 24));
                                dateMatch = diffDays <= 3;
                              }

                              const sType = s.shiftType || (physicalDate.getHours() >= 7 && physicalDate.getHours() < 19 ? "Pagi" : "Malam");
                              return branchMatch && sType === type && dateMatch && s.status !== "refunded";
                            });

                            const totalRevenue = filteredForType.reduce((acc, s) => acc + (s.total || 0), 0);
                            const totalComm = filteredForType.reduce((acc, s) => acc + (s.totalCommission || 0), 0);

                            return (
                              <div
                                key={type}
                                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border ${type === "Pagi" ? "bg-amber-50 border-amber-100" : "bg-indigo-50 border-indigo-100"}`}
                              >
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${type === "Pagi" ? "text-amber-600" : "text-indigo-600"}`}>
                                  TOTAL {type.toUpperCase()} (PERIODE)
                                </p>
                                <p className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                                  Rp {totalRevenue.toLocaleString("id-ID")}
                                </p>
                                <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Estimasi Komisi</span>
                                  <span className="text-[10px] font-bold text-slate-600">Rp {totalComm.toLocaleString("id-ID")}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                        {/* Summary Header: Shift Totals */}
                        {(() => {
                          let grandTotalPagi = 0;
                          let grandTotalMalam = 0;

                          shifts.filter(s => {
                            const branchMatch = !adminSalesBranchFilter || s.branchId === adminSalesBranchFilter;
                            let dateMatch = true;
                            if (reportStartDate && reportEndDate) {
                              const sDate = formatDateLocal(s.shiftDate);
                              dateMatch = sDate >= reportStartDate && sDate <= reportEndDate;
                            }
                            return branchMatch && dateMatch;
                          }).forEach(s => {
                            if (s.shiftType === "Pagi") {
                              grandTotalPagi += (s.totalSales || 0);
                            } else {
                              grandTotalMalam += (s.totalSales || 0);
                            }
                          });

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                              <div className="bg-amber-50 border border-amber-100 rounded-2xl md:rounded-[28px] p-4 md:p-6 shadow-sm text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
                                <p className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Shift Siang (Pagi)</p>
                                <p className="text-xl md:text-2xl font-black text-amber-900 font-mono leading-none">Rp {grandTotalPagi.toLocaleString("id-ID")}</p>
                                <p className="text-[7px] md:text-[9px] text-amber-500 font-bold uppercase mt-2">Pemasukan Siff Pagi</p>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl md:rounded-[28px] p-4 md:p-6 shadow-sm text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100/50 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
                                <p className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Shift Malam</p>
                                <p className="text-xl md:text-2xl font-black text-indigo-900 font-mono leading-none">Rp {grandTotalMalam.toLocaleString("id-ID")}</p>
                                <p className="text-[7px] md:text-[9px] text-indigo-500 font-bold uppercase mt-2">Pemasukan Siff Malam</p>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl md:rounded-[28px] p-4 md:p-6 shadow-sm text-left relative overflow-hidden group sm:col-span-2 md:col-span-1">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
                                <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Total Pendapatan</p>
                                <p className="text-xl md:text-2xl font-black text-emerald-900 font-mono leading-none">Rp {(grandTotalPagi + grandTotalMalam).toLocaleString("id-ID")}</p>
                                <p className="text-[7px] md:text-[9px] text-emerald-500 font-bold uppercase mt-2">Periode yang dipilih</p>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-200 shadow-xl overflow-hidden mt-4 md:mt-8">
                          <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                            <div>
                              <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                  <LayoutGrid className="w-4 h-4" />
                                </div>
                                Tabel Laporan Pendapatan (Excel View)
                              </h3>
                              <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase mt-1">Rekap per Tanggal, Cabang, & Siff</p>
                            </div>
                            <button 
                              onClick={() => {
                                const csvRows = [];
                                const headers = ["Tanggal", "Cabang", "Kasir Pagi", "Rp Pagi", "Kasir Malam", "Rp Malam", "Total Harian"];
                                csvRows.push(headers.join(","));
                                
                                const grouped: Record<string, Record<string, { pagi: { val: number, kasir: string }, malam: { val: number, kasir: string } }>> = {};
                                shifts.filter(s => {
                                  const branchMatch = !adminSalesBranchFilter || s.branchId === adminSalesBranchFilter;
                                  let dateMatch = true;
                                  if (reportStartDate && reportEndDate) {
                                    const sDate = formatDateLocal(s.shiftDate);
                                    dateMatch = sDate >= reportStartDate && sDate <= reportEndDate;
                                  }
                                  return branchMatch && dateMatch;
                                }).forEach(s => {
                                  const date = s.shiftDate || "N/A";
                                  const bId = s.branchId || "center";
                                  if (!grouped[date]) grouped[date] = {};
                                  if (!grouped[date][bId]) grouped[date][bId] = { pagi: { val: 0, kasir: "" }, malam: { val: 0, kasir: "" } };
                                  const sType = getShiftTypePref(s.shiftType);
                                  const sKeeper = getShiftKeeperName(s);
                                  if (sType === "Pagi") {
                                    grouped[date][bId].pagi.val += (s.totalSales || 0);
                                    grouped[date][bId].pagi.kasir = sKeeper;
                                  } else {
                                    grouped[date][bId].malam.val += (s.totalSales || 0);
                                    grouped[date][bId].malam.kasir = sKeeper;
                                  }
                                });

                                Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).forEach(([date, branchMap]) => {
                                  Object.entries(branchMap).forEach(([bId, d]) => {
                                    const bName = branches.find(b => b.id === bId)?.name || "Pusat";
                                    csvRows.push([date, bName, d.pagi.kasir, d.pagi.val, d.malam.kasir, d.malam.val, d.pagi.val + d.malam.val].join(","));
                                  });
                                });

                                const csvString = csvRows.join("\n");
                                const blob = new Blob([csvString], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.setAttribute('hidden', '');
                                a.setAttribute('href', url);
                                a.setAttribute('download', `Rekap_Pendapatan_${new Date().toISOString().split('T')[0]}.csv`);
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                              className="bg-emerald-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 w-full md:w-auto"
                            >
                              <Save className="w-3 md:w-4 h-3 md:h-4" /> Ekspor ke Excel (CSV)
                            </button>
                          </div>
                          <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="px-3 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Tanggal</th>
                                  <th className="px-3 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">Cabang</th>
                                  <th className="px-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest border-r border-slate-200 bg-amber-50/20 text-center" colSpan={2}>Siff Siang (Pagi)</th>
                                  <th className="px-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest border-r border-slate-200 bg-indigo-50/20 text-center" colSpan={2}>Siff Malam</th>
                                  <th className="px-3 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/30 text-right">Total Pendapatan</th>
                                </tr>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <th colSpan={2} className="border-r border-slate-200"></th>
                                  <th className="px-2 py-2 border-r border-slate-100 bg-amber-50/5">Kasir</th>
                                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50/5 text-right">Income</th>
                                  <th className="px-2 py-2 border-r border-slate-100 bg-indigo-50/5">Kasir</th>
                                  <th className="px-2 py-2 border-r border-slate-200 bg-indigo-50/5 text-right">Income</th>
                                  <th className="bg-emerald-50/5 text-right">Harian</th>
                                </tr>
                              </thead>
                              <tbody className="text-[10px] md:text-[11px] font-bold text-slate-700 divide-y divide-slate-100">
                                {(() => {
                                  const grouped: Record<string, Record<string, { pagi: { val: number, kasir: string }, malam: { val: number, kasir: string } }>> = {};
                                  
                                  shifts.filter(s => {
                                    const branchMatch = !adminSalesBranchFilter || s.branchId === adminSalesBranchFilter;
                                    let dateMatch = true;
                                    if (reportStartDate && reportEndDate) {
                                      const sDate = formatDateLocal(s.shiftDate);
                                      dateMatch = sDate >= reportStartDate && sDate <= reportEndDate;
                                    }
                                    return branchMatch && dateMatch;
                                  }).forEach(s => {
                                    const date = s.shiftDate || "N/A";
                                    const bId = s.branchId || "center";
                                    if (!grouped[date]) grouped[date] = {};
                                    if (!grouped[date][bId]) grouped[date][bId] = { pagi: { val: 0, kasir: "" }, malam: { val: 0, kasir: "" } };
                                    const sType = getShiftTypePref(s.shiftType);
                                    const sKeeper = getShiftKeeperName(s);
                                    if (sType === "Pagi") {
                                      grouped[date][bId].pagi.val += (s.totalSales || 0);
                                      grouped[date][bId].pagi.kasir = sKeeper;
                                    } else {
                                      grouped[date][bId].malam.val += (s.totalSales || 0);
                                      grouped[date][bId].malam.kasir = sKeeper;
                                    }
                                  });

                                  const sortedDates = Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0]));

                                  if (sortedDates.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-slate-400 uppercase tracking-widest text-[8px] md:text-[9px]">
                                          Tidak ada data ditemukan untuk periode ini
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return sortedDates.map(([date, branchMap]) => {
                                    return Object.entries(branchMap).map(([bId, d], bIdx) => {
                                      const bName = branches.find(b => b.id === bId)?.name || "Pusat";
                                      const rowTotal = d.pagi.val + d.malam.val;
                                      return (
                                        <tr key={`${date}-${bId}`} className="hover:bg-slate-50 transition-colors group">
                                          <td className="px-3 md:px-6 py-3 md:py-4 border-r border-slate-100 text-slate-500 font-mono text-[9px] md:text-[10px]">
                                            {bIdx === 0 ? date : <span className="opacity-0">{date}</span>}
                                          </td>
                                          <td className="px-3 md:px-6 py-3 md:py-4 border-r border-slate-100 uppercase tracking-tighter font-black text-slate-900 truncate max-w-[80px] md:max-w-none">
                                            {bName}
                                          </td>
                                          <td className="px-2 md:px-4 py-3 md:py-4 border-r border-slate-100 bg-amber-50/5 text-slate-600 truncate max-w-[60px] md:max-w-[80px]">
                                            {d.pagi.kasir || "-"}
                                          </td>
                                          <td className="px-2 md:px-4 py-3 md:py-4 border-r border-slate-200 bg-amber-50/10 text-amber-700 text-right font-mono">
                                            {d.pagi.val > 0 ? `Rp ${d.pagi.val.toLocaleString("id-ID")}` : "-"}
                                          </td>
                                          <td className="px-2 md:px-4 py-3 md:py-4 border-r border-slate-100 bg-indigo-50/5 text-slate-600 truncate max-w-[60px] md:max-w-[80px]">
                                            {d.malam.kasir || "-"}
                                          </td>
                                          <td className="px-2 md:px-4 py-3 md:py-4 border-r border-slate-200 bg-indigo-50/10 text-indigo-700 text-right font-mono">
                                            {d.malam.val > 0 ? `Rp ${d.malam.val.toLocaleString("id-ID")}` : "-"}
                                          </td>
                                          <td className="px-3 md:px-6 py-3 md:py-4 bg-emerald-50/20 text-slate-900 font-black text-right text-xs md:text-sm font-mono whitespace-nowrap">
                                            Rp {rowTotal.toLocaleString("id-ID")}
                                          </td>
                                        </tr>
                                      );
                                    });
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
 
                  {/* RIWAYAT TUTUP SHIFT (DAILY REPORTS) */}
                    <div className="xl:col-span-1 border border-slate-200 bg-white rounded-[32px] shadow-xl overflow-hidden mt-8">
                      <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="text-left">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" /> Riwayat Tutup Shift (Laporan Kasir)
                          </h3>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Audit kesesuaian uang laci fisik vs sistem</p>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Audit Log
                        </div>
                      </div>
                      <div className="overflow-auto max-h-[500px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 z-10">
                            <tr>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Tutup</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kasir & Cabang</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Target Sistem</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Uang Fisik</th>
                              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Selisih</th>
                              {(profile?.role === "ADMIN" || profile?.role === "AUDIT") && (
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {shifts
                              .filter(sh => {
                                const branchMatch = !adminSalesBranchFilter || sh.branchId === adminSalesBranchFilter;
                                let dateMatch = true;
                                if (reportStartDate && reportEndDate) {
                                  const sDate = formatDateLocal(sh.shiftDate);
                                  dateMatch = sDate >= reportStartDate && sDate <= reportEndDate;
                                }
                                return branchMatch && dateMatch;
                              })
                              .map((sh) => {
                                const expected = (sh.totalSales || 0) + (sh.initialCash || 0);
                                const diff = (sh.actualCash || 0) - expected;
                                
                                return (
                                  <tr key={sh.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                      <p className="text-[10px] font-black text-slate-900 border-b border-slate-100 pb-1 mb-1">{sh.shiftDate}</p>
                                      <p className="text-[9px] font-mono text-slate-400">
                                        {new Date(sh.closeTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                      </p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-[10px] font-black text-slate-800 uppercase leading-tight">
                                        {sh.shiftType && sh.shiftType.includes(" - ") ? sh.shiftType.split(" - ")[1] : sh.cashier?.name || "Kasir"}
                                      </p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        {branches.find(b => b.id === sh.branchId)?.name || "Pusat"} | {sh.shiftType && sh.shiftType.includes(" - ") ? sh.shiftType.split(" - ")[0] : sh.shiftType}
                                      </p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-400 text-[10px]">
                                      Rp {expected.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900 text-xs">
                                      Rp {(sh.actualCash || 0).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                                        diff === 0 ? "bg-emerald-50 text-emerald-600" : diff > 0 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                                      }`}>
                                        {diff > 0 ? "+" : ""}{diff.toLocaleString("id-ID")}
                                      </span>
                                    </td>
                                    {(profile?.role === "ADMIN" || profile?.role === "AUDIT") && (
                                      <td className="px-6 py-4 text-center">
                                        <button
                                          onClick={async () => {
                                            if (confirm("Hapus riwayat shift ini? Tindakan ini tidak dapat dibatalkan.")) {
                                              try {
                                                await fetch(`/api/shifts/${sh.id}`, {
                                                  method: 'DELETE',
                                                  headers: {
                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                  }
                                                });
                                                const sData = await api.getShifts();
                                                setShifts(sData.sort((a: any, b: any) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime()));
                                              } catch (err) {
                                                alert("Gagal menghapus: " + err);
                                              }
                                            }
                                          }}
                                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                          title="Hapus duplikat/salah"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            {shifts.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest opacity-30 italic">Belum ada laporan tutup shift</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

            {activeMenu === "settings" && profile?.role === "ADMIN" && (
              <div className="flex-1 p-4 md:p-4 md:p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6 text-left pb-20">
                  {/* Card Configuration Switch */}
                  <div className="bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-500" />
                      Fitur & Hak Akses Global
                    </h3>
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
                          Kasir Input Stok Cabang
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 opacity-70">
                          Izinkan kasir melakukan input stok masuk mandiri di
                          cabang mereka.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const newVal = !appConfig.allowCashierStockInput;
                            await fetch("/api/config", {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token",
                                )}`,
                              },
                              body: JSON.stringify({
                                allowCashierStockInput: newVal,
                              }),
                            });
                            setAppConfig((prev: any) => ({
                              ...prev,
                              allowCashierStockInput: newVal,
                            }));
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className={`w-14 h-7 rounded-full transition-all relative ${appConfig.allowCashierStockInput ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-slate-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${appConfig.allowCashierStockInput ? "left-8" : "left-1"}`}
                        ></div>
                      </button>
                    </div>
                  </div>

                  {/* Card Add Branch */}
                  <div className="bg-white p-3 md:p-5 rounded border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" /> Registrasi
                      Cabang Baru
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Nama Cabang (Contoh: Cabang Jakarta Pusat)"
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddBranch}
                        disabled={!newBranch.trim()}
                        className="bg-blue-600 disabled:opacity-50 text-white px-4 md:px-6 py-2 rounded text-[11px] font-bold uppercase tracking-widest shrink-0"
                      >
                        Simpan Cabang
                      </button>
                    </div>
                  </div>

                  {/* List Branches */}
                  <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                        Daftar Cabang Aktif
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {branches.length === 0 ? (
                        <p className="p-4 text-xs text-center text-slate-500 font-medium">
                          Belum ada cabang terdaftar.
                        </p>
                      ) : null}
                      {branches
                        .slice()
                        .sort((a, b) => naturalSort(a.name, b.name))
                        .map((b, idx) => (
                          <div
                            key={b.id}
                            className="p-4 flex items-center justify-between hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-slate-800">
                                    {b.name}
                                  </h4>
                                  <button
                                    onClick={async () => {
                                      const newName = prompt(`Ubah Nama Cabang "${b.name}" menjadi:`, b.name);
                                      if (newName === null) return;
                                      const trimmed = newName.trim();
                                      if (!trimmed) return alert("Nama cabang tidak boleh kosong!");
                                      try {
                                        const res = await fetch(`/api/branches/${b.id}`, {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                                          },
                                          body: JSON.stringify({ name: trimmed }),
                                        });
                                        if (!res.ok) {
                                          const errData = await res.json().catch(() => ({}));
                                          throw new Error(errData.error || "Gagal mengubah nama cabang");
                                        }
                                        const bData = await api.getBranches();
                                        setBranches(
                                          bData.sort((a: any, b: any) =>
                                            (a.name || "").localeCompare(b.name || "")
                                          )
                                        );
                                      } catch (err: any) {
                                        alert(err.message || "Gagal mengubah nama cabang");
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Ubah Nama Cabang"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  ID: {b.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={async () => {
                                    try {
                                      const newVal = !b.allowEmployeeInput;
                                      await fetch(`/api/branches/${b.id}`, {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${localStorage.getItem(
                                            "token",
                                          )}`,
                                        },
                                        body: JSON.stringify({
                                          allowEmployeeInput: newVal,
                                        }),
                                      });
                                      const bData = await api.getBranches();
                                      setBranches(
                                        bData.sort((a: any, b: any) =>
                                          (a.name || "").localeCompare(
                                            b.name || "",
                                          ),
                                        ),
                                      );
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tight transition-all ${b.allowEmployeeInput !== false ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}
                                >
                                  {b.allowEmployeeInput !== false
                                    ? "INPUT AKTIF"
                                    : "INPUT OFF"}
                                </button>
                                <button
                                  onClick={() => toggleBranchShoppingHidden(b.id)}
                                  className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tight transition-all ${!hiddenShoppingBranchIds.includes(b.id) ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}
                                  title={!hiddenShoppingBranchIds.includes(b.id) ? "Klik untuk sembunyikan cabang ini dari Daftar Belanja" : "Klik untuk tampilkan kembali cabang ini di Daftar Belanja"}
                                >
                                  {!hiddenShoppingBranchIds.includes(b.id)
                                    ? "MUNCUL DI BELANJA"
                                    : "DISEMBUNYIKAN"}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (b.id === "default-branch-id") {
                                      alert(
                                        `PERINGATAN: "${b.name}" adalah Cabang Sistem Utama bawaan (seed) yang tertaut dengan akun 'admin' and 'cashier' default.\n\nSangat disarankan untuk mengubah NAMA cabang ini di database (atau rename) daripada menghapusnya.\n\nSetiap kali web restart, Cabang Sistem Utama ini akan otomatis dibuat kembali jika tidak ada.`
                                      );
                                      return;
                                    }
                                    if (
                                      confirm(
                                        `Hapus Cabang "${b.name}"?\nSemua data stok dan voucher di cabang ini akan dihapus. Data penjualan tetap tersimpan.`,
                                      )
                                    ) {
                                      try {
                                        const res = await fetch(`/api/branches/${b.id}`, {
                                          method: "DELETE",
                                          headers: {
                                            Authorization: `Bearer ${localStorage.getItem(
                                              "token",
                                            )}`,
                                          },
                                        });
                                        if (!res.ok) {
                                          const errData = await res.json().catch(() => ({}));
                                          throw new Error(errData.error || "Gagal menghapus cabang");
                                        }
                                        const bData = await api.getBranches();
                                        setBranches(
                                          bData.sort((a: any, b: any) =>
                                            (a.name || "").localeCompare(
                                              b.name || "",
                                            ),
                                          ),
                                        );
                                      } catch (e: any) {
                                        alert(e.message || "Gagal menghapus cabang");
                                        console.error(e);
                                      }
                                    }
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                  title="Hapus Cabang"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase tracking-widest leading-none">
                                  Beroperasi
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- 3. ADMIN: INVENTORY MASTER --- */}
            {activeMenu === "inventory" && profile?.role === "ADMIN" && (
              <div className="flex-1 flex flex-col bg-white md:m-4 md:rounded shadow-sm border-t md:border border-slate-200 overflow-hidden relative">
                {/* PRODUCT FORM MODAL */}
                {showProductForm && (
                  <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90dvh]">
                      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">
                          {editingProduct
                            ? "Ubah Master Produk"
                            : "Formulir Master Produk Baru"}
                        </h3>
                        <button
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-4 md:p-6 overflow-y-auto flex-1">
                        <form
                          onSubmit={handleSaveProduct}
                          className="space-y-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Column 1: Identity */}
                            <div className="space-y-5">
                              <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 focus-within:text-blue-600 transition-colors">
                                  Kategori Produk
                                </label>
                                <CustomSelect 
                                  label="Kategori Produk"
                                  value={prodCategory}
                                  onChange={(val) => {
                                    setProdCategory(val);
                                    setProdBrand("");
                                    setProdSubCategory("");
                                    setProdProvider("");
                                  }}
                                  options={dynamicCategories}
                                  placeholder="Ketik atau pilih Kategori"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 focus-within:text-blue-600 transition-colors">
                                    { (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) ? "Provider / Operator" : "Merek (Brand)" }
                                  </label>
                                  <div className="relative group">
                                  {prodCategory === "Parfum" ? (
                                    <input
                                      type="text"
                                      value={prodBrand}
                                      onChange={(e) => setProdBrand(e.target.value)}
                                      placeholder="Ketik Merek"
                                      className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                                    />
                                  ) : (
                                    <CustomSelect 
                                      label={ (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) ? "Pilih Provider" : "Merek (Brand)" }
                                      value={ (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) ? prodProvider : prodBrand }
                                      onChange={(val) => {
                                        if (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) {
                                          setProdProvider(val);
                                          setProdBrand(val); // Keep brand in sync for legacy or generic checks
                                        } else {
                                          setProdBrand(val);
                                        }
                                        setProdSubCategory("");
                                      }}
                                      options={ (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) ? dynamicProviders : dynamicBrands }
                                      placeholder={ (prodCategory === "Voucher" || prodCategory?.includes("Perdana")) ? "Pilih Provider" : "Ketik Merek" }
                                    />
                                  )}
                                  </div>
                                </div>
                                { (prodCategory === "Aksesoris" || prodCategory === "Handphone") && (
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                      Model / Sub-Kategori
                                    </label>
                                    <div className="relative">
                                    <CustomSelect 
                                      label="Model / Sub-Kategori"
                                      value={prodSubCategory}
                                      onChange={setProdSubCategory}
                                      options={dynamicSubCategories}
                                      placeholder="Ketik Model..."
                                    />
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* Column 2: Visibility & Settings */}
                            <div className="space-y-5 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                              <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-blue-600" /> Visibilitas Cabang
                                </p>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-blue-300 transition-all group">
                                    <input
                                      type="checkbox"
                                      checked={prodVisibleBranchIds === "*"}
                                      onChange={(e) => setProdVisibleBranchIds(e.target.checked ? "*" : "")}
                                      className="w-5 h-5 rounded-lg text-blue-600 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="text-[11px] font-black uppercase text-slate-600 group-hover:text-blue-700">Semua Cabang Toko</span>
                                  </label>
                                  
                                  {prodVisibleBranchIds !== "*" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {branches.map(b => {
                                        const ids = prodVisibleBranchIds ? prodVisibleBranchIds.split(",") : [];
                                        const isChecked = ids.includes(b.id);
                                        return (
                                          <label key={b.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${isChecked ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => {
                                                const newIds = e.target.checked
                                                  ? [...ids, b.id]
                                                  : ids.filter(id => id !== b.id);
                                                setProdVisibleBranchIds(newIds.join(","));
                                              }}
                                              className="w-4 h-4 rounded text-blue-600 border-slate-300"
                                            />
                                            <span className={`text-[10px] font-bold uppercase truncate ${isChecked ? "text-blue-700" : "text-slate-500"}`}>{b.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Varian / Nama Produk{" "}
                                <span className="text-red-500 font-black">
                                  *
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="Cth: Type-C 2A Putih / Perdana 10GB"
                                value={prodType}
                                onChange={(e) => setProdType(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex justify-between">
                                <span>Barcode / SN Master Produk</span>{" "}
                                <span className="text-[9px] text-blue-500 font-black lowercase">
                                  (Kosongi untuk otomatis)
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Scan atau Kosongi"
                                  value={prodBarcode}
                                  onChange={(e) =>
                                    setProdBarcode(e.target.value)
                                  }
                                  readOnly={!!prodBarcode}
                                  className={`w-full border border-blue-400 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-widest pr-20 ${prodBarcode ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-80" : "bg-blue-50 focus:bg-white"}`}
                                />
                                <div className="absolute right-2 top-1.5 flex items-center gap-1">
                                  {!prodBarcode ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setProdBarcode(generateAutoBarcode())
                                      }
                                      title="Generate Otomatis"
                                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                    >
                                      <Sparkles className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setProdBarcode("")}
                                      title="Hapus Barkod"
                                      className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowScanner(true);
                                      setScannerCallback(
                                        () => (code: string) =>
                                          setProdBarcode(code),
                                      );
                                    }}
                                    title="Buka Kamera"
                                    className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                                  >
                                    <Camera className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                              Deskripsi Operasional Barang (Opsional)
                            </label>
                            <textarea
                              placeholder="Bisa disi catatan klaim garansi produk, spesifikasi teknis..."
                              value={prodDesc}
                              onChange={(e) => setProdDesc(e.target.value)}
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded border border-slate-200 shadow-inner">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Harga Modal (Rp)
                              </label>
                              <input
                                type="number"
                                placeholder="HPP"
                                value={prodCapital}
                                onChange={(e) => setProdCapital(e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-2 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Harga Jual (Rp)
                              </label>
                              <input
                                type="number"
                                placeholder="Jual"
                                value={prodSell}
                                onChange={(e) => setProdSell(e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-2 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="relative">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Harga Promo (Rp)
                              </label>
                              <input
                                type="number"
                                placeholder="Diskon"
                                value={prodDiscount}
                                onChange={(e) =>
                                  setProdDiscount(e.target.value)
                                }
                                className="w-full border border-slate-300 rounded px-2 py-2 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div className="relative">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-blue-600">
                                Bonus Kasir / Item (Rp)
                              </label>
                              <input
                                type="number"
                                placeholder="Bonus"
                                value={prodCommission}
                                onChange={(e) =>
                                  setProdCommission(e.target.value)
                                }
                                className="w-full border border-blue-200 bg-blue-50 rounded px-2 py-2 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* PROFIT ANALYSIS PREVIEW */}
                            <div className="col-span-full mt-2 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                              <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">ESTIMASI LABA BERSIH</p>
                                <div className="flex items-baseline gap-2">
                                  <h4 className={`text-lg font-black tracking-tighter ${(Number(prodSell) - Number(prodCapital)) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    Rp {(Number(prodSell) - Number(prodCapital)).toLocaleString('id-ID')}
                                  </h4>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ (Number(prodSell) - Number(prodCapital)) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {prodSell && Number(prodSell) > 0 ? (((Number(prodSell) - Number(prodCapital)) / Number(prodSell)) * 100).toFixed(1) : 0}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">VALUE MODAL</p>
                                <p className="text-xs font-bold text-slate-500 tracking-tight text-right">
                                  {prodSell && Number(prodSell) > 0 ? ((Number(prodCapital) / Number(prodSell)) * 100).toFixed(0) : 0}% DARI HARGA JUAL
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2 mt-4 pt-4 border-t border-slate-200">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                                  <span>Stok Minimal Aman</span>
                                  <span className="text-[9px] text-amber-500 font-black lowercase">
                                    peringatan
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  value={prodMinStock}
                                  onChange={(e) =>
                                    setProdMinStock(e.target.value)
                                  }
                                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              {(prodCategory === "Voucher" ||
                                prodCategory?.includes("Perdana")) && (
                                <div>
                                  <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                                    Masa Aktif / Kadaluarsa
                                  </label>
                                  <input
                                    type="date"
                                    value={prodExpiredAt}
                                    onChange={(e) =>
                                      setProdExpiredAt(e.target.value)
                                    }
                                    className="w-full border border-blue-200 bg-blue-50 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-black py-3 md:py-4 rounded shadow-lg uppercase tracking-widest text-[11px] hover:bg-blue-700 active:scale-[0.99] transition-all"
                          >
                            Patenkan Master Produk ke Server Sentral
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* USER FORM MODAL */ }
                {/* MOVED TO TOP LEVEL */ }

                <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
                    <div className="relative w-full max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari master barang..."
                        className="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value) setDrillPath([]);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-blue-600 shadow-md text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shrink-0 w-full sm:w-auto self-end sm:self-center"
                    >
                      <Plus className="w-3 h-3 inline mr-1" /> Tambah Master
                      Produk
                    </button>
                  </div>

                  {!searchTerm && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-[10px] font-bold uppercase tracking-widest">
                      <button
                        onClick={() => setDrillPath([])}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${drillPath.length === 0 ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                      >
                        <LayoutList className="w-3 h-3" />
                        SEMUA KATEGORI
                      </button>
                      {drillPath.map((path, idx) => (
                        <React.Fragment key={idx}>
                          <ArrowRightLeft className="w-3 h-3 text-slate-300 transform rotate-90 sm:rotate-0" />
                          <button
                            onClick={() =>
                              setDrillPath(drillPath.slice(0, idx + 1))
                            }
                            className={`shrink-0 px-3 py-1.5 rounded-lg border bg-blue-50 border-blue-200 text-blue-600 shadow-sm`}
                          >
                            {path}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Item Master
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Kategori & Spek
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                          Modal Pokok
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                          Harga Jual
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          Visibilitas
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {(() => {
                        const filtered = products.filter(
                          (p) =>
                            p &&
                            (!searchTerm ||
                              (p.name || "")
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              (p.barcode || "").includes(searchTerm)),
                        );
                        const isAksesoris = drillPath[0] === "Aksesoris";
                        const isEndLevel =
                          searchTerm ||
                          drillPath.length >= 3 ||
                          (drillPath.length === 2 && !isAksesoris);

                        if (isEndLevel) {
                          const finalFiltered = !searchTerm
                            ? filtered.filter((p) => {
                                if (drillPath.length === 2) {
                                  const field =
                                    drillPath[0] === "Voucher" ||
                                    drillPath[0].includes("Perdana")
                                      ? "provider"
                                      : "brand";
                                  return (
                                    (p.category || "Lain-lain") === drillPath[0] &&
                                    (p[field] || p.brand || p.provider || drillPath[0]) === drillPath[1]
                                  );
                                }
                                if (drillPath.length === 3) {
                                  return (
                                    (p.category || "Lain-lain") === drillPath[0] &&
                                    (p.brand || p.provider || drillPath[0]) === drillPath[1] &&
                                    (p.subCategory || drillPath[0]) === drillPath[2]
                                  );
                                }
                                return true;
                              })
                              .sort((a,b) => {
                                const getPrice = (p: any) => p.discountPrice > 0 ? p.discountPrice : p.sellingPrice;
                                return getPrice(a) - getPrice(b);
                              })
                            : filtered.sort((a,b) => {
                                const getPrice = (p: any) => p.discountPrice > 0 ? p.discountPrice : p.sellingPrice;
                                return getPrice(a) - getPrice(b);
                              });

                          return finalFiltered.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">
                                  {getProductName(p)}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  {p.barcode}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1 items-start">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${p.category === "Voucher" || p.category?.includes("Perdana") ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}
                                  >
                                    {p.category === "Voucher" ||
                                    p.category?.includes("Perdana") ? (
                                      <Wifi className="w-3 h-3" />
                                    ) : (
                                      <Smartphone className="w-3 h-3" />
                                    )}
                                    {p.category}{" "}
                                    {p.brand
                                      ? `• ${p.brand}`
                                      : p.provider
                                        ? `• ${p.provider}`
                                        : ""}
                                  </span>
                                  {p.description && (
                                    <p className="text-[9px] text-slate-400 font-medium max-w-[200px] truncate">
                                      {p.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-slate-500 text-xs">
                                Rp {p.purchasePrice?.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-bold text-blue-600">
                                  Rp {p.sellingPrice?.toLocaleString("id-ID")}
                                </span>
                                {p.discountPrice > 0 && (
                                  <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">
                                    Promo: Rp{" "}
                                    {p.discountPrice.toLocaleString("id-ID")}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {p.visibleBranchIds === "*" ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3" /> Semua
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-amber-100" title={p.visibleBranchIds}>
                                    <MapPin className="w-3 h-3" /> {p.visibleBranchIds?.split(",").length} Cabang
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => startEditing(p)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Ubah"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(p.id, p.name)
                                    }
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ));
                        }

                        let groups: any = {};
                        if (drillPath.length === 0) {
                          groups = filtered.reduce((acc: any, p) => {
                            const val = p.category && p.category !== "UMUM" && p.category !== "LAINNYA" ? p.category : "Lain-lain";
                            if (!acc[val]) acc[val] = [];
                            acc[val].push(p);
                            return acc;
                          }, {});
                        } else if (drillPath.length === 1) {
                          const cat = drillPath[0];
                          const field =
                            cat === "Voucher" || cat.includes("Perdana")
                              ? "provider"
                              : "brand";
                          groups = filtered
                            .filter((p) => (p.category || "Lain-lain") === cat)
                            .reduce((acc: any, p) => {
                              const val = p[field] || p.brand || p.provider || cat;
                              if (!acc[val]) acc[val] = [];
                              acc[val].push(p);
                              return acc;
                            }, {});
                        } else if (drillPath.length === 2 && isAksesoris) {
                          const [cat, brand] = drillPath;
                          groups = filtered
                            .filter(
                              (p) =>
                                (p.category || "Lain-lain") === cat &&
                                (p.brand || p.provider || cat) === brand,
                            )
                            .reduce((acc: any, p) => {
                              const val = p.subCategory || cat;
                              if (!acc[val]) acc[val] = [];
                              acc[val].push(p);
                              return acc;
                            }, {});
                        }

                        return Object.entries(groups).map(
                          ([groupName, items]: [any, any]) => (
                            <tr
                              key={groupName}
                              className="hover:bg-slate-50 cursor-pointer group"
                              onClick={() =>
                                setDrillPath([...drillPath, groupName])
                              }
                            >
                              <td colSpan={2} className="px-4 py-3 md:py-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 ${drillPath.length === 0 ? "bg-blue-50 border-blue-100 text-blue-600" : drillPath.length === 1 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-purple-50 border-purple-100 text-purple-600"}`}
                                  >
                                    {drillPath.length === 0 ? (
                                      <LayoutList className="w-6 h-6" />
                                    ) : drillPath.length === 1 ? (
                                      <Store className="w-6 h-6" />
                                    ) : (
                                      <PackagePlus className="w-6 h-6" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                      {drillPath.length === 0
                                        ? "Kategori Utama"
                                        : drillPath.length === 1
                                          ? "Merek / Provider"
                                          : "Sub-Kategori / Tipe"}
                                    </p>
                                    <p className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight">
                                      {groupName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td
                                colSpan={3}
                                className="px-4 py-3 md:py-4 text-right"
                              >
                                <div className="flex flex-col items-end gap-1">
                                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                    {items.length} Macam
                                  </span>
                                  <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                    LIHAT DETAIL{" "}
                                    <ArrowRightLeft className="w-3 h-3" />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ),
                        );
                      })()}
                    </tbody>
                  </table>
                  {hasMoreProducts && (
                    <div className="p-4 bg-slate-50 flex justify-center border-t border-slate-100">
                      <button 
                        onClick={loadMoreProducts}
                        className="px-6 py-2 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
                      >
                        Muat Lebih Banyak Produk...
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- 4. ADMIN: STOK PER CABANG --- */}
            {activeMenu === "branch_stocks" && profile?.role === "ADMIN" && (
              <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full bg-slate-50 content-fade">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
                      Laporan Stok per Cabang
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                      Stok detail setiap barang di tiap lokasi cabang.
                    </p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari Barang..."
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto border-collapse">
                      <thead>
                        <tr className="bg-slate-200 border-b border-slate-300">
                          <th className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-slate-200 z-10 w-80 border-r border-slate-300">
                            Master Data Produk
                          </th>
                          {branches
                            .slice()
                            .sort((a, b) => naturalSort(a.name, b.name))
                            .map((b) => (
                              <th
                                key={b.id}
                                className="px-2 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center min-w-[100px] border-r border-slate-300"
                              >
                                {b.name}
                              </th>
                            ))}
                          <th className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-widest text-right bg-slate-100 min-w-[100px]">
                            Total Stok
                          </th>
                          <th className="px-4 py-3 text-[10px] font-black text-red-600 uppercase tracking-widest text-center">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {products
                          .filter(
                            (p) =>
                              !searchTerm ||
                              p.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              p.barcode
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                          )
                          .map((p) => {
                            let rowTotal = 0;
                            return (
                              <tr
                                key={p.id}
                                className="hover:bg-blue-50/30 transition-colors"
                              >
                                <td className="px-4 py-3 bg-white sticky left-0 border-r border-slate-300 z-10">
                                  <div className="flex flex-col">
                                    <p className="font-bold text-slate-900 text-[13px] leading-tight mb-1">
                                      {p.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                        {p.barcode}
                                      </span>
                                      {p.expiredAt && (
                                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-widest">
                                          Exp: {p.expiredAt}
                                        </span>
                                      )}
                                      {p.minStock > 0 && (
                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-widest">
                                          Min: {p.minStock}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {branches
                                  .slice()
                                  .sort((a, b) => naturalSort(a.name, b.name))
                                  .map((b) => {
                                    const visibleIds = p.visibleBranchIds || "*";
                                    const isProductVisibleInBranch = visibleIds === "*" || visibleIds.split(",").map((id: string) => id.trim()).includes(b.id);
                                    const qty = isProductVisibleInBranch ? getBranchStock(b.id, p.id) : 0;
                                    rowTotal += qty;
                                    const isLow = isProductVisibleInBranch && p.minStock > 0 && qty <= p.minStock;
                                    return (
                                      <td
                                        key={b.id}
                                        className={`px-2 py-3 text-center text-sm font-black font-mono border-r border-slate-200 ${
                                          !isProductVisibleInBranch 
                                            ? "text-slate-300 bg-slate-50/30 font-normal italic" 
                                            : isLow 
                                              ? "text-red-600 bg-red-50/50" 
                                              : "text-slate-600"
                                        }`}
                                      >
                                        {!isProductVisibleInBranch ? (
                                          <span className="text-[10px] opacity-40">—</span>
                                        ) : qty === 0 ? (
                                          <span className="opacity-20 text-[10px]">
                                            0
                                          </span>
                                        ) : (
                                          qty
                                        )}
                                      </td>
                                    );
                                  })}
                                <td className="px-4 py-3 text-right text-[13px] font-black text-blue-700 font-mono bg-slate-50/50 border-r border-slate-300">
                                  {rowTotal}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(p.id, p.name)
                                    }
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Hapus Master Produk"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- 5. ADMIN: DAFTAR BELANJA (LOW STOCK) --- */}
            {activeMenu === "shopping_list" && profile?.role === "ADMIN" && (
              <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full bg-slate-50 content-fade">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-left">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Daftar Belanja
                      </h2>
                    </div>
                    <p className="text-slate-500 font-medium text-left">
                      Restok inventori atau buat rencana belanja per cabang.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setIsCreatingPlan(!isCreatingPlan);
                        if (!isCreatingPlan) {
                          let itemsToDraft: any[] = products
                            .filter((p) => {
                              if (shoppingListCategory === "Aksesoris")
                                return p.category === "Aksesoris";
                              if (shoppingListCategory === "Voucher/Perdana")
                                return (
                                  p.category === "Voucher" ||
                                  p.category?.includes("Perdana")
                                );
                              return true;
                            })
                            .map((p) => ({ productId: p.id, branchQtys: {} }));
                          setPlanDraftItems(itemsToDraft);
                          setPlanDraftTitle(
                            `Belanja ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}${shoppingListCategory ? " - " + shoppingListCategory : ""}`,
                          );
                        }
                      }}
                      className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isCreatingPlan ? "bg-slate-800 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"}`}
                    >
                      {isCreatingPlan ? (
                        <>
                          <X className="w-4 h-4" /> Batal
                        </>
                      ) : (
                        <>
                          <PlusSquare className="w-4 h-4" /> Buat Rencana Baru
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {!isCreatingPlan ? (
                  <div className="space-y-8">
                    {/* LOW STOCK ALERTS SECTION */}
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl overflow-hidden text-left">
                      <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="text-left">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Auto-Alert: Stok Kritis
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 text-left">
                            Otomatis mendeteksi barang yang perlu segera dipesan/dikirim
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="hidden md:flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Sistem Memantau Real-time</span>
                          </div>
                          <select
                            value={shoppingListBranch}
                            onChange={(e) =>
                              setShoppingListBranch(e.target.value)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Semua Cabang</option>
                            {branches
                              .filter((b) => !hiddenShoppingBranchIds.includes(b.id))
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                          </select>
                          <select
                            value={shoppingListCategory}
                            onChange={(e) =>
                              setShoppingListCategory(e.target.value)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Semua Kategori</option>
                            <option value="Aksesoris">Aksesoris</option>
                            <option value="Voucher/Perdana">
                              Voucher & Perdana
                            </option>
                          </select>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                              <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3 text-left">
                                Item Restock
                              </th>
                              <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                Cabang
                              </th>
                              <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                                Stok Skrg
                              </th>
                              <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                                Batas Min
                              </th>
                              <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {(() => {
                              const alerts: any[] = [];
                              products.forEach((p) => {
                                if (!p.minStock || p.minStock <= 0) return;
                                if (
                                  shoppingListCategory === "Aksesoris" &&
                                  p.category !== "Aksesoris"
                                )
                                  return;
                                if (
                                  shoppingListCategory === "Voucher/Perdana" &&
                                  (p.category === "Aksesoris" ||
                                    p.category === "UMUM")
                                )
                                  return;
                                branches.forEach((b) => {
                                  if (hiddenShoppingBranchIds.includes(b.id)) return;
                                  if (
                                    shoppingListBranch &&
                                    b.id !== shoppingListBranch
                                  )
                                    return;
                                  // Check product visibility for this branch
                                  const visibleIds = p.visibleBranchIds || "*";
                                  const isProductVisibleInBranch = visibleIds === "*" || visibleIds.split(",").map((id: string) => id.trim()).includes(b.id);
                                  if (!isProductVisibleInBranch) return;

                                  const qty = getBranchStock(b.id, p.id);
                                  if (qty <= p.minStock) {
                                    alerts.push({ product: p, branch: b, qty });
                                  }
                                });
                              });
                              if (alerts.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-4 md:px-6 py-12 text-center text-slate-400"
                                    >
                                      <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                          <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">
                                          Semua stok aman terpantau
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                              return alerts.map((a, idx) => (
                                <tr
                                  key={`${a.product.id}-${a.branch.id}`}
                                  className="hover:bg-slate-50/50 transition-colors group"
                                >
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-left">
                                    <p className="font-bold text-slate-800 text-sm tracking-tight text-left">
                                      {a.product.name}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 text-left">
                                      {a.product.category}
                                    </p>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-left">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-tight">
                                      {a.branch.name}
                                    </span>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                    <p
                                      className={`font-mono font-black text-sm ${a.qty === 0 ? "text-red-500" : "text-amber-500"}`}
                                    >
                                      {a.qty}
                                    </p>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                    <p className="font-mono font-bold text-slate-400 text-xs">
                                      {a.product.minStock}
                                    </p>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                    <button
                                      onClick={() => {
                                        setIsCreatingPlan(true);
                                        setPlanDraftTitle(
                                          `Restok ${a.branch.name}`,
                                        );
                                        setPlanDraftItems([
                                          {
                                            productId: a.product.id,
                                            branchQtys: {
                                              [a.branch.id]: (
                                                a.product.minStock * 2
                                              ).toString(),
                                            },
                                          },
                                        ]);
                                      }}
                                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                      Tambah ke Rencana
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* COMPLETED PLANS HISTORY */}
                    <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
                      {shoppingPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex justify-between items-start mb-4 text-left">
                            <div className="text-left">
                              <h4 className="font-black text-slate-800 text-lg tracking-tight mb-1 text-left">
                                {plan.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 text-left">
                                <Clock className="w-3 h-3" />{" "}
                                {new Date(plan.createdAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${plan.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : plan.status === "SENT" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                            >
                              {plan.status}
                            </span>
                          </div>
                          <div className="space-y-2 mb-6">
                            {(plan.items || [])
                              .slice(0, 3)
                              .map((it: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-xs"
                                >
                                  <span className="text-slate-600 truncate max-w-[200px] text-left">
                                    {products.find((p) => p.id === it.productId)
                                      ?.name || "Unknown Product"}
                                  </span>
                                  <span className="font-mono font-black text-slate-400">
                                    ×
                                    {Object.values(
                                      (it.branchQtys || {}) as {
                                        [s: string]: string;
                                      },
                                    ).reduce(
                                      (s, v) => s + parseInt(v || "0"),
                                      0,
                                    )}
                                  </span>
                                </div>
                              ))}
                            {(plan.items || []).length > 3 && (
                              <p className="text-[10px] text-slate-400 font-bold text-center">
                                +{(plan.items || []).length - 3} item lainnya...
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const msg = generateWhatsAppMessage(
                                  plan.items || [],
                                );
                                window.open(
                                  `https://wa.me/?text=${encodeURIComponent(msg)}`,
                                  "_blank",
                                );
                              }}
                              className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Smartphone className="w-3.5 h-3.5" /> Kirim WA
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Review rencana ini?")) {
                                  setIsCreatingPlan(true);
                                  setPlanDraftTitle(plan.title + " (Copy)");
                                  setPlanDraftItems(plan.items || []);
                                }
                              }}
                              className="px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all font-black text-[9px] uppercase tracking-widest"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm("Hapus rencana ini?")) {
                                  await deleteDoc(
                                    doc(db, "shoppingPlans", plan.id),
                                  );
                                }
                              }}
                              className="px-4 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {shoppingPlans.length === 0 && (
                        <div className="col-span-full py-16 bg-slate-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center">
                          <PackagePlus className="w-12 h-12 text-slate-300" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
                            Belum ada riwayat rencana belanja
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* DRAFT EDITOR MODE */
                  <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[600px] content-fade">
                    <div className="p-4 md:p-8 border-b border-slate-100 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden text-left">
                      <div className="flex-1 text-left">
                        <input
                          value={planDraftTitle}
                          onChange={(e) => setPlanDraftTitle(e.target.value)}
                          placeholder="Judul Rencana Belanja..."
                          className="text-lg md:text-2xl font-black text-slate-900 tracking-tight outline-none w-full bg-transparent border-b-2 border-transparent focus:border-blue-500/30 pb-1 text-left"
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-left">
                          Menyusun kebutuhan stok multisabang
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const prod = prompt(
                              "Masukkan Barcode atau Nama Produk:",
                            );
                            if (prod) {
                              const found = products.find(
                                (p) =>
                                  p.barcode === prod ||
                                  p.name
                                    .toLowerCase()
                                    .includes(prod.toLowerCase()),
                              );
                              if (found) {
                                if (
                                  planDraftItems.some(
                                    (i) => i.productId === found.id,
                                  )
                                )
                                  return alert("Produk sudah ada!");
                                setPlanDraftItems([
                                  ...planDraftItems,
                                  { productId: found.id, branchQtys: {} },
                                ]);
                              } else {
                                alert("Produk tidak ditemukan!");
                              }
                            }
                          }}
                          className="px-4 md:px-6 py-3 md:py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Tambah Produk
                        </button>
                        <button
                          onClick={async () => {
                            if (planDraftItems.length === 0)
                              return alert("Tambahkan produk dulu!");
                            const planObj = {
                              title: planDraftTitle,
                              items: planDraftItems,
                              status: "DRAFT",
                              creatorId: user.uid,
                              createdAt: Date.now(),
                            };
                            await addDoc(
                              collection(db, "shoppingPlans"),
                              planObj,
                            );
                            setIsCreatingPlan(false);
                          }}
                          className="px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Simpan Draft
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-x-auto p-4">
                      {planDraftItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
                            Belum ada item yang dipilih
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-separate border-spacing-y-2">
                          <thead>
                            <tr>
                              <th className="px-4 md:px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">
                                Nama Produk / Provider
                              </th>
                              {branches
                                .slice()
                                .sort((a, b) => naturalSort(a.name, b.name))
                                .filter((b) => !hiddenShoppingBranchIds.includes(b.id))
                                .map((b) => (
                                  <th
                                    key={b.id}
                                    className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
                                  >
                                    {b.name}
                                  </th>
                                ))}
                              <th className="px-4 md:px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">
                                Total
                              </th>
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {planDraftItems
                              .slice()
                              .sort((a, b) => {
                                const pa =
                                  products.find((p) => p.id === a.productId)
                                    ?.name || "";
                                const pb =
                                  products.find((p) => p.id === b.productId)
                                    ?.name || "";
                                return naturalSort(pa, pb);
                              })
                              .map((item, idx) => {
                                const p = products.find(
                                  (x) => x.id === item.productId,
                                );
                                const globalIdx = planDraftItems.findIndex(
                                  (x) => x.productId === item.productId,
                                );
                                return (
                                  <tr
                                    key={item.productId}
                                    className="bg-white border-y border-slate-100 shadow-sm hover:border-blue-200 transition-all rounded-xl"
                                  >
                                    <td className="px-4 md:px-6 py-3 md:py-5 rounded-l-2xl border-l border-slate-100 text-left">
                                      <p className="font-extrabold text-slate-800 text-sm tracking-tight text-left">
                                        {p?.name || "Invalid Product"}
                                      </p>
                                      <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1 text-left">
                                        {p?.category}
                                      </p>
                                    </td>
                                    {branches
                                      .slice()
                                      .sort((a, b) =>
                                        naturalSort(a.name, b.name),
                                      )
                                      .filter((b) => !hiddenShoppingBranchIds.includes(b.id))
                                      .map((b) => {
                                        const visibleIds = p?.visibleBranchIds || "*";
                                        const isProductVisibleInBranch = visibleIds === "*" || visibleIds.split(",").map((id: string) => id.trim()).includes(b.id);
                                        if (!isProductVisibleInBranch) {
                                          return (
                                            <td key={b.id} className="px-2 py-3 md:py-5 border-y border-slate-100 text-center text-slate-350">
                                              <span className="text-xs opacity-30 italic font-medium">—</span>
                                            </td>
                                          );
                                        }

                                        const isSafe =
                                          getBranchStock(b.id, item.productId) >
                                          (p?.minStock || 0);
                                        return (
                                          <td
                                            key={b.id}
                                            className="px-2 py-3 md:py-5 border-y border-slate-100 relative group"
                                          >
                                            <input
                                              type="number"
                                              disabled={isSafe}
                                              value={
                                                item.branchQtys[b.id] || ""
                                              }
                                              onChange={(e) => {
                                                const newItems = [
                                                  ...planDraftItems,
                                                ];
                                                newItems[globalIdx].branchQtys =
                                                  {
                                                    ...newItems[globalIdx]
                                                      .branchQtys,
                                                    [b.id]: e.target.value,
                                                  };
                                                setPlanDraftItems(newItems);
                                              }}
                                              placeholder="0"
                                              title={
                                                isSafe
                                                  ? `Stok aman: ${getBranchStock(b.id, item.productId)} (Min: ${p?.minStock || 0})`
                                                  : `Sisa stok: ${getBranchStock(b.id, item.productId)} (Min: ${p?.minStock || 0})`
                                              }
                                              className={`w-16 mx-auto border rounded-xl px-2 py-2 text-center font-mono font-black outline-none focus:ring-4 transition-all ${isSafe ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-500/10 focus:bg-white"}`}
                                            />
                                          </td>
                                        );
                                      })}
                                    <td className="px-4 md:px-6 py-3 md:py-5 text-right font-mono font-black text-slate-900 border-y border-slate-100 bg-slate-50/30">
                                      {Object.values(
                                        (item.branchQtys || {}) as Record<
                                          string,
                                          string
                                        >,
                                      ).reduce(
                                        (s: number, v) =>
                                          s + (parseInt(v || "0") || 0),
                                        0,
                                      )}
                                    </td>
                                    <td className="px-4 py-3 md:py-5 text-right rounded-r-2xl border-r border-slate-100">
                                      <button
                                        onClick={() =>
                                          setPlanDraftItems(
                                            planDraftItems.filter(
                                              (x) =>
                                                x.productId !== item.productId,
                                            ),
                                          )
                                        }
                                        className="p-2 text-slate-300 hover:text-red-500 transition-all font-black text-[9px] uppercase tracking-widest"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="bg-white px-4 md:px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-left">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">
                            Total Item Berbeda
                          </p>
                          <p className="text-xl font-black text-slate-900 text-left">
                            {planDraftItems.length} Produk
                          </p>
                        </div>
                        <div className="bg-white px-4 md:px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-left">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">
                            Total Unit Pesanan
                          </p>
                          <p className="text-xl font-black text-blue-600 text-left">
                            {planDraftItems.reduce(
                              (acc, it) =>
                                acc +
                                Object.values(
                                  (it.branchQtys || {}) as Record<
                                    string,
                                    string
                                  >,
                                ).reduce(
                                  (s: number, v) =>
                                    s + (parseInt(v || "0") || 0),
                                  0,
                                ),
                              0,
                            )}{" "}
                            Pcs
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button
                          onClick={() => {
                            if (planDraftItems.length === 0)
                              return alert("Daftar belanja kosong!");
                            const msg = generateWhatsAppMessage(planDraftItems);
                            window.open(
                              `https://wa.me/?text=${encodeURIComponent(msg)}`,
                              "_blank",
                            );
                          }}
                          className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-5 bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                          <Smartphone className="w-5 h-5" /> Export WA Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeMenu === "audit" &&
              (profile?.role === "AUDIT" || profile?.role === "ADMIN") && (
                <div className="flex-1 flex flex-col bg-white md:m-4 md:rounded shadow-sm border-t md:border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-100 flex flex-col gap-4 justify-between shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex-1 w-full text-left">
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Manajemen Stok Opname</h2>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-left">
                          Target Audit Institusi Cabang:
                        </p>
                        <select
                          value={auditSelectedBranch}
                          onChange={(e) =>
                            setAuditSelectedBranch(e.target.value)
                          }
                          className="w-full sm:max-w-xs text-sm font-bold uppercase tracking-widest px-3 py-2 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 text-left outline-none"
                        >
                          <option value="">
                            -- Pilih Cabang yang Diaudit --
                          </option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative w-full sm:max-w-xs shrink-0 items-center">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder={
                            auditSelectedBranch
                              ? "Cari SKU / Barcode..."
                              : "Pilih cabang untuk mencari..."
                          }
                          disabled={!auditSelectedBranch}
                          className={`w-full bg-white border border-slate-300 rounded pl-9 pr-12 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all ${!auditSelectedBranch ? "bg-slate-50 cursor-not-allowed opacity-50" : "bg-white"}`}
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (e.target.value) setDrillPath([]);
                          }}
                        />
                        <button
                          disabled={!auditSelectedBranch}
                          onClick={() => {
                            if (!auditSelectedBranch) return;
                            setScannerCallback(() => (code: string) => {
                              const found = products.find(
                                (p) => p.barcode === code,
                              );
                              if (found) {
                                setQuickAuditProduct(found);
                              } else {
                                setSearchTerm(code);
                              }
                            });
                            setShowScanner(true);
                          }}
                          className={`absolute right-2 top-2 p-1 transition-all ${!auditSelectedBranch ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-700"}`}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!searchTerm && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-[10px] font-bold uppercase tracking-widest">
                        <button
                          onClick={() => setDrillPath([])}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${drillPath.length === 0 ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                        >
                          <LayoutList className="w-3 h-3" />
                          SEMUA KATEGORI
                        </button>
                        {drillPath.map((path, idx) => (
                          <React.Fragment key={idx}>
                            <ArrowRightLeft className="w-3 h-3 text-slate-300 transform rotate-90 sm:rotate-0" />
                            <button
                              onClick={() =>
                                setDrillPath(drillPath.slice(0, idx + 1))
                              }
                              className={`shrink-0 px-3 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm`}
                            >
                              {path}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-x-auto relative flex flex-col lg:flex-row h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto min-w-[700px] border-r border-slate-100 bg-white">
                      {!auditSelectedBranch && (
                        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                          <MapPin className="w-12 h-12 text-slate-300 mb-3" />
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            Pilih Cabang Terlebih Dahulu
                          </h3>
                          <p className="text-xs text-slate-500 mt-2 max-w-sm">
                            Anda harus memilih cabang mana yang sedang Anda
                            audit stoknya agar sinkronisasi data tepat sasaran.
                          </p>
                        </div>
                      )}

                      <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 shadow-sm">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {searchTerm ||
                              drillPath.length >= 3 ||
                              (drillPath.length === 2 &&
                                drillPath[0] !== "Aksesoris")
                                ? "Produk Audit"
                                : "Pilih Grup"}
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-32 border-x border-slate-200">
                              Stok Sistem
                            </th>
                            <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-widest w-48">
                              Edit Fisik Stok
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-left">
                          {(() => {
                            const filtered = products
                              .filter((p) => {
                                if (!p) return false;
                                // Visibility check
                                const visibleIds = p.visibleBranchIds || "*";
                                const isVisible =
                                  visibleIds === "*" ||
                                  (auditSelectedBranch &&
                                    visibleIds
                                      .split(",")
                                      .map((id: string) => id.trim())
                                      .includes(auditSelectedBranch));
                                if (!isVisible) return false;

                                return (
                                  !searchTerm ||
                                  (p.name || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  (p.barcode || "").includes(searchTerm)
                                );
                              })
                              .sort((a, b) => {
                                const getPrice = (px: any) =>
                                  px.discountPrice > 0
                                    ? px.discountPrice
                                    : px.sellingPrice;
                                return getPrice(a) - getPrice(b);
                              });

                            const isAksesoris = drillPath[0] === "Aksesoris";
                            const isEndLevel =
                              searchTerm ||
                              drillPath.length >= 3 ||
                              (drillPath.length === 2 && !isAksesoris);

                            if (isEndLevel) {
                              const finalFiltered = !searchTerm
                                ? filtered.filter((p) => {
                                    if (drillPath.length === 2) {
                                      const field =
                                        drillPath[0] === "Voucher" ||
                                        (drillPath[0] &&
                                          drillPath[0].includes("Perdana"))
                                          ? "provider"
                                          : "brand";
                                      return (
                                        (p.category || "UMUM") ===
                                          drillPath[0] &&
                                        (p[field] || "UMUM") ===
                                          drillPath[1]
                                      );
                                    }
                                    if (drillPath.length === 3) {
                                      return (
                                        (p.category || "UMUM") ===
                                          drillPath[0] &&
                                        (p.brand || "UMUM") ===
                                          drillPath[1] &&
                                        (p.subCategory || "UMUM") ===
                                          drillPath[2]
                                      );
                                    }
                                    return true;
                                  })
                                : filtered;

                              return finalFiltered.map((p: any) => {
                                const currentStock =
                                  stocks.find(
                                    (s) =>
                                      s.branchId === auditSelectedBranch &&
                                      s.productId === p.id,
                                  )?.qty || 0;
                                return (
                                  <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-left">
                                      <p className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight text-left">
                                        {p.type === "Voucher" ? (
                                          <Wifi className="w-3.5 h-3.5 text-purple-600" />
                                        ) : (
                                          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                        )}
                                        {p.name}
                                      </p>
                                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 text-left flex items-center gap-2">
                                        <span>{p.barcode}</span>
                                        {p.masterSN && p.masterSN !== p.barcode && (
                                          <span className="text-purple-500 font-bold">| M-SN: {p.masterSN}</span>
                                        )}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-center border-x border-slate-50">
                                      <span className="inline-flex items-center justify-center min-w-[40px] h-9 px-2 rounded-lg bg-slate-900 text-white font-black text-[10px]">
                                        {currentStock}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          defaultValue={currentStock}
                                          onBlur={(e) =>
                                            handleAuditStock(
                                              p.id,
                                              e.target.value,
                                            )
                                          }
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-xs font-black focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all outline-none"
                                        />
                                        <button 
                                          onClick={(e) => {
                                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                            handleAuditStock(p.id, input.value);
                                          }}
                                          className="shrink-0 p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            }

                            let groups: any = {};
                            if (drillPath.length === 0) {
                              groups = filtered.reduce((acc: any, p) => {
                                const val = p.category || "UMUM";
                                if (!acc[val]) acc[val] = [];
                                acc[val].push(p);
                                return acc;
                              }, {});
                            } else if (drillPath.length === 1) {
                              const cat = drillPath[0];
                              const field =
                                cat === "Voucher" ||
                                (cat && cat.includes("Perdana"))
                                  ? "provider"
                                  : "brand";
                              groups = filtered
                                .filter(
                                  (p) => (p.category || "UMUM") === cat,
                                )
                                .reduce((acc: any, p) => {
                                  const val = p[field] || "UMUM";
                                  if (!acc[val]) acc[val] = [];
                                  acc[val].push(p);
                                  return acc;
                                }, {});
                            } else if (drillPath.length === 2 && isAksesoris) {
                              const [cat, brand] = drillPath;
                              groups = filtered
                                .filter(
                                  (p) =>
                                    (p.category || "UMUM") === cat &&
                                    (p.brand || "UMUM") === brand,
                                )
                                .reduce((acc: any, p) => {
                                  const val = p.subCategory || "UMUM";
                                  if (!acc[val]) acc[val] = [];
                                  acc[val].push(p);
                                  return acc;
                                }, {});
                            }

                            return Object.entries(groups).map(
                              ([groupName, items]: [any, any]) => (
                                <tr
                                  key={groupName}
                                  className="hover:bg-slate-50 cursor-pointer group"
                                  onClick={() =>
                                    setDrillPath([...drillPath, groupName])
                                  }
                                >
                                  <td className="px-4 py-3 md:py-4 text-left">
                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110 ${drillPath.length === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : drillPath.length === 1 ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-purple-50 border-purple-100 text-purple-600"}`}
                                      >
                                        {drillPath.length === 0 ? (
                                          <LayoutList className="w-6 h-6" />
                                        ) : drillPath.length === 1 ? (
                                          <Store className="w-6 h-6" />
                                        ) : (
                                          <PackagePlus className="w-6 h-6" />
                                        )}
                                      </div>
                                      <div className="text-left">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-left">
                                          {drillPath.length === 0
                                            ? "Grup Kategori"
                                            : drillPath.length === 1
                                              ? "Merek / Provider"
                                              : "Sub-Kategori / Tipe"}
                                        </p>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight text-left">
                                          {groupName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    colSpan={2}
                                    className="px-4 py-3 md:py-4 text-right"
                                  >
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                        {items.length} Barang
                                      </span>
                                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                        BUKA FOLDER{" "}
                                        <ArrowRightLeft className="w-3 h-3" />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ),
                            );
                          })()}
                        </tbody>
                      </table>
                  </div>

                  {/* SIDEBAR: AUDIT OPERATIONS */}
                  <div className="w-full lg:w-[350px] bg-slate-50 overflow-y-auto shrink-0 shadow-inner flex flex-col h-full border-l border-slate-200 relative">
                      {!auditSelectedBranch && (
                        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 md:p-8 text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-center mb-4 border border-slate-100">
                            <Lock className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Operasi Terkunci
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">
                            Pilih cabang di atas untuk input stok
                          </p>
                        </div>
                      )}
                      <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10 text-left">
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                          <button
                            onClick={() => setAuditSidebarTab("incoming")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${auditSidebarTab === "incoming" ? "bg-white shadow-sm text-emerald-600" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Stok Masuk
                          </button>
                          <button
                            onClick={() => setAuditSidebarTab("disposal")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${auditSidebarTab === "disposal" ? "bg-white shadow-sm text-red-600" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Pemusnahan
                          </button>
                          <button
                            onClick={() => setAuditSidebarTab("transfer")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${auditSidebarTab === "transfer" ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Antar Cabang
                          </button>
                          <button
                            onClick={() => setAuditSidebarTab("logs")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${auditSidebarTab === "logs" ? "bg-white shadow-sm text-amber-600" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                          >
                            <HistoryIcon className="w-3.5 h-3.5" /> Riwayat
                          </button>
                        </div>
                      </div>

                      <div className="p-4 md:p-6">
                        {auditSidebarTab === "incoming" ? (
                          <>
                            <div className="flex items-center gap-4 mb-8 bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm text-left">
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <PackagePlus className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                  Pemasokan
                                </h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                  Tambah Stok Baru Dari Pusat
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6 text-left">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Pilih Barang:
                                </label>
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Cari Nama Produk..."
                                      value={auditProductSearch}
                                      onChange={(e) => setAuditProductSearch(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[11px] font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                    />
                                    {auditProductSearch && (
                                      <button 
                                        onClick={() => setAuditProductSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <select
                                    value={auditSelectedProductId}
                                    onChange={(e) => setAuditSelectedProductId(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-[11px] font-black uppercase focus:ring-2 focus:ring-blue-600 shadow-sm transition-all outline-none appearance-none cursor-pointer"
                                  >
                                    <option value="">-- {auditProductSearch ? "HASIL PENCARIAN" : "PILIH PRODUK"} --</option>
                                    {products
                                      .filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase()))
                                      .map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} (
                                        {stocks.find(
                                          (s) =>
                                            s.productId === p.id &&
                                            s.branchId === auditSelectedBranch,
                                        )?.qty || 0}
                                        )
                                      </option>
                                    ))}
                                    {products.filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase())).length === 0 && auditProductSearch && (
                                      <option disabled>Produk tidak ditemukan...</option>
                                    )}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Supplier / Keterangan:
                                </label>
                                <input
                                  id="audit-add-supplier"
                                  type="text"
                                  placeholder="Contoh: Stok Pusat / Kiriman JNE"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-xs font-black focus:ring-2 focus:ring-blue-600 shadow-sm outline-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Jumlah Tambahan:
                                </label>
                                <input
                                  id="audit-add-qty"
                                  type="number"
                                  placeholder="Contoh: 50"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-xs font-black focus:ring-2 focus:ring-blue-600 shadow-sm text-center outline-none"
                                />
                              </div>

                              <button
                                onClick={async () => {
                                  const pId = auditSelectedProductId;
                                  const q = parseInt(
                                    (
                                      document.getElementById(
                                        "audit-add-qty",
                                      ) as HTMLInputElement
                                    ).value,
                                  );
                                  const s = (
                                    document.getElementById(
                                      "audit-add-supplier",
                                    ) as HTMLInputElement
                                  ).value;
                                  if (
                                    !pId ||
                                    isNaN(q) ||
                                    q <= 0 ||
                                    !auditSelectedBranch
                                  )
                                    return alert(
                                      "Lengkapi data pemasokan & pilih cabang!",
                                    );
 
                                  await handleStockAddition(
                                    pId,
                                    q,
                                    s || "Stok Pusat",
                                    auditSelectedBranch,
                                  );
 
                                  setAuditSelectedProductId("");
                                  setAuditProductSearch("");
                                  (
                                    document.getElementById(
                                      "audit-add-qty",
                                    ) as HTMLInputElement
                                  ).value = "";
                                  (
                                    document.getElementById(
                                      "audit-add-supplier",
                                    ) as HTMLInputElement
                                  ).value = "";
                                }}
                                className="w-full bg-emerald-600 text-white py-3 md:py-5 rounded-2xl md:rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                Patenkan Pemasokan
                              </button>
                            </div>
                          </>
                        ) : auditSidebarTab === "disposal" ? (
                          <div className="sidebar-group-disposal">
                            <div className="flex items-center gap-4 mb-8 bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm text-left">
                              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                                <Trash2 className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                  Pemusnahan
                                </h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                  Lapor Barang Riject/ED
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6 text-left">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Pilih Barang:
                                </label>
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Cari Nama Produk..."
                                      value={auditProductSearch}
                                      onChange={(e) => setAuditProductSearch(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[11px] font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-sm"
                                    />
                                    {auditProductSearch && (
                                      <button 
                                        onClick={() => setAuditProductSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <select
                                    value={auditSelectedProductId}
                                    onChange={(e) => setAuditSelectedProductId(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-[11px] font-black uppercase focus:ring-2 focus:ring-blue-600 shadow-sm transition-all outline-none appearance-none cursor-pointer"
                                  >
                                    <option value="">-- {auditProductSearch ? "HASIL PENCARIAN" : "PILIH PRODUK"} --</option>
                                    {products
                                      .filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase()))
                                      .map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} (
                                        {stocks.find(
                                          (s) =>
                                            s.productId === p.id &&
                                            s.branchId === auditSelectedBranch,
                                        )?.qty || 0}
                                        )
                                      </option>
                                    ))}
                                    {products.filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase())).length === 0 && auditProductSearch && (
                                      <option disabled>Produk tidak ditemukan...</option>
                                    )}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Kategori Alasan:
                                </label>
                                <select
                                  id="audit-dispose-reason"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-[11px] font-black uppercase focus:ring-2 focus:ring-blue-600 shadow-sm transition-all outline-none"
                                >
                                  <option value="Expired">
                                    Kadaluarsa / ED
                                  </option>
                                  <option value="Damaged">
                                    Barang Rusak / Fisik Cacat
                                  </option>
                                  <option value="Lost">
                                    Hilang / Selisih Kurang
                                  </option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Kuantitas Pemusnahan:
                                </label>
                                <input
                                  id="audit-dispose-qty"
                                  type="number"
                                  placeholder="Contoh: 5"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-xs font-black focus:ring-2 focus:ring-blue-600 shadow-sm text-center outline-none"
                                />
                              </div>

                              <button
                                onClick={async () => {
                                  const pId = auditSelectedProductId;
                                  const q = parseInt(
                                    (
                                      document.getElementById(
                                        "audit-dispose-qty",
                                      ) as HTMLInputElement
                                    ).value,
                                  );
                                  const r = (
                                    document.getElementById(
                                      "audit-dispose-reason",
                                    ) as HTMLSelectElement
                                  ).value;
                                  if (
                                    !pId ||
                                    isNaN(q) ||
                                    q <= 0 ||
                                    !auditSelectedBranch
                                  )
                                    return alert(
                                      "Lengkapi data pemusnahan & pilih cabang!",
                                    );
                                  if (
                                    !window.confirm(
                                      "Yakin ingin memusnahkan stok?\nTindakan ini akan memotong stok sistem secara permanen.",
                                    )
                                  )
                                    return;

                                  await handleStockAdjustment(
                                    pId,
                                    q,
                                    r,
                                    auditSelectedBranch,
                                  );

                                  setAuditSelectedProductId("");
                                  setAuditProductSearch("");
                                  (
                                    document.getElementById(
                                      "audit-dispose-qty",
                                    ) as HTMLInputElement
                                  ).value = "";
                                }}
                                className="w-full bg-slate-900 text-white py-3 md:py-5 rounded-2xl md:rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                Patenkan Pemusnahan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="sidebar-group-transfer">
                            <div className="flex items-center gap-4 mb-8 bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm text-left">
                              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <ArrowRightLeft className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                  Transfer Stok
                                </h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                  Kirim Stok Ke Cabang Lain
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6 text-left">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Pilih Barang:
                                </label>
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Cari Nama Produk..."
                                      value={auditProductSearch}
                                      onChange={(e) => setAuditProductSearch(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[11px] font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    />
                                    {auditProductSearch && (
                                      <button 
                                        onClick={() => setAuditProductSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <select
                                    value={auditSelectedProductId}
                                    onChange={(e) => setAuditSelectedProductId(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-[11px] font-black uppercase focus:ring-2 focus:ring-blue-600 shadow-sm transition-all outline-none appearance-none cursor-pointer"
                                  >
                                    <option value="">-- {auditProductSearch ? "HASIL PENCARIAN" : "PILIH PRODUK"} --</option>
                                    {products
                                      .filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase()))
                                      .map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} (
                                        {stocks.find(
                                          (s) =>
                                            s.productId === p.id &&
                                            s.branchId === auditSelectedBranch,
                                        )?.qty || 0}
                                        )
                                      </option>
                                    ))}
                                    {products.filter(p => !auditProductSearch || (p?.name || "").toLowerCase().includes(auditProductSearch.toLowerCase())).length === 0 && auditProductSearch && (
                                      <option disabled>Produk tidak ditemukan...</option>
                                    )}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Cabang Tujuan:
                                </label>
                                <select
                                  id="audit-transfer-target"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-[11px] font-black uppercase focus:ring-2 focus:ring-blue-600 shadow-sm transition-all outline-none"
                                >
                                  <option value="">-- PILIH CABANG TUJUAN --</option>
                                  {branches
                                    .filter(b => b.id !== auditSelectedBranch)
                                    .map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left">
                                  Kuantitas Transfer:
                                </label>
                                <input
                                  id="audit-transfer-qty"
                                  type="number"
                                  placeholder="Contoh: 10"
                                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 md:py-4 text-xs font-black focus:ring-2 focus:ring-blue-600 shadow-sm text-center outline-none"
                                />
                              </div>

                              <button
                                onClick={async () => {
                                  const pId = auditSelectedProductId;
                                  const q = parseInt(
                                    (
                                      document.getElementById(
                                        "audit-transfer-qty",
                                      ) as HTMLInputElement
                                    ).value,
                                  );
                                  const tId = (
                                    document.getElementById(
                                      "audit-transfer-target",
                                    ) as HTMLSelectElement
                                  ).value;
                                  if (
                                    !pId ||
                                    isNaN(q) ||
                                    q <= 0 ||
                                    !tId ||
                                    !auditSelectedBranch
                                  )
                                    return alert(
                                      "Lengkapi data transfer & pilih cabang!",
                                    );

                                  await handleStockTransfer(
                                    pId,
                                    q,
                                    tId,
                                    auditSelectedBranch,
                                  );

                                  setAuditSelectedProductId("");
                                  setAuditProductSearch("");
                                  (
                                    document.getElementById(
                                      "audit-transfer-qty",
                                    ) as HTMLInputElement
                                  ).value = "";
                                }}
                                className="w-full bg-blue-600 text-white py-3 md:py-5 rounded-2xl md:rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                Patenkan Transfer
                              </button>
                            </div>
                          </div>
                        )}
                        {auditSidebarTab === "logs" && (
                          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-left">
                               <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                 <HistoryIcon className="w-6 h-6" />
                               </div>
                               <div className="text-left">
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
                                   Jejak Audit
                                 </h4>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                   Riwayat Mutasi Cabang Ini
                                 </p>
                               </div>
                             </div>

                             <div className="space-y-3">
                               {adjustments
                                 .filter(a => !auditSelectedBranch || a.branchId === auditSelectedBranch)
                                 .slice(0, 30)
                                 .map((log: any, idx: number) => (
                                   <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
                                     <div className="flex justify-between items-start mb-2">
                                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">
                                         {products.find(p => p.id === log.productId)?.name || "Produk N/A"}
                                       </p>
                                       <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] tracking-widest ${
                                         log.type?.includes("IN") ? "bg-emerald-50 text-emerald-600" : log.type?.includes("OUT") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                       }`}>
                                         {log.type === "STOCK_IN" ? "Masuk" : log.type === "STOCK_OUT" ? "Keluar" : log.type === "TRANSFER_IN" ? "Trf In" : "Trf Out"}
                                       </span>
                                     </div>
                                     <div className="flex justify-between items-end">
                                       <div>
                                         <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest mb-1">
                                           {log.reason || "Tanpa Keterangan"}
                                         </p>
                                         <p className="text-[8px] font-mono text-slate-300 font-bold">
                                           {new Date(log.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                         </p>
                                       </div>
                                       <p className="text-sm font-black text-slate-800">
                                         {log.qty > 0 ? `+${log.qty}` : log.qty}
                                       </p>
                                     </div>
                                   </div>
                                 ))}

                               {adjustments.filter(a => !auditSelectedBranch || a.branchId === auditSelectedBranch).length === 0 && (
                                 <div className="py-12 text-center opacity-30">
                                   <HistoryIcon className="w-12 h-12 mx-auto mb-3" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Belum ada riwayat</p>
                                 </div>
                               )}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* --- 5. CASHIER: POS AREA --- */}
            {/* --- NEW: CASHIER STOCK INPUT --- */}
            {activeMenu === "cashier_stock" && profile?.role === "CASHIER" && (
              <div className="flex-1 bg-slate-50 flex flex-col lg:flex-row gap-4 p-3 md:p-6 overflow-y-auto lg:overflow-hidden h-full">
                {!appConfig.allowCashierStockInput ? (
                  <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-[32px] border border-slate-200 shadow-sm max-w-md mx-auto my-auto text-center space-y-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-inner">
                      <Lock className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        Akses Terkunci
                      </h2>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                        Menu input stok mandiri saat ini dinonaktifkan oleh
                        Admin Pusat. Hubungi atasan Anda untuk mengaktifkan
                        fitur ini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] lg:min-h-0">
                      <div className="p-4 md:p-6 border-b border-slate-100 shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                              <PlusSquare className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                                Pilih Produk Stok-In
                              </h3>
                              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                Navigasi Visual / Tanpa Scan
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setScannerCallback(() => (code: string) => {
                                const found = products.find(p => p.barcode === code);
                                if (found) setSelectedTransferProduct(found);
                                setShowScanner(false);
                              });
                              setShowScanner(true);
                            }}
                            className="bg-emerald-600 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 px-6 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 outline-none sm:w-auto w-full"
                          >
                            <Camera className="w-4 h-4" /> Scan Barcode
                          </button>
                        </div>

                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            placeholder="CARI NAMA / KETIK BARCODE..."
                            value={transferSearch}
                            onChange={(e) => setTransferSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-400 outline-none transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      {/* DRILLDOWN / BROWSE AREA */}
                      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50 min-h-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                          {(() => {
                            const filtered = products
                              .filter(
                                (p) =>
                                  !transferSearch ||
                                  (p?.name || "")
                                    .toLowerCase()
                                    .includes(transferSearch.toLowerCase()) ||
                                  (p?.barcode || "").includes(transferSearch) ||
                                  (p?.brand || "")
                                    .toLowerCase()
                                    .includes(transferSearch.toLowerCase()),
                              )
                              .sort((a, b) => {
                                const getPrice = (px: any) =>
                                  px.discountPrice > 0
                                    ? px.discountPrice
                                    : px.sellingPrice;
                                return getPrice(a) - getPrice(b);
                              });

                            if (transferSearch || transferDrillPath.length >= 2) {
                              const final = !transferSearch
                                ? filtered.filter((p) => {
                                    if (transferDrillPath.length === 1)
                                      return (p.category || "UMUM") === transferDrillPath[0];
                                    if (transferDrillPath.length === 2)
                                      return (p.category || "UMUM") === transferDrillPath[0] && (p.brand || "UMUM") === transferDrillPath[1];
                                    return true;
                                  })
                                : filtered;

                              return final.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setSelectedTransferProduct(p)}
                                  className={`p-3 md:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[110px] group ${
                                    selectedTransferProduct?.id === p.id
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg scale-[0.98]"
                                      : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-800"
                                  }`}
                                >
                                  <div>
                                    <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] mb-1 ${selectedTransferProduct?.id === p.id ? "text-emerald-100" : "text-slate-400"}`}>
                                      {p.brand || "UMUM"}
                                    </p>
                                    <h4 className="text-[10px] md:text-xs font-black uppercase leading-tight line-clamp-2">
                                      {p.name}
                                      {p.masterSN && <span className="block text-[8px] text-emerald-300 font-bold mt-1">SN: {p.masterSN}</span>}
                                    </h4>
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <p className={`text-[9px] md:text-10px font-mono font-bold ${selectedTransferProduct?.id === p.id ? "text-emerald-200" : "text-emerald-600"}`}>
                                      {p.barcode || "NO-BC"}
                                    </p>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedTransferProduct?.id === p.id ? "bg-white/20" : "bg-emerald-50"}`}>
                                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                  </div>
                                </button>
                              ));
                            }

                            let groups: any = {};
                            if (transferDrillPath.length === 0) {
                              groups = filtered.reduce((acc: any, p) => {
                                const val = p.category || "UMUM";
                                if (!acc[val]) acc[val] = [];
                                acc[val].push(p);
                                return acc;
                              }, {});
                            } else if (transferDrillPath.length === 1) {
                              groups = filtered
                                .filter((p) => (p.category || "UMUM") === transferDrillPath[0])
                                .reduce((acc: any, p) => {
                                  const val = p.brand || "UMUM";
                                  if (!acc[val]) acc[val] = [];
                                  acc[val].push(p);
                                  return acc;
                                }, {});
                            }

                            return Object.entries(groups).map(([name, items]: [any, any]) => (
                              <button
                                key={name}
                                onClick={() => setTransferDrillPath([...transferDrillPath, name])}
                                className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[120px] group"
                              >
                                <div className="w-9 h-9 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-xl flex items-center justify-center mb-3 transition-colors">
                                  {transferDrillPath.length === 0 ? <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /> : <Tag className="w-4 h-4 md:w-5 md:h-5" />}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-1">{name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{items.length} Produk</p>
                                </div>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* BREADCRUMBS */}
                      {transferDrillPath.length > 0 && !transferSearch && (
                        <div className="bg-slate-900 px-4 md:px-6 py-3 flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setTransferDrillPath([])}
                            className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Semua
                          </button>
                          {transferDrillPath.map((path, idx) => (
                            <React.Fragment key={idx}>
                              <ChevronRight className="w-3 h-3 text-slate-600" />
                              <button
                                onClick={() => setTransferDrillPath(transferDrillPath.slice(0, idx + 1))}
                                className={`text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate ${
                                  idx === transferDrillPath.length - 1 ? "text-white" : "text-slate-400"
                                }`}
                              >
                                {path}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* INPUT FORM SECTION */}
                    <div className="w-full lg:w-[360px] xl:w-[400px] flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden shrink-0">
                      <div className="p-6 bg-slate-900 text-white text-left shrink-0">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-emerald-400">Input Detail Stok</h3>
                        {selectedTransferProduct ? (
                          <div className="flex gap-4 items-center animate-in slide-in-from-right-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-emerald-300 uppercase leading-none mb-1.5">{selectedTransferProduct.brand}</p>
                              <h4 className="text-[14px] font-black leading-tight uppercase line-clamp-2">{selectedTransferProduct.name}</h4>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center opacity-30">
                            <Hand className="w-10 h-10 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">Pilih produk disamping</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6 md:p-8 space-y-6 flex-1 text-left overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kuantitas Masuk</label>
                          <input
                            type="number"
                            id="cs-qty"
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-5 text-2xl font-black text-center focus:ring-4 focus:ring-emerald-100 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Keterangan / Supplier</label>
                          <input
                            type="text"
                            id="cs-supplier"
                            placeholder="CONTOH: STOK PUSAT"
                            className="w-full bg-slate-50 border border-slate-200 rounded-[20px] px-5 py-4 text-xs md:text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-100 focus:bg-white outline-none transition-all"
                          />
                        </div>

                        <div className="pt-4 mt-auto">
                          <button
                            disabled={!selectedTransferProduct}
                            onClick={async () => {
                              const pId = selectedTransferProduct?.id;
                              const qtyInput = document.getElementById("cs-qty") as HTMLInputElement;
                              const supplierInput = document.getElementById("cs-supplier") as HTMLInputElement;
                              const qty = parseInt(qtyInput.value);
                              const supplier = supplierInput.value;

                              if (!pId || isNaN(qty) || qty <= 0) return alert("Masukkan qty!");

                              await handleStockAddition(pId, qty, supplier || "Input Kasir", profile.branchId);

                              qtyInput.value = "";
                              supplierInput.value = "";
                              setSelectedTransferProduct(null);
                            }}
                            className={`w-full py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                              selectedTransferProduct 
                                ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1" 
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            PATENKAN MASUK
                          </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aktivitas Terakhir</h4>
                           <div className="space-y-3">
                             {adjustments
                              .filter((a) => a.branchId === profile.branchId)
                              .slice(0, 10)
                              .map((a, idx) => {
                                const isPos = a.type === "STOCK_IN" || a.type === "TRANSFER_IN";
                                const isSale = a.reason && a.reason.includes("SALE_");
                                return (
                                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100/50 shadow-sm">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-black text-slate-800 uppercase truncate">
                                        {products.find((p) => p.id === a.productId)?.name || "Produk"}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">
                                          {new Date(a.createdAt).toLocaleTimeString("id-ID")}
                                        </p>
                                        <span className="text-[8px] text-slate-300">•</span>
                                        <p className={`text-[8px] font-black uppercase tracking-widest ${isSale ? "text-blue-500" : isPos ? "text-emerald-500" : "text-rose-500"}`}>
                                          {isSale ? "TERJUAL" : a.reason || (isPos ? "STOK MASUK" : "STOK KELUAR")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-3 shrink-0">
                                      <span className={`text-[12px] font-black ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                                        {isPos ? "+" : "-"}{a.qty}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                             {adjustments.filter((a) => a.branchId === profile.branchId).length === 0 && (
                               <div className="py-10 flex flex-col items-center opacity-20">
                                 <Activity className="w-8 h-8 mb-2" />
                                 <p className="text-[8px] font-black uppercase tracking-widest">Belum ada riwayat</p>
                                </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeMenu === "pos" && profile?.role === "CASHIER" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
                {/* 1. HEADER POS (Sub-navigation & Omzet) */}
                <div className="p-2 border-b border-slate-200 bg-white shadow-sm shrink-0 relative z-50">
                  <div className="flex items-center justify-between mb-3 px-1 text-left">
                    <div className="text-left">
                      <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">
                        POS SYSTEM
                      </h3>
                      <p className="text-sm font-black text-slate-900 leading-none tracking-tight text-left">
                        PULSA & VOUCHER KASIR
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-right gap-1.5">
                      {cart.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl animate-bounce shadow-lg shadow-blue-200 mb-0.5">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <p className="text-[11px] font-black uppercase tracking-tighter leading-none shrink-0">
                            TOTAL: Rp {cartTotal.toLocaleString("id-ID")}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2 py-1.5 rounded-lg shadow-lg shadow-emerald-200">
                        <TrendingUp className="w-3 h-3" />
                        <p className="text-[10px] font-black uppercase tracking-tight leading-none text-right">
                          {shiftOpen
                            ? `Omzet Sif ${shiftType || ""}:`
                            : "Omzet Hari Ini:"}{" "}
                          Rp{" "}
                          {sales
                            .filter(
                              (s) =>
                                s.branchId === profile.branchId &&
                                s.status !== "refunded" &&
                                (shiftOpen && shiftStartTime
                                  ? new Date(s.createdAt || s.timestamp || 0).getTime() >= new Date(shiftStartTime).getTime()
                                  : (s.shiftDate || getLogicalShiftDate(new Date(s.createdAt || s.timestamp || 0))) === getLogicalShiftDate()),
                            )
                            .reduce((acc, s) => acc + (s.total || 0), 0)
                            .toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2 py-1.5 rounded-lg shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => setActiveMenu("incentive")}>
                        <Sparkles className="w-3 h-3" />
                        <p className="text-[10px] font-black uppercase tracking-tight leading-none text-right">
                          Bonus Cabang: Rp {(profile?.role === "ADMIN" 
                            ? (branchSummaries[profile.branchId || ""]?.totalEarned || 0) 
                            : (commissionsSummary?.totalEarned || 0)
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-[8px] font-black text-blue-600 uppercase mt-1 tracking-widest text-right">
                        Klik untuk Detail Bonus Cabang
                      </p>
                    </div>
                  </div>

                  {/* SUB-NAVIGATION TABS */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                    {[
                      { id: "billing", label: "Billing", icon: Calculator },
                      { id: "history", label: "Riwayat", icon: Clock },
                      {
                        id: "transfer",
                        label: "Transfer Stok",
                        icon: ArrowRightLeft,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPosSubView(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest ${posSubView === tab.id ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-400 hover:text-slate-600"}`}
                      >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONTENT VIEWPORT */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                  {/* --- TAMPILAN BILLING (RE-DESIGNED PREMIUM POS COHESIVE SYSTEM) --- */}
                  {posSubView === "billing" && (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full bg-slate-100">
                      {/* AREA KIRI: KATALOG PRODUK INTERAKTIF & FILTER KATEGORI RAILING (LEBIH LUAS - 60% Width) */}
                      <div className="flex-1 flex flex-col overflow-hidden relative border-r border-slate-200">
                        
                        {/* 1. BAR PENCARIAN & SCANNER UTAMA */}
                        <div className="p-3 bg-white border-b border-slate-100 shrink-0 shadow-sm">
                          <div className="relative group">
                            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="KETIK UNTUK CARI ATAU PINDAI BARCODE PRODUK..."
                              value={searchTerm}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-20 py-3 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase tracking-tight placeholder:text-slate-400 text-slate-800"
                            />
                            
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                              {searchTerm && (
                                <button
                                  onClick={() => {
                                    setSearchTerm("");
                                    setSearchSuggestions([]);
                                    searchInputRef.current?.focus();
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setShowScanner(true);
                                  setScannerCallback(
                                    () => (code: string) => setSearchTerm(code),
                                  );
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
                                title="Buka Kamera Barcode"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            </div>

                            {/* DROPDOWN HASIL PENCARIAN CEPAT */}
                            {searchSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left font-sans">
                                    Hasil Pencarian Instan:
                                  </p>
                                  <button onClick={() => setSearchSuggestions([])}>
                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                                  </button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                  {searchSuggestions.slice(0, 10).map((p) => (
                                    <button
                                      key={p.id}
                                      onClick={() => {
                                        addToCart(p);
                                        setSearchTerm("");
                                        setSearchSuggestions([]);
                                        searchInputRef.current?.focus();
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-blue-600 hover:text-white flex items-center justify-between group border-b border-slate-100 last:border-0"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white/20 flex items-center justify-center shrink-0">
                                          {p.category === "Voucher" ? (
                                            <Wifi className="w-4 h-4 text-blue-600 group-hover:text-white" />
                                          ) : (
                                            <Smartphone className="w-4 h-4 text-slate-600 group-hover:text-white" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-black uppercase tracking-tight leading-none text-left text-slate-800 group-hover:text-white">
                                            {getProductName(p)}
                                            {p.masterSN && <span className="ml-1.5 text-purple-600 group-hover:text-purple-200 font-mono">({p.masterSN})</span>}
                                          </p>
                                          <p className="text-[8px] font-black text-blue-600 mt-1 bg-blue-50 px-1 py-0.5 rounded leading-none group-hover:bg-white/15 group-hover:text-white uppercase text-left">
                                            Stok Cabang: {getBranchStock(profile?.branchId || "", p.id)} Pcs
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-xs font-black text-emerald-600 group-hover:text-white text-right font-mono">
                                        Rp {p.sellingPrice.toLocaleString("id-ID")}
                                      </p>
                                    </button>
                                  ))}
                                  {searchTerm.length >= 3 && (
                                    <button 
                                      onClick={handleFullDatabaseSearch}
                                      disabled={isSearchingProducts}
                                      className="w-full p-4 bg-slate-50 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 flex items-center justify-center gap-2 border-t border-slate-100 disabled:opacity-50"
                                    >
                                      {isSearchingProducts ? <Loader2 className="w-3 h-3 animate-spin text-blue-600"/> : <Search className="w-3.5 h-3.5 text-blue-600"/>}
                                      Cari Mendalam di Database Pusat
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {scanIndicator && (
                            <div className="mt-2 bg-emerald-600 text-white text-[8px] p-2 rounded-lg font-black uppercase text-center animate-pulse shadow-sm flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              {scanIndicator}
                            </div>
                          )}
                        </div>

                        {/* 1.5 PANEL PRODUK TERLARIS */}
                        {bestSellers.length > 0 && (
                          <div className="bg-white p-3 border-b border-slate-150">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Produk Terlaris (Klik untuk Tambah)</p>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                              {bestSellers.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => addToCart(p)}
                                  className="flex-shrink-0 bg-slate-50 border border-slate-200 p-2 rounded-lg text-left w-32 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-black"
                                >
                                  <p className="text-[10px] uppercase text-slate-800 truncate mb-1">{getProductName(p)}</p>
                                  <p className="text-[10px] text-emerald-600 font-mono">Rp {p.sellingPrice.toLocaleString("id-ID")}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. CAPSULE SCROLL BAR KATEGORI (INTERAKTIF & INDAH) */}
                        <div className="bg-white px-3 py-2 border-b border-slate-200/60 shrink-0 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth items-center">
                          <button
                            onClick={() => {
                              setPosSelectedCategory("Semua");
                              setPosSelectedBrand("Semua");
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              posSelectedCategory === "Semua"
                                ? "bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-900/10"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60"
                            }`}
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>SEMUA</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${posSelectedCategory === "Semua" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"}`}>
                              {products.filter(p => {
                                const visibleIds = p.visibleBranchIds || "*";
                                return visibleIds === "*" || (profile?.branchId && visibleIds.split(",").map((id: string) => id.trim()).includes(profile.branchId));
                              }).length}
                            </span>
                          </button>

                          {DEFAULT_CATEGORIES.map((cat) => {
                            const matchCount = products.filter(p => {
                              const visibleIds = p.visibleBranchIds || "*";
                              const isVisible = visibleIds === "*" || (profile?.branchId && visibleIds.split(",").map((id: string) => id.trim()).includes(profile.branchId));
                              return isVisible && p.category === cat;
                            }).length;

                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  setPosSelectedCategory(cat);
                                  setPosSelectedBrand("Semua");
                                }}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                  posSelectedCategory === cat
                                    ? "bg-blue-600 border border-blue-700 text-white shadow-md shadow-blue-600/15"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60"
                                }`}
                              >
                                <span>{cat}</span>
                                {matchCount > 0 && (
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${posSelectedCategory === cat ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"}`}>
                                    {matchCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* SUB-BAR FILTER MERK KHUSUS AKSESORIS */}
                        {posSelectedCategory === "Aksesoris" && (
                          <div className="bg-slate-50/50 px-3 py-1.5 border-b border-slate-200/45 shrink-0 flex gap-1 overflow-x-auto no-scrollbar items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Brand:</span>
                            {["Semua", "Robot", "Vivan", "Foomee", "Acome", "Ugreen", "Baseus", "Anker", "Lenyes", "Jete"].map((brand) => (
                              <button
                                key={brand}
                                onClick={() => setPosSelectedBrand(brand)}
                                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                  posSelectedBrand === brand
                                    ? "bg-white border-blue-500 text-blue-600 shadow-sm font-black"
                                    : "bg-transparent border-slate-250 text-slate-400 hover:text-slate-600 hover:border-slate-350"
                                }`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 3. SHELF GRID UTAMA: PRODUK DAFTAR DI CABANG INI */}
                        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 relative">
                          {!shiftOpen && profile?.branchId && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-[55] flex items-center justify-center p-4">
                              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl text-center max-w-[280px] w-full transform transition-all animate-in fade-in zoom-in-95">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Clock className="w-6 h-6 animate-pulse" />
                                </div>
                                <h3 className="text-sm font-black mb-1 tracking-tight text-slate-800 uppercase text-center">
                                  Shift Kasir Terkunci
                                </h3>
                                <p className="text-[9px] text-slate-400 mb-5 font-bold uppercase tracking-wider px-2 opacity-80 text-center leading-normal">
                                  Silakan buka shift dan set saldo modal untuk memulai transaksi penjualan.
                                </p>
                                <button
                                  onClick={() => setActiveMenu("shift")}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-widest transition-colors shadow-lg shadow-blue-200"
                                >
                                  Mulai Buka Shift
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[8px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
                                <LayoutList className="w-3 h-3 text-slate-400" />
                                Katalog Rak: {posSelectedCategory}
                                {posSelectedCategory === "Aksesoris" && posSelectedBrand !== "Semua" && ` • ${posSelectedBrand}`}
                              </p>
                              <p className="text-[8px] font-black text-blue-600 lowercase tracking-tight animate-pulse">
                                {posFilteredProducts.length} produk di cabang
                              </p>
                            </div>

                            {posFilteredProducts.length === 0 ? (
                              <div className="py-24 text-center flex flex-col items-center justify-center max-w-[320px] mx-auto opacity-70">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-150 shadow-inner">
                                  <Boxes className="w-6 h-6 text-slate-400" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Stok Rak Kosong</h4>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                                  Tidak ada item yang cocok dengan filter atau kata kunci di cabang ini. Silakan ubah filter kategori atau bersihkan pencarian.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                                {posFilteredProducts
                                  .filter(p => {
                                    if (posSelectedCategory === "Aksesoris" && posSelectedBrand !== "Semua") {
                                      return p.brand?.toLowerCase() === posSelectedBrand.toLowerCase();
                                    }
                                    return true;
                                  })
                                  .map((p) => {
                                    const stock = getBranchStock(profile?.branchId || "", p.id);
                                    const isOutOfStock = stock <= 0;
                                    const hasDiscount = p.discountPrice > 0;
                                    const price = hasDiscount ? p.discountPrice : p.sellingPrice;
                                    
                                    return (
                                      <button
                                        key={p.id}
                                        onClick={async () => {
                                          if (isOutOfStock) {
                                            const confirmAdd = await triggerConfirm(`Peringatan: Stok ${p.name} di sistem terdeteksi kosong (0 Pcs).\n\nTetap tambahkan ke nota penjualan?`);
                                            if (!confirmAdd) return;
                                          }
                                          addToCart(p);
                                          setScanIndicator(`Ditambahkan: ${getProductName(p)}`);
                                          setTimeout(() => setScanIndicator(null), 1000);
                                        }}
                                        className={`group text-left bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between transition-all hover:border-blue-500 hover:shadow-md active:scale-[0.97] duration-155 cursor-pointer relative overflow-hidden ${isOutOfStock ? "bg-red-50/10 border-dashed" : ""}`}
                                      >
                                        <div>
                                          {/* Mini Tag Brand / Provider */}
                                          <div className="flex justify-between items-start mb-1.5 gap-1.5">
                                            <span className={`text-[7px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${
                                              p.category === "Voucher" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-700"
                                            }`}>
                                              {p.brand || p.provider || p.category || "Aksesoris"}
                                            </span>
                                            
                                            <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded leading-none ${
                                              isOutOfStock 
                                                ? "bg-rose-50 text-rose-600" 
                                                : stock < 5 
                                                  ? "bg-amber-100 text-amber-800" 
                                                  : "bg-emerald-50 text-emerald-600"
                                            }`}>
                                              {isOutOfStock ? "HABIS" : `STOK: ${stock}`}
                                            </span>
                                          </div>

                                          <h5 className="text-[10px] font-black text-slate-850 uppercase leading-snug tracking-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {getProductName(p)}
                                          </h5>
                                        </div>

                                        <div className="mt-auto pt-2 border-t border-slate-150 flex items-end justify-between">
                                          <div>
                                            {hasDiscount && (
                                              <p className="text-[7.5px] font-black text-slate-400 line-through leading-none mb-0.5">
                                                Rp {p.sellingPrice.toLocaleString("id-ID")}
                                              </p>
                                            )}
                                            <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none">
                                              Rp {price.toLocaleString("id-ID")}
                                            </p>
                                          </div>
                                          <div className="w-5 h-5 bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white rounded-lg flex items-center justify-center transition-all">
                                            <Plus className="w-3 h-3 group-hover:stroke-[3]" />
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AREA KANAN: NOTA TAGIHAN & CHECKOUT KASIR PERSISTEN (370px - 410px Width di Desktop) */}
                      <div className="w-full md:w-[370px] lg:w-[410px] bg-white flex flex-col shrink-0 overflow-hidden relative shadow-2xl z-30 border-l border-slate-200">
                        
                        {/* HEADER DAFTAR NOTA */}
                        <div className="p-3 border-b border-slate-150 flex justify-between items-center bg-slate-50 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-4 h-4 text-slate-650" />
                            <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-widest leading-none">
                              Nota Pelanggan ({cart.reduce((s, i) => s + i.qty, 0)})
                            </h4>
                          </div>
                          {cart.length > 0 && (
                            <button
                              onClick={async () => {
                                const confirmClear = await triggerConfirm("Batal seluruh nota dan kosongkan keranjang?");
                                if (confirmClear) {
                                  setCart([]);
                                }
                              }}
                              className="text-[9px] font-black text-rose-650 hover:text-rose-855 transition-colors uppercase tracking-widest hover:underline"
                            >
                              Bersihkan
                            </button>
                          )}
                        </div>

                        {/* LIST ACTIVE ITEMS */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
                          {cart.length === 0 ? (
                            <div className="py-28 px-6 text-center flex flex-col items-center justify-center opacity-70">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Calculator className="w-7 h-7 text-slate-300" />
                              </div>
                              <h5 className="text-[9px] font-black text-slate-750 uppercase tracking-widest mb-1">Nota Kosong</h5>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                                Silakan ketik nama produk, scan barcode, atau tap katalog di rak sebelah kiri untuk mengisi penjualan nota.
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100 bg-white">
                              {cart.map((item, idx) => {
                                const stockVal = getBranchStock(profile?.branchId || "", item.product.id);
                                const isDiscont = item.product.discountPrice > 0;
                                const itemPrice = isDiscont ? item.product.discountPrice : item.product.sellingPrice;
                                const itemSubtotal = itemPrice * item.qty;

                                return (
                                  <div
                                    key={item.product.id + (item.sn || '') + idx}
                                    className="p-3 hover:bg-slate-50/70 transition-colors flex gap-2.5 items-start"
                                  >
                                    <button
                                      onClick={() => removeFromCart(item.product.id, item.sn)}
                                      className="p-1.5 mt-1 text-slate-350 hover:text-red-650 rounded-lg transition-colors group shrink-0"
                                      title="Hapus dari Nota"
                                    >
                                      <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500" />
                                    </button>

                                    <div className="flex-1 min-w-0 text-left">
                                      <div className="flex items-start gap-1 justify-between">
                                        <h6 className="text-[10px] font-black text-slate-800 uppercase leading-snug truncate">
                                          {getProductName(item.product)}
                                        </h6>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[9px] text-left">
                                        <span className="font-bold text-blue-650 text-left">
                                          @Rp {itemPrice.toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-400 font-medium">
                                          Sub: Rp {itemSubtotal.toLocaleString("id-ID")}
                                        </span>
                                        {item.sn && (
                                          <span className="bg-slate-800 text-white rounded px-1.5 py-0.5 text-[7.5px] font-black tracking-widest uppercase">
                                            SN: {item.sn}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLLER JUMLAH */}
                                    <div className="flex items-center gap-1.5 shrink-0 scale-90">
                                      <button
                                        onClick={() => updateCartQty(item.product.id, -1)}
                                        className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all active:scale-90 flex items-center justify-center font-bold"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-[10.5px] font-black w-6 text-center text-slate-900 leading-none">
                                        {item.qty}
                                      </span>
                                      <button
                                        onClick={() => updateCartQty(item.product.id, 1)}
                                        className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all active:scale-90 flex items-center justify-center font-bold"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* PANEL CHECKSUM totals & QUICK ACTION (Rp POS INDONESIA) */}
                        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
                          
                          {/* BONUS INSENTIF BAGI KASIR (TRANSPARENSI & MOTIVASI) */}
                          <div className="flex justify-between items-center text-[9px] mb-2 px-1 text-slate-500 font-bold uppercase tracking-wider">
                            <span>Bonus Penjaga (Insentif)</span>
                            <span className="text-blue-600 font-black">
                              +Rp {cart.reduce((acum, item) => {
                                const cm = item.product.commissionAmount || 0;
                                return acum + (cm * item.qty);
                              }, 0).toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mb-3 px-1 text-left">
                            <div>
                              <p className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest mb-0.5">Subtotal Tagihan</p>
                              <p className="text-xs font-bold text-slate-500 font-mono">Rp {cartTotal.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded inline-block mb-1">Akan Dibayar</p>
                              <p className="text-xl font-black text-slate-900 leading-none tracking-tighter">
                                Rp {cartTotal.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>

                          {/* TOMBOL BAYAR CEPAT & CETAK */}
                          <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessingCheckout}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-35 text-white font-black py-4 rounded-xl text-[11px] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 uppercase tracking-widest transition-all cursor-pointer font-sans"
                          >
                            {isProcessingCheckout ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <Banknote className="w-4.5 h-4.5 text-white" />
                            )}
                            <span>{isProcessingCheckout ? "MEMPROSES TRANSAKSI..." : "BAYAR & CETAK NOTA"}</span>
                          </button>
                        </div>
                      </div>

                      {/* CATALOG MOBILE DRAWER OVERLAY (HANYA AKTIF JIKA TERSEGMENTASI DI SCREEN KECIL) */}
                      {showMobileCart && (
                        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 flex justify-end">
                          <div className="w-[290px] md:w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                            <div className="p-4 border-b border-slate-150 flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                  Katalog Produk Cabang
                                </h4>
                                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter mt-1">Terlaris dan Rekomendasi</p>
                              </div>
                              <button
                                onClick={() => setShowMobileCart(false)}
                                className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <X className="w-5 h-5 text-slate-500" />
                              </button>
                            </div>

                            {/* Catalog Search */}
                            <div className="p-3 border-b border-slate-50">
                               <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    type="text"
                                    placeholder="Cari produk terlaris..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs font-bold"
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                  />
                               </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 text-left">
                              <div className="grid grid-cols-1 gap-2.5">
                                {sortedProductsBySales
                                  .filter(p => {
                                    if (!catalogSearch) return true;
                                    const searchLower = catalogSearch.toLowerCase();
                                    const searchWords = searchLower.split(/\s+/).filter(Boolean);
                                    const name = (p.name || "").toLowerCase();
                                    const barcode = (p.barcode || "").toLowerCase();
                                    const brand = (p.brand || "").toLowerCase();
                                    const category = (p.category || "").toLowerCase();
                                    const provider = (p.provider || "").toLowerCase();
                                    
                                    return searchWords.every(word => 
                                      name.includes(word) || 
                                      barcode.includes(word) ||
                                      brand.includes(word) ||
                                      category.includes(word) ||
                                      provider.includes(word)
                                    );
                                  })
                                  .sort((a, b) => {
                                    if (!catalogSearch) return 0;
                                    
                                    const nameA = (a.name || "").toLowerCase();
                                    const nameB = (b.name || "").toLowerCase();
                                    const searchLower = catalogSearch.toLowerCase();
                                    const searchWords = searchLower.split(/\s+/).filter(Boolean);

                                    const startsA = nameA.startsWith(searchLower);
                                    const startsB = nameB.startsWith(searchLower);
                                    if (startsA && !startsB) return -1;
                                    if (!startsA && startsB) return 1;

                                    const priceA = a.discountPrice > 0 ? a.discountPrice : a.sellingPrice;
                                    const priceB = b.discountPrice > 0 ? b.discountPrice : b.sellingPrice;
                                    return priceA - priceB;
                                  })
                                  .map((p) => {
                                    const stock = getBranchStock(profile?.branchId || "", p.id);
                                    const isOutOfStock = stock <= 0;

                                    return (
                                      <button
                                        key={p.id}
                                        onClick={async () => {
                                          if (isOutOfStock) {
                                            const confirmAdd = await triggerConfirm(`Peringatan: Stok ${p.name} di sistem kosong.\n\nTetap tambahkan ke nota penjualan?`);
                                            if (!confirmAdd) return;
                                          }
                                          addToCart(p);
                                          setScanIndicator(`Ditambah: ${p.name}`);
                                          setTimeout(() => setScanIndicator(null), 1000);
                                        }}
                                        className="w-full text-left p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98] group"
                                      >
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                          {p.category === "Voucher" ? (
                                            <Wifi className="w-4 h-4" />
                                          ) : (
                                            <Smartphone className="w-4 h-4" />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1 flex flex-col justify-between text-left">
                                          <p className="text-[9.5px] font-black uppercase text-slate-800 leading-tight">
                                            {getProductName(p)}
                                            {p.salesCount > 0 && <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-500 text-white text-[7px] rounded font-black tracking-widest uppercase animate-pulse">🔥 Terlaris ({p.salesCount})</span>}
                                            {p.masterSN && <span className="block text-[7px] text-blue-500 font-bold mt-0.5">SN: {p.masterSN}</span>}
                                          </p>
                                          <div className="flex items-center justify-between mt-1">
                                             <p className="text-[9px] font-bold text-blue-600">
                                                Rp ${p.sellingPrice.toLocaleString("id-ID")}
                                             </p>
                                             <div className="bg-slate-100 text-[8px] font-black px-1.5 py-0.5 rounded text-slate-500">
                                               + TAMBAH
                                             </div>
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* --- TAMPILAN RIWAYAT (HISTORY) --- */}
                  {posSubView === "history" && (
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-2 space-y-2 text-left">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full max-w-4xl mx-auto text-left">
                        <div className="flex items-center justify-between mb-3 px-1 text-left">
                          <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 text-left">
                            <Clock className="w-3 h-3 text-blue-600 text-left" />{" "}
                            Rekap Trx Hari Ini
                          </h4>
                          <span className="text-[7px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
                            Live Updates
                          </span>
                        </div>
                        <div className="space-y-2 text-left">
                          {sales
                            .filter(
                              (s) =>
                                s.branchId === profile.branchId &&
                                (shiftOpen && shiftStartTime
                                  ? new Date(s.createdAt || s.timestamp || 0).getTime() >= new Date(shiftStartTime).getTime()
                                  : (s.shiftDate || getLogicalShiftDate(new Date(s.createdAt || s.timestamp || 0))) === (shiftLogicalDate || getLogicalShiftDate())),
                            )
                            .sort(
                              (a, b) =>
                                new Date(
                                  b.createdAt || b.timestamp || 0,
                                ).getTime() -
                                new Date(
                                  a.createdAt || a.timestamp || 0,
                                ).getTime(),
                            )
                            .map((sale) => (
                              <div
                                key={sale.id}
                                className="p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:border-blue-200 hover:bg-white group text-left"
                              >
                                <div className="flex justify-between items-start mb-2 text-left">
                                  <div className="text-left">
                                    <div className="flex items-center gap-1.5 mb-1 text-left">
                                      <p className="text-[10px] font-black text-slate-900 leading-none text-left">
                                        NOTA #{sale.id?.slice(-6).toUpperCase()}
                                      </p>
                                      <span
                                        className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded-sm ${sale.status === "refunded" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
                                      >
                                        {sale.status === "refunded"
                                          ? "REFUNDED"
                                          : "SUCCESS"}
                                      </span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-left">
                                      {new Date(
                                        sale.createdAt || sale.timestamp || 0,
                                      ).toLocaleTimeString("id-ID")}{" "}
                                      • {sale.items?.length || 0} Item
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 leading-none tracking-tight text-right">
                                      Rp{" "}
                                      {(sale.total || 0).toLocaleString(
                                        "id-ID",
                                      )}
                                    </p>
                                    <p className="text-[7px] text-blue-500 font-bold uppercase mt-1 tracking-widest text-right">
                                      {sale.cashierName || "Kasir"}
                                    </p>
                                  </div>
                                </div>

                                {/* Daftar Produk dengan Fitur Refund Per Item */}
                                <div className="mb-3 space-y-1.5 bg-white/50 p-2 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                                  {sale.items?.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className={`flex justify-between items-start text-[8px] font-bold uppercase tracking-tight ${item.refunded ? "opacity-40 line-through text-slate-300" : "text-slate-600"}`}
                                    >
                                      <div className="flex-1 pr-2">
                                        <div className="flex items-center gap-1.5">
                                          <p className="leading-tight">
                                            {item.product?.name || item.name || "Produk"}
                                          </p>
                                          {item.refunded && (
                                            <span className="bg-red-500 text-white text-[5px] px-1 py-0 rounded-sm leading-none font-black">
                                              REFUNDED
                                            </span>
                                          )}
                                        </div>
                                        {item.sn ? (
                                          <p
                                            className={`${item.refunded ? "text-slate-300" : "text-blue-500"} mt-0.5 text-[7px] font-black`}
                                          >
                                            SN: {item.sn}
                                          </p>
                                        ) : null}
                                      </div>
                                      <div className="shrink-0 flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                          <span className="text-slate-400 shrink-0">
                                            x{item.qty}
                                          </span>
                                          <span className="min-w-[50px] text-right shrink-0">
                                            Rp{" "}
                                            {(
                                              item.price * item.qty
                                            ).toLocaleString("id-ID")}
                                          </span>
                                        </div>
                                        {!item.refunded &&
                                          sale.status !== "refunded" && (
                                            <div className="w-6" />
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2 text-left">
                                  <button
                                    onClick={() => handleRefund(sale)}
                                    disabled={
                                      sale.status === "refunded" ||
                                      sale.items?.every((i: any) => i.refunded)
                                    }
                                    className="flex-1 py-1.5 bg-white border border-red-200 text-red-600 text-[8px] font-black rounded-lg uppercase tracking-widest hover:bg-red-50 disabled:opacity-30 disabled:grayscale transition-all shadow-sm"
                                  >
                                    {sale.status === "refunded"
                                      ? "Sudah Direfund"
                                      : "Refund Seluruhnya"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          {sales.filter(
                            (s) =>
                              s.branchId === profile.branchId &&
                              (shiftOpen && shiftStartTime
                                ? new Date(s.createdAt || s.timestamp || 0).getTime() >= new Date(shiftStartTime).getTime()
                                : (s.shiftDate || getLogicalShiftDate(new Date(s.createdAt || s.timestamp || 0))) === (shiftLogicalDate || getLogicalShiftDate())),
                          ).length === 0 && (
                            <div className="py-12 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.2em] text-center w-full mx-auto">
                              Kosong
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAMPILAN MAINTENANCE (STOK OPNAME) --- */}
                  {posSubView === "maintenance" && (
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-2 space-y-2 text-left">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full max-w-xl mx-auto text-left shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4 text-left">
                          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100 text-left shrink-0">
                            <AlertTriangle className="w-4 h-4 text-left" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1 text-left">
                              Stok Opname
                            </h4>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none text-left">
                              Koreksi Stok Fisik
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 text-left">
                          <div className="text-left">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block text-left">
                              Produk:
                            </label>
                            <select
                              className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-500 transition-all outline-none text-left"
                              id="dispose-product"
                            >
                              <option value="" className="text-left">
                                -- PILIH --
                              </option>
                              {products.map((p) => (
                                <option
                                  key={p.id}
                                  value={p.id}
                                  className="text-left"
                                >
                                  {p.name} (
                                  {getBranchStock(profile.branchId, p.id)})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="text-left">
                              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block text-left">
                                Jumlah:
                              </label>
                              <input
                                type="number"
                                id="dispose-qty"
                                placeholder="0"
                                className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-[10px] font-black transition-all outline-none text-left"
                              />
                            </div>
                            <div className="text-left">
                              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block text-left">
                                Alasan:
                              </label>
                              <select
                                id="dispose-reason"
                                className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight outline-none text-left shadow-sm"
                              >
                                <option value="EXPIRED" className="text-left">
                                  KADALUARSA
                                </option>
                                <option value="DAMAGED" className="text-left">
                                  RUSAK
                                </option>
                                <option value="LOST" className="text-left">
                                  HILANG
                                </option>
                              </select>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const pId = (
                                document.getElementById(
                                  "dispose-product",
                                ) as HTMLSelectElement
                              ).value;
                              const q = parseInt(
                                (
                                  document.getElementById(
                                    "dispose-qty",
                                  ) as HTMLInputElement
                                ).value,
                              );
                              const r = (
                                document.getElementById(
                                  "dispose-reason",
                                ) as HTMLSelectElement
                              ).value;
                              if (!pId || isNaN(q) || q <= 0)
                                return alert("Lengkapi data!");
                              handleStockAdjustment(pId, q, r);
                              (
                                document.getElementById(
                                  "dispose-qty",
                                ) as HTMLInputElement
                              ).value = "";
                            }}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />{" "}
                            Simpan Perubahan Stok
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {posSubView === "transfer" && (
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-2 space-y-2 text-left">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full max-w-xl mx-auto text-left shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4 text-left">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 text-left shrink-0">
                            <ArrowRightLeft className="w-4 h-4 text-left" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1 text-left">
                              Transfer Stok
                            </h4>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none text-left">
                              Kirim ke Cabang Lain
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 text-left">
                          <div className="text-left">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block text-left">
                              Cabang Tujuan:
                            </label>
                            <select
                              className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-500 outline-none text-left"
                              id="transfer-target-branch"
                            >
                              <option value="" className="text-left">
                                -- PILIH --
                              </option>
                              {branches
                                .filter((b) => b.id !== profile.branchId)
                                .map((b) => (
                                  <option
                                    key={b.id}
                                    value={b.id}
                                    className="text-left"
                                  >
                                    {b.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="text-left border-t border-slate-100 pt-4">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 block text-left">
                              Produk Transfer:
                            </label>

                            {selectedTransferProduct ? (
                              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                                    {selectedTransferProduct.category ===
                                    "Voucher" ? (
                                      <Wifi className="w-4 h-4" />
                                    ) : (
                                      <Smartphone className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-tight leading-none mb-1">
                                      {selectedTransferProduct.brand ||
                                        "NO BRAND"}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                      {selectedTransferProduct.name}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                                      Stok:{" "}
                                      <span className="text-blue-600">
                                        {getBranchStock(
                                          profile.branchId,
                                          selectedTransferProduct.id,
                                        )}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setSelectedTransferProduct(null)
                                  }
                                  className="p-2 bg-white text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 shadow-sm transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-4 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Cari Produk..."
                                    value={transferSearch}
                                    onChange={(e) =>
                                      setTransferSearch(e.target.value)
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-9 pr-3 rounded-xl text-[10px] font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 transition-all font-mono shadow-inner"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                  {(() => {
                                    const filtered = products.filter(
                                      (p) =>
                                        !transferSearch ||
                                        p.name
                                          .toLowerCase()
                                          .includes(
                                            transferSearch.toLowerCase(),
                                          ) ||
                                        (p.brand || "")
                                          .toLowerCase()
                                          .includes(
                                            transferSearch.toLowerCase(),
                                          ),
                                    );

                                    if (
                                      transferSearch ||
                                      transferDrillPath.length >= 2
                                    ) {
                                      const final = !transferSearch
                                        ? filtered.filter((p) => {
                                            if (transferDrillPath.length === 1)
                                              return (
                                                (p.category || "UMUM") ===
                                                transferDrillPath[0]
                                              );
                                            if (transferDrillPath.length === 2)
                                              return (
                                                (p.category || "UMUM") ===
                                                  transferDrillPath[0] &&
                                                (p.brand || "UMUM") ===
                                                  transferDrillPath[1]
                                              );
                                            return true;
                                          })
                                        : filtered;

                                      return final.map((p) => (
                                        <button
                                          key={p.id}
                                          onClick={() =>
                                            setSelectedTransferProduct(p)
                                          }
                                          className="p-2 bg-white border border-slate-100 rounded-lg text-left hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                                        >
                                          <div className="text-[9px] font-black text-slate-800 line-clamp-2 uppercase tracking-tight mb-1">
                                            {p.name}
                                          </div>
                                          <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                            STOK:{" "}
                                            {getBranchStock(
                                              profile.branchId,
                                              p.id,
                                            )}
                                          </div>
                                        </button>
                                      ));
                                    }

                                    // DRILLDOWN MODE
                                    let groups: any = {};
                                    if (transferDrillPath.length === 0) {
                                      groups = filtered.reduce(
                                        (acc: any, p) => {
                                          const val = p.category || "UMUM";
                                          if (!acc[val]) acc[val] = [];
                                          acc[val].push(p);
                                          return acc;
                                        },
                                        {},
                                      );
                                    } else if (transferDrillPath.length === 1) {
                                      groups = filtered
                                        .filter(
                                          (p) =>
                                            (p.category || "UMUM") ===
                                            transferDrillPath[0],
                                        )
                                        .reduce((acc: any, p) => {
                                          const val = p.brand || "UMUM";
                                          if (!acc[val]) acc[val] = [];
                                          acc[val].push(p);
                                          return acc;
                                        }, {});
                                    }

                                    return Object.entries(groups).map(
                                      ([name, items]: [any, any]) => (
                                        <button
                                          key={name}
                                          onClick={() =>
                                            setTransferDrillPath([
                                              ...transferDrillPath,
                                              name,
                                            ])
                                          }
                                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center hover:bg-white hover:border-blue-200 transition-all shadow-sm group"
                                        >
                                          <div className="text-[9px] font-black text-slate-800 truncate uppercase">
                                            {name}
                                          </div>
                                          <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {items.length} ITEM
                                          </div>
                                        </button>
                                      ),
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-left pt-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block text-left">
                              Jumlah Transfer:
                            </label>
                            <input
                              type="number"
                              id="transfer-qty"
                              placeholder="0"
                              className="w-full bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl text-[10px] font-black outline-none text-left focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            />
                          </div>

                          <button
                            onClick={() => {
                              const bId = (
                                document.getElementById(
                                  "transfer-target-branch",
                                ) as HTMLSelectElement
                              ).value;
                              const pId = selectedTransferProduct?.id;
                              const q = parseInt(
                                (
                                  document.getElementById(
                                    "transfer-qty",
                                  ) as HTMLInputElement
                                ).value,
                              );
                              if (
                                !bId ||
                                !pId ||
                                isNaN(q) ||
                                q <= 0 ||
                                isProcessingTransfer
                              )
                                return alert(
                                  "Pilih Cabang Tujuan, Produk, dan Jumlah Transfer!",
                                );
                              if (
                                !window.confirm(
                                  `Kirim ${q} pcs ${selectedTransferProduct.name} ke cabang tujuan?`,
                                )
                              )
                                return;
                              handleStockTransfer(pId, q, bId);
                              (
                                document.getElementById(
                                  "transfer-qty",
                                ) as HTMLInputElement
                              ).value = "";
                              setSelectedTransferProduct(null);
                              setTransferSearch("");
                              setTransferDrillPath([]);
                            }}
                            disabled={
                              !selectedTransferProduct || isProcessingTransfer
                            }
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 mt-2 active:scale-95"
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isProcessingTransfer ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {isProcessingTransfer
                                  ? "MEMPROSES..."
                                  : "Konfirmasi Transfer"}
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- 6. BONUS & INCENTIVE --- */}
            {activeMenu === "incentive" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
                <div className="p-4 md:p-8 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Bonus & Insentif</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Kelola Komisi Penjualan Karyawan</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
                  {profile?.role === "ADMIN" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                          <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 text-[10px] md:text-sm uppercase tracking-tight">Ringkasan Saldo Per Cabang</h3>
                            <Store className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                          </div>
                          <div className="divide-y divide-slate-50">
                            {branches.map(b => {
                              const summary = branchSummaries[b.id] || { totalEarned: 0 };
                              const balance = summary.totalEarned || 0;
                              
                              return (
                                <div key={b.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                      <Store className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                      <p className="font-black text-slate-800 uppercase tracking-tight">{b.name}</p>
                                      <button 
                                        onClick={() => syncCommissionsSummary(b.id)}
                                        className="flex items-center gap-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1 hover:text-blue-700"
                                      >
                                        <RefreshCw className="w-2.5 h-2.5" /> Sinkronkan Data
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 md:gap-6">
                                    <div className="text-right">
                                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 md:mb-1">Saldo Cabang</p>
                                      <p className="text-lg md:text-xl font-black text-emerald-600 tracking-tighter">Rp {(balance || 0).toLocaleString("id-ID")}</p>
                                    </div>
                                    <button
                                      disabled={balance <= 0 || isProcessingWithdraw}
                                      onClick={() => handleWithdrawCommission(b.id)}
                                      className={`px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shrink-0 ${balance > 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-105" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                                    >
                                      {isProcessingWithdraw ? "Proses..." : "Cairkan"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100 mb-6">
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Total Komisi Seluruh Cabang</p>
                          <p className="text-3xl font-black text-emerald-900 mt-1">
                            Rp {Object.values(branchSummaries).reduce((s, b) => s + (b.totalEarned || 0), 0).toLocaleString("id-ID")}
                          </p>
                          <p className="text-[9px] text-emerald-600 font-bold uppercase mt-2 italic">* Total saldo yang belum dicairkan</p>
                        </div>
                        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-slate-100 p-4 md:p-6">
                          <h3 className="font-black text-slate-800 text-[10px] md:text-sm uppercase tracking-tight mb-4">Aktivitas Bonus Terbaru</h3>
                          <div className="space-y-4">
                            {commissions.slice(0, 10).map((c, idx) => (
                              <div key={idx} className="flex justify-between items-start border-b border-slate-50 pb-4">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-black text-slate-800 uppercase truncate">
                                    {getProductName(c.product, c.productName)}
                                  </p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                                    {getCommissionCashierName(c)} • {c.createdAt ? new Date(c.createdAt).toLocaleDateString("id-ID") : "-"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-[10px] font-black ${c.status === "refunded" ? "text-rose-500 line-through" : c.status === "withdrawn" ? "text-blue-500" : "text-emerald-500"}`}>
                                    {c.status === "refunded" ? "(Refund)" : c.status === "withdrawn" ? "(Cair)" : `+Rp ${(c.amount || 0).toLocaleString("id-ID")}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                      <div className="relative overflow-hidden bg-blue-600 rounded-2xl md:rounded-[32px] p-5 md:p-6 text-white shadow-lg md:shadow-xl shadow-blue-200">
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full -mr-10 -mt-10 md:-mr-16 md:-mt-16 blur-2xl"></div>
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4 opacity-80" />
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest opacity-80 mb-1">
                          Saldo Bonus Saya
                        </h3>
                        <div className="flex items-baseline gap-1.5 mb-5 md:mb-6">
                          <span className="text-sm md:text-xl font-bold opacity-60">
                            Rp
                          </span>
                          <span className="text-2xl md:text-5xl font-black tracking-tighter">
                            {(profile?.bonusBalance || 0).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        </div>
                        <button 
                          onClick={() => syncCommissionsSummary()}
                          className="mb-6 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors backdrop-blur-sm border border-white/10"
                        >
                          <RefreshCw className="w-3 h-3" /> Sinkronkan Data Bonus
                        </button>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:gap-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-4 border border-white/10">
                          <div className="flex-1 border-b sm:border-b-0 sm:border-r border-white/20 pb-2 sm:pb-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Sudah Dicairkan</p>
                            <p className="text-[11px] md:text-xs font-black tracking-tight">
                              Rp {(getMyCommissions().filter(c => c.status === "withdrawn").reduce((s, c) => s + (c.amount || 0), 0) || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex-1 sm:pl-2">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Bonus Hangus (Refund)</p>
                            <p className="text-[11px] md:text-xs font-black tracking-tight text-rose-200">
                              Rp {(getMyCommissions().filter(c => c.status === "refunded").reduce((s, c) => s + (c.amount || 0), 0) || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-black text-slate-800 text-[10px] md:text-xs uppercase tracking-widest">Riwayat Bonus Penjualan</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {getMyCommissions()
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 50)
                            .map((c, idx) => (
                              <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.status === "refunded" ? "bg-rose-50 text-rose-500" : c.status === "withdrawn" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"}`}>
                                    {c.status === "refunded" ? <RotateCcw className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                      {getProductName(c.product, c.productName)}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                      {new Date(c.createdAt).toLocaleTimeString("id-ID")} • {new Date(c.createdAt).toLocaleDateString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-[12px] font-black ${c.status === "refunded" ? "text-rose-500 line-through" : c.status === "withdrawn" ? "text-blue-500" : "text-emerald-600"}`}>
                                    {c.status === "refunded" ? "-" : "+" }Rp {c.amount.toLocaleString("id-ID")}
                                  </p>
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1">{c.status}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeMenu === "shift" && profile?.role === "CASHIER" && (
              <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 relative">
                <div className="max-w-md w-full bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative shrink-0">
                  <div className="p-4 md:p-8 border-b border-slate-200 bg-slate-900 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <Clock className="w-14 h-14 text-blue-400 mx-auto mb-4 relative z-10" />
                    <h2 className="text-xl md:text-lg md:text-2xl font-black uppercase tracking-tight relative z-10">
                      Manajemen Shift
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 relative z-10">
                      {branches.find((b) => b.id === profile.branchId)?.name ||
                        "Belum Ada Cabang"}
                    </p>
                  </div>
                  <div className="p-4 md:p-6 md:p-8 space-y-6">
                    {shiftOpen ? (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest mb-6 animate-pulse">
                          <CheckCircle2 className="w-4 h-4" /> Shift {shiftType}{" "}
                          Aktif
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                              Personil Aktif (Pilih Nama Anda Jika Operan/Rolling Shift):
                            </p>
                            <select
                              value={cashierName}
                              onChange={(e) => {
                                setCashierName(e.target.value);
                                localStorage.setItem("cashier_name", e.target.value);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                            >
                              <option value="">-- PILIH PERSONIL (ROLLING) --</option>
                              {users
                                .filter((u) => u && u.branchId === profile?.branchId)
                                .map((u) => {
                                  const names = [u.name];
                                  if (u.alternativeNames) {
                                    const alternates = u.alternativeNames
                                      .split(",")
                                      .map((s: string) => s.trim())
                                      .filter((s: string) => s);
                                    names.push(...alternates);
                                  }
                                  return names.map((n, i) => (
                                    <option key={`${u.id}_${i}`} value={n}>
                                      {n}
                                    </option>
                                  ));
                                })}
                            </select>
                            <p className="text-[8px] text-blue-500 font-bold mt-1 uppercase italic">* Nama ini otomatis masuk ke struk & laporan</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                              Mulai Shift:
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-slate-800 uppercase">
                                {shiftStartTime
                                  ? new Date(shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : "-"}
                              </p>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${shiftType === "Pagi" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                                {shiftType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={handleCloseShift}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                          >
                            <LogOut className="w-5 h-5" /> Tutup Shift Sekarang
                          </button>
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-left">
                            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[8px] font-bold text-blue-800 uppercase leading-relaxed">
                              Sistem mencatat transaksi berdasarkan "Personil Aktif" di atas. Ganti nama jika ada operan / rolling shift.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 border border-slate-200 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest">
                            <ShieldCheck className="w-4 h-4" /> Laci Kasir
                            Terkunci
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-left">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                              1. Tipe Shift (Otomatis):
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div
                                className={`flex items-center justify-center gap-2 py-3 md:py-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${shiftType === "Pagi" ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg" : "border-slate-100 bg-slate-50 text-slate-300 opacity-50"}`}
                              >
                                Pagi (07-19)
                              </div>
                              <div
                                className={`flex items-center justify-center gap-2 py-3 md:py-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${shiftType === "Malam" ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg" : "border-slate-100 bg-slate-50 text-slate-300 opacity-50"}`}
                              >
                                Malam (19-07)
                              </div>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 text-center">
                              * Waktu terdeteksi berdasarkan jam sistem saat
                              ini.
                            </p>
                          </div>

                          <div className="text-left">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                              2. Pilih Nama Penjaga Kasir:
                            </label>
                            <select
                              value={cashierName}
                              onChange={(e) => setCashierName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 md:py-4 text-sm font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer shadow-sm"
                            >
                              <option value="">-- PILIH NAMA ANDA --</option>
                              {users
                                .filter(
                                  (u) => u && u.branchId === profile?.branchId,
                                )
                                .map((u) => {
                                  const names = [u.name];
                                  if (u.alternativeNames) {
                                    const alternates = u.alternativeNames
                                      .split(",")
                                      .map((s: string) => s.trim())
                                      .filter((s: string) => s);
                                    names.push(...alternates);
                                  }
                                  return names.map((name, nIdx) => (
                                    <option
                                      key={`${u.id}-${nIdx}`}
                                      value={name}
                                    >
                                      {name}
                                    </option>
                                  ));
                                })}
                            </select>
                            <p className="text-[8px] text-blue-600 font-bold uppercase mt-2 text-center">
                              * Pilih nama Anda dari daftar karyawan di cabang
                              ini.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleOpenShift}
                          disabled={!cashierName.trim() || !shiftType}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 md:py-5 rounded-2xl uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                        >
                          <Plus className="w-5 h-5" /> Buka Shift Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* REAL-TIME CURRENT SHIFT TRANSACTIONS LIST */}
                {shiftOpen && (
                  <div className="flex-1 max-w-2xl w-full bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col min-h-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-5 md:p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                      <div className="text-left">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
                          Riwayat Transaksi Shift Ini
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                          Daftar penjualan terdaftar selama sesi shift aktif berjalan
                        </p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 justify-center self-start sm:self-auto">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Rp {currentShiftTotalSales.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="p-5 md:p-6 overflow-y-auto max-h-[500px] flex-1">
                      {currentShiftSales.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 space-y-3">
                          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Belum Ada Transaksi</p>
                          <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">Lakukan penjualan di menu kasir untuk merekam data di sini</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentShiftSales.map((sale) => (
                            <div key={sale.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                                    {sale.customerName || "Pelanggan Biasa"}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                                    {new Date(sale.createdAt || sale.timestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tight flex flex-wrap gap-1 leading-none">
                                  <span>Kasir: {getSaleCashierName(sale)}</span>
                                  <span>• {sale.items?.length || 0} Item</span>
                                </div>
                                <div className="text-[9px] text-slate-600 font-medium">
                                  {sale.items?.map((it: any) => `${it.product?.name || 'Produk'} (x${it.qty})`).join(", ")}
                                </div>
                              </div>
                              <div className="text-right sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1 border-t sm:border-0 pt-2 sm:pt-0 border-slate-50">
                                <span className="text-[8px] sm:hidden font-black text-slate-400 uppercase tracking-widest">Total:</span>
                                <span className="text-xs font-black text-slate-900 font-mono">
                                  Rp {(sale.total || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SHIFT SUMMARY MODAL overlay inside view */}
                {showShiftSummary !== null && (
                  <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                      <div className="p-5 md:p-6 bg-emerald-600 text-white text-center relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 relative z-10 backdrop-blur-md">
                          <Banknote className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-1 relative z-10">
                          Tutup Shift
                        </h2>
                        <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.2em] relative z-10">
                          Ringkasan Saldo Laci Kasir
                        </p>
                      </div>
                      <div className="p-5 md:p-8 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-1 text-center bg-slate-50 py-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Total Penjualan Shift:
                          </p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                            Rp {showShiftSummary.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                              Kasir:
                            </p>
                            <p className="text-[10px] font-black text-slate-800 uppercase leading-none truncate">
                              {cashierName}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                              Shift:
                            </p>
                            <p className="text-[10px] font-black text-slate-800 uppercase leading-none">
                              {shiftType}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Modal Laci:</p>
                            <p className="text-xs font-black text-slate-900 font-mono leading-none">Rp {drawerCashValue.toLocaleString("id-ID")}</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 leading-none">Target Laci:</p>
                            <p className="text-xs font-black text-blue-900 font-mono leading-none">Rp {(showShiftSummary + drawerCashValue).toLocaleString("id-ID")}</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Input Uang Fisik Di Laci:</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">Rp</span>
                              <input 
                                type="number"
                                value={actualCashInput}
                                onChange={(e) => setActualCashInput(e.target.value)}
                                placeholder="0"
                                className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
                              />
                            </div>
                          </div>

                          {actualCashInput !== "" && (
                            <div className={`p-3 rounded-xl border flex justify-between items-center ${
                              (parseInt(actualCashInput) || 0) - (showShiftSummary + drawerCashValue) === 0 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                : "bg-rose-50 border-rose-100 text-rose-700"
                            }`}>
                              <p className="text-[9px] font-black uppercase tracking-widest leading-none">Selisih:</p>
                              <p className="text-xs font-black font-mono leading-none">
                                Rp {((parseInt(actualCashInput) || 0) - (showShiftSummary + drawerCashValue)).toLocaleString("id-ID")}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 flex gap-2 items-start text-left">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p className="text-[8px] font-bold leading-tight uppercase">
                            PASTIKAN JUMLAH UANG FISIK DI LACI SESUAI SEBELUM MENYERAHKAN KUNCI.
                          </p>
                        </div>

                        <div className="space-y-2 shrink-0">
                          <button
                            disabled={actualCashInput === "" || isClosingShift}
                            onClick={() => finalizeCloseShift(actualCashInput)}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black active:scale-95 flex items-center justify-center gap-3"
                          >
                            {isClosingShift ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Sedang Memproses...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" /> Patenkan & Tutup Shift
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowShiftSummary(null);
                              setActualCashInput("");
                            }}
                            className="w-full bg-slate-100 text-slate-400 font-black py-2.5 rounded-2xl text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all font-mono"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- 7. ADMIN: DASHBOARD (Overview Live Sales) --- */}
            {activeMenu === "dashboard" && profile?.role === "ADMIN" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                {/* HEADER DASHBOARD COMPACT */}
                <div className="bg-white px-4 md:px-8 py-4 md:py-6 border-b border-slate-200 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-1 bg-blue-600 rounded-full"></span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
                          Executive Overview
                        </span>
                      </div>
                      <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                        Dashboard Pusat
                      </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {/* Period Filter */}
                      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        {[
                          { id: "today", label: "Harian" },
                          { id: "week", label: "Mingguan" },
                          { id: "month", label: "Bulanan" },
                          { id: "all", label: "Semua" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setDashboardDateRange(p.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                              dashboardDateRange === p.id
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Branch Filter in Dashboard */}
                      <select
                        value={adminSalesBranchFilter}
                        onChange={(e) => setAdminSalesBranchFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 outline-none"
                      >
                        <option value="">Semua Cabang</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      
                      {dashboardDateRange !== "today" && (
                        <button
                          onClick={handleSyncOldSales}
                          disabled={isSyncingOldSales}
                          className="bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncingOldSales ? 'animate-spin' : ''}`} />
                          {isSyncingOldSales ? 'Menyinkronkan...' : 'Sinkron Data Lama'}
                        </button>
                      )}

                      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                      {[
                        { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
                        { id: "sales", label: "Penjualan", icon: Activity },
                        { id: "inventory", label: "Stok & Audit", icon: Boxes },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setDashboardTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            dashboardTab === tab.id
                              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full content-fade">
                  {dashboardTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                       {[
                        {
                          label: "Total Omset",
                          val: dashboardStats.revenue,
                          icon: TrendingUp,
                          color: "blue",
                        },
                        {
                          label: "Laba Bersih",
                          val: dashboardStats.profit,
                          icon: Sparkles,
                          color: "emerald",
                        },
                        {
                          label: "Total Transaksi",
                          val: dashboardStats.count,
                          icon: ShoppingBag,
                          color: "indigo",
                        },
                        {
                          label: "Margin Laba",
                          val: dashboardStats.revenue > 0 ? ((dashboardStats.profit / dashboardStats.revenue) * 100).toFixed(1) + "%" : "0%",
                          icon: Percent,
                          color: "amber",
                        },
                      ].map((card) => (
                        <div
                          key={card.label}
                          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden"
                        >
                           <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -mr-6 -mt-6 opacity-40 ${
                             card.color === "blue" ? "bg-blue-50" : 
                             card.color === "emerald" ? "bg-emerald-50" : 
                             card.color === "indigo" ? "bg-indigo-50" : 
                             "bg-amber-50"
                           }`} />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono relative z-10">
                            {card.label}
                          </p>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">
                            {typeof card.val === "number" && !card.label.includes("Transaksi")
                              ? `Rp ${card.val.toLocaleString("id-ID")}`
                              : card.val}
                          </h3>
                        </div>
                      ))}
                    </div>
                  )}

                  {dashboardTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* PERFORMANCE CHART SIMULATION */}
                      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                         <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Activity className="w-4 h-4 text-blue-500" /> Performa Cabang Periode Ini
                          </h4>
                          <div className="space-y-4">
                            {branches.map((b) => {
                              const branchRevenue = dashboardStats.branchBreakdown[b.id] || 0;
                               const maxRevenue = Math.max(...Object.values(dashboardStats.branchBreakdown) as number[], 1);
                               
                               return (
                                 <div key={b.id} className="space-y-1">
                                   <div className="flex justify-between text-[10px] font-bold uppercase text-slate-600">
                                     <span>{b.name}</span>
                                     <span>Rp {branchRevenue.toLocaleString("id-ID")}</span>
                                   </div>
                                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                     <div 
                                       className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                       style={{ width: `${(branchRevenue / maxRevenue) * 100}%` }}
                                     />
                                   </div>
                                 </div>
                               )
                            })}
                          </div>
                      </div>

                      {/* TOP PRODUCTS */}
                      <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                         <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-6 text-blue-400 relative z-10">
                            <TrendingUp className="w-4 h-4" /> Produk Terlaris
                          </h4>
                          <div className="space-y-4 relative z-10">
                            {(() => {
                              const productSales: Record<string, { name: string, qty: number }> = {};
                              sales.filter(s => s.status !== "refunded").forEach(s => {
                                s.items?.forEach((it: any) => {
                                  const pId = it.productId || it.product?.id || it.id;
                                  if (!pId) return;
                                  const pName = it.product?.name || it.name || "Produk";
                                  if (!productSales[pId]) {
                                    productSales[pId] = { name: pName, qty: 0 };
                                  }
                                  productSales[pId].qty += (it.qty || 0);
                                });
                              });
                              return Object.values(productSales)
                                .sort((a, b) => b.qty - a.qty)
                                .slice(0, 5)
                                .map((p, i) => (
                                  <div key={i} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                                    <span className="text-[10px] font-medium uppercase flex-1 pr-4 break-words py-0.5">{p.name}</span>
                                    <span className="text-[10px] font-black text-blue-400">{p.qty}x</span>
                                  </div>
                                ));
                            })()}
                          </div>
                      </div>
                    </div>
                  )}

                  {dashboardTab === "sales" && (
                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
                      {/* LIVE TRANSACTIONS COMPACT */}
                      <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 animate-pulse" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                               10 Transaksi Terakhir (Live)
                            </h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                              Hanya Memuat Data Terbaru Untuk Efisiensi
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center">
                          <select
                            value={adminSalesDateFilter}
                            onChange={(e) => setAdminSalesDateFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="today">Hari Ini</option>
                            <option value="3days">3 Hari</option>
                            <option value="all">Semua</option>
                          </select>
                          <select
                            value={adminSalesBranchFilter}
                            onChange={(e) => setAdminSalesBranchFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Semua Cabang</option>
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto max-h-[300px]">
                        <table className="w-full border-collapse">
                          <tbody className="divide-y divide-slate-100">
                            {sales
                              .slice(0, 10) // Force UI limit for dashboard consistency
                              .map((s) => {
                                const capital = (s.items || []).reduce((sum: number, it: any) => {
                                  let pPrice = it.purchasePrice;
                                  if (pPrice === undefined || pPrice === null) {
                                    const m = products.find(p => p.id === (it.productId || it.id)) as any;
                                    pPrice = m?.buyingPrice || 0;
                                  }
                                  return sum + (Number(pPrice || 0) * Number(it.qty || 0));
                                }, 0);
                                const profit = (s.total || 0) - capital;
                                
                                return (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors text-[10px]">
                                  <td className="px-4 py-3 font-mono font-bold text-slate-500">
                                    {new Date(s.createdAt || s.timestamp || 0).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                  </td>
                                  <td className="px-4 py-3 font-black text-slate-800 uppercase tracking-tighter">
                                    {branches.find((b) => b.id === s.branchId)?.name || "Pusat"}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-blue-600 uppercase tracking-tight truncate max-w-[80px]">
                                    {getSaleCashierName(s)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="truncate max-w-[150px]">
                                      {s.items?.map((i: any) => `${i.product?.name || i.name || "Produk"} (x${i.qty})`).join(", ")}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-black text-slate-900">
                                    {(s.total || 0).toLocaleString("id-ID")}
                                  </td>
                                  <td className="px-4 py-3 text-right font-black text-emerald-600">
                                    {profit.toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              );})
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {dashboardTab === "inventory" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* MODAL PER CABANG COMPACT */}
                      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden flex flex-col h-fit">
                        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white text-left">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-blue-500" />
                            Modal per Cabang
                          </h4>
                        </div>
                        <div className="overflow-auto">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cabang</th>
                                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Modal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-[11px]">
                              {branchModalData.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-3">
                                    <p className="font-extrabold text-slate-800">{b.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{b.totalItems} Pcs Stok</p>
                                  </td>
                                  <td className="px-6 py-3 text-right font-black text-blue-600">
                                    Rp {b.totalModal.toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-slate-100/50">
                                <td className="px-6 py-4 font-black text-[9px] uppercase tracking-widest">Total Konsolidasi HPP</td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                  Rp {branchModalData.reduce((s, x) => s + x.totalModal, 0).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* MINIMAL AUDIT TRAIL */}
                      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden flex flex-col h-[500px]">
                        <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex items-center gap-4 text-left">
                          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin-slow" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">
                              Jejak Audit Stok
                            </h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                              Riwayat Mutasi Barang
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                          <table className="w-full border-collapse">
                            <tbody className="divide-y divide-slate-100">
                              {adjustments
                                .slice()
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 30)
                                .map((log) => (
                                  <tr key={log.id} className="hover:bg-slate-50 transition-colors text-[10px]">
                                    <td className="px-4 py-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                                      {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="font-extrabold text-slate-800 uppercase tracking-tighter truncate max-w-[120px]">
                                        {products.find((p) => p.id === log.productId)?.name || "N/A"}
                                      </p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                        {branches.find((b) => b.id === log.branchId)?.name || "N/A"}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-0.5 rounded font-black uppercase tracking-widest text-[8px] ${
                                        log.type?.includes("IN") ? "bg-emerald-50 text-emerald-600" : log.type?.includes("OUT") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                      }`}>
                                        {log.type} {log.qty > 0 ? `+${log.qty}` : log.qty}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav 
          className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-[50] overflow-x-auto hide-scrollbar"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center h-[68px] px-2 min-w-max">
            {getMobileNav().map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setShowMobileCart(false);
                }}
                className={`shrink-0 w-20 sm:flex-1 shrink-0 flex flex-col items-center justify-center h-full gap-1 transition-colors relative ${
                  activeMenu === item.id
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                } ${item.locked ? "opacity-60" : ""}`}
              >
                <div className="relative">
                  <item.icon
                    className={`w-5 h-5 ${activeMenu === item.id ? "fill-current" : ""}`}
                  />
                  {item.locked && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border border-white">
                      <Lock className="w-2 h-2" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* --- GLOBAL MODALS --- */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScan={(res) => scannerCallback(res)}
        />
      )}


      {quickAuditProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 md:p-8">
              <div className="flex justify-between items-start mb-6 text-left">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                      Scan Berhasil
                    </span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter text-left">
                    {quickAuditProduct.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1 text-left">
                    {quickAuditProduct.barcode}
                  </p>
                </div>
                <button
                  onClick={() => setQuickAuditProduct(null)}
                  className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-red-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-3 md:p-5 rounded-[30px] border border-slate-100 text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">
                    Stok{" "}
                    {branches.find((b) => b.id === auditSelectedBranch)?.name ||
                      "Cabang"}
                  </p>
                  <p className="text-xl md:text-3xl font-black text-slate-900 leading-none text-left">
                    {stocks.find(
                      (s) =>
                        s.branchId === auditSelectedBranch &&
                        s.productId === quickAuditProduct.id,
                    )?.qty || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 md:p-5 rounded-[30px] border border-blue-100 text-left">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 text-left">
                    Kategori
                  </p>
                  <p className="text-sm font-black text-blue-700 leading-none truncate text-left">
                    {quickAuditProduct.category}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-slate-50 p-4 md:p-6 rounded-[35px] border border-slate-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 text-left">
                        Tambah Kuantitas:
                      </label>
                      <input
                        id="quick-audit-qty"
                        type="number"
                        placeholder="0"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 md:px-6 py-3 md:py-5 text-lg md:text-2xl font-black text-center focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all shadow-inner"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 text-left">
                        Keterangan / Supplier (Opsional):
                      </label>
                      <input
                        id="quick-audit-note"
                        type="text"
                        placeholder="Keterangan Audit"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const qty = parseInt(
                      (
                        document.getElementById(
                          "quick-audit-qty",
                        ) as HTMLInputElement
                      ).value,
                    );
                    const note = (
                      document.getElementById(
                        "quick-audit-note",
                      ) as HTMLInputElement
                    ).value;
                    if (isNaN(qty) || qty <= 0)
                      return alert("Masukkan jumlah valid!");

                    await handleStockAddition(
                      quickAuditProduct.id,
                      qty,
                      note || "Scan Pemasokan",
                      auditSelectedBranch,
                    );
                    setQuickAuditProduct(null);
                  }}
                  className="w-full bg-slate-900 text-white py-3 md:py-6 rounded-[35px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <PackagePlus className="w-5 h-5" /> Patenkan Stok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    {/* USER FORM MODAL */}
    {showUserForm && (
      <div className="absolute inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
            <h3 className="font-black text-slate-800 uppercase tracking-tight">
              Tambah Akun Login Baru
            </h3>
            <button onClick={() => setShowUserForm(false)} className="text-slate-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username (Login)</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUserDraft.username}
                onChange={(e) => setNewUserDraft({...newUserDraft, username: e.target.value})}
                placeholder="Contoh: kasir_pusat"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <input 
                type="password" 
                className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUserDraft.password}
                onChange={(e) => setNewUserDraft({...newUserDraft, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Lengkap Petugas</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUserDraft.name}
                onChange={(e) => setNewUserDraft({...newUserDraft, name: e.target.value})}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role / Hak Akses</label>
              <select 
                className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase tracking-widest text-[10px]"
                value={newUserDraft.role}
                onChange={(e) => setNewUserDraft({...newUserDraft, role: e.target.value})}
              >
                <option value="CASHIER">KASIR TOKO</option>
                <option value="ADMIN">ADMIN PUSAT</option>
                <option value="AUDIT">TIM AUDIT</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Penempatan Cabang</label>
              <select 
                className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase tracking-widest text-[10px]"
                value={newUserDraft.branchId}
                onChange={(e) => setNewUserDraft({...newUserDraft, branchId: e.target.value})}
              >
                <option value="">-- PILIH CABANG --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleCreateUser}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded uppercase tracking-widest text-[11px] shadow-lg transition-all mt-4"
            >
              Simpan Akun Baru
            </button>
          </div>
        </div>
      </div>
    )}

    {/* --- BRAND SUCCESS POPUP (PROFESSIONAL BILLING MODAL OVERLAY) --- */}
    {checkoutSuccessData && (
      <CheckoutSuccessModal
        data={checkoutSuccessData}
        onClose={() => setCheckoutSuccessData(null)}
        branches={branches}
      />
    )}

    {/* --- BRAND ALERT TOAST MULTIPLE POPUPS (NO WEB ADDRESS NO DOMAIN SHOWN) --- */}
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {globalAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/50 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300 relative border-l-4 ${alert.type === 'success' ? 'border-l-emerald-500' : 'border-l-amber-500'}`}
        >
          <div className={`w-5 h-5 rounded-full ${alert.type === 'success' ? 'bg-emerald-500/15' : 'bg-amber-500/15'} flex items-center justify-center shrink-0 mt-0.5`}>
            {alert.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black uppercase ${alert.type === 'success' ? 'text-emerald-500' : 'text-amber-500'} tracking-widest`}>{alert.type === 'success' ? 'Berhasil' : 'Informasi Sistem'}</p>
            <p className="text-[11px] font-bold text-slate-100 mt-0.5 leading-relaxed break-words">{alert.message}</p>
          </div>
          <button
            onClick={() => setGlobalAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>

    {/* --- BRAND CONFIRMATION POPUP (NO WEB ADDRESS NO DOMAIN SHOWN) --- */}
    {confirmModal && (
      <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Konfirmasi Tindakan</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">{confirmModal.message}</p>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2">
            <button
              onClick={() => {
                confirmModal.resolve(false);
                setConfirmModal(null);
              }}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all text-center cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => {
                confirmModal.resolve(true);
                setConfirmModal(null);
              }}
              className="flex-1 bg-slate-900 text-white hover:bg-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all text-center cursor-pointer"
            >
              Ya, Setuju
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Custom Premium Checkout Success Modal (Resolves URL Popup and introduces beautiful automatic Cash/Change Calculator)
interface CheckoutSuccessModalProps {
  data: {
    total: number;
    itemsCount: number;
    timestamp: string;
    branchId?: string;
  };
  onClose: () => void;
  branches: any[];
}

const CheckoutSuccessModal = ({ data, onClose, branches }: CheckoutSuccessModalProps) => {
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState<string>("");

  const total = data.total;

  const currentChange = useMemo(() => {
    if (cashReceived === null) return null;
    return cashReceived - total;
  }, [cashReceived, total]);

  // Quick cash shortcuts
  const quickCashOptions = useMemo(() => {
    const options = [total]; // Option 1: Exact amount
    const standardBills = [5000, 10000, 20000, 50000, 100000];
    
    // Add other standard bills that are greater than total
    standardBills.forEach((bill) => {
      if (bill > total && !options.includes(bill)) {
        options.push(bill);
      }
    });

    // Also include combination if total is close
    const doubleBill = Math.ceil(total / 50000) * 50000;
    if (doubleBill > total && !options.includes(doubleBill)) {
      options.push(doubleBill);
    }

    const doubleFifty = Math.ceil(total / 100000) * 100000;
    if (doubleFifty > total && !options.includes(doubleFifty)) {
      options.push(doubleFifty);
    }
    
    return options.sort((a, b) => a - b).slice(0, 5); // Max 5 choices
  }, [total]);

  const handleCustomInputChange = (val: string) => {
    const numericStr = val.replace(/\D/g, "");
    setCustomInput(numericStr ? parseInt(numericStr).toLocaleString("id-ID") : "");
    const cleaned = parseInt(numericStr);
    if (!isNaN(cleaned)) {
      setCashReceived(cleaned);
    } else {
      setCashReceived(null);
    }
  };

  const selectShortcut = (amt: number) => {
    setCashReceived(amt);
    setCustomInput(amt.toLocaleString("id-ID"));
  };

  const branchName = useMemo(() => {
    return branches.find(b => b.id === data.branchId)?.name || "Pusat";
  }, [branches, data.branchId]);

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Animated Green Check Header */}
        <div className="p-6 text-center bg-emerald-50/60 border-b border-slate-100 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/40 rounded-full blur-xl -translate-y-4 translate-x-4"></div>
          
          <div className="relative w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-200/50 animate-bounce">
            <Check className="w-7 h-7 text-white stroke-[3.5]" />
          </div>
          
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5 shadow-sm">
            Pembayaran Berhasil
          </span>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter antialiased">
            Transaksi Disimpan
          </h3>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
            Mencetak Nota & Update Cloud Selesai
          </p>
        </div>

        {/* Details & Live Change Calculator */}
        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Waktu Transaksi
              </p>
              <p className="text-[11px] font-black text-slate-700 mt-1 uppercase tracking-tight">
                Hari ini, {data.timestamp}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Lokasi / Cabang
              </p>
              <p className="text-[11px] font-black text-slate-700 mt-1 uppercase tracking-tight truncate">
                {branchName}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              TOTAL TRANSAKSI
            </p>
            <p className="text-3xl md:text-3xl font-black text-blue-900 tracking-tighter">
              Rp {total.toLocaleString("id-ID")}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {data.itemsCount} Pcs Produk Terjual
            </p>
          </div>

          {/* Payment Calculator Section */}
          <div className="bg-slate-50/70 p-4 rounded-[28px] border border-slate-200 space-y-3">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] text-center">
              KALKULATOR KEMBALIAN PELANGGAN
            </h4>

            {/* Input Uang Diterima */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="text"
                placeholder="Masukkan jumlah uang tunai..."
                value={customInput}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-black tracking-tight text-slate-800 outline-none transition-all shadow-inner placeholder:text-slate-300 placeholder:font-bold"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickCashOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectShortcut(opt)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all active:scale-95 border ${
                    cashReceived === opt
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {opt === total ? "Uang Pas" : `Rp ${opt.toLocaleString("id-ID")}`}
                </button>
              ))}
            </div>

            {/* Live Change (Uang Kembali) Screen */}
            {cashReceived !== null && (
              <div className="pt-2 border-t border-slate-200/50">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Kembalian:
                  </span>
                  <span className={`text-sm font-black tracking-tight ${currentChange && currentChange < 0 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                    {currentChange !== null && currentChange < 0
                      ? `Kurang Rp ${Math.abs(currentChange).toLocaleString("id-ID")}`
                      : `Rp ${(currentChange || 0).toLocaleString("id-ID")}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3.5 rounded-[28px] font-black text-[9px] uppercase tracking-[0.25em] shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            Selesai & Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};

// Helpers
const MenuCategory = ({ title }: { title: string }) => (
  <div className="px-4 md:px-6 mt-5 mb-2">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-50">
      {title}
    </p>
  </div>
);

const HubButton = ({ icon: Icon, label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 border border-slate-400 bg-white hover:bg-slate-100 transition-all font-bold text-slate-800 text-xs sm:text-sm min-w-[140px] flex-1 sm:flex-none h-12 uppercase tracking-tighter ${
      active ? "bg-slate-200 ring-1 ring-inset ring-slate-900" : ""
    }`}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span className="truncate leading-none">{label}</span>
  </button>
);

const MenuItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  locked,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  locked?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 md:px-6 py-3 text-xs font-black transition-all border-l-4 ${active ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-inner" : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"} ${locked ? "opacity-70" : ""}`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : ""}`} />
      <span className="uppercase tracking-widest truncate">{label}</span>
    </div>
    {locked && <Lock className="w-3 h-3 text-amber-500" />}
  </button>
);
