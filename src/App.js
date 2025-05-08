import { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Moon, Sun, Search, ArrowLeft } from "lucide-react";
import AnalogClock from "./Anolog";

const slides = ["Reminder", "Sales Order", "Purchase Order", "Outstanding", "Payment"];

const getLocalStorageData = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage data for key ${key}:`, error);
    return defaultValue;
  }
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AnimatedSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlide, setAutoSlide] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode !== null
      ? savedDarkMode === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [outstandingType, setOutstandingType] = useState("daily");
  const [paymentType, setPaymentType] = useState("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [salesTrackingKey, setSalesTrackingKey] = useState(0);
  const [purchaseTrackingKey, setPurchaseTrackingKey] = useState(0);
  const [salesFormErrors, setSalesFormErrors] = useState({
    name: false,
    slipNo: false,
    slipNoUnique: false,
  });
  const [purchaseFormErrors, setPurchaseFormErrors] = useState({
    item: false,
    category: false,
  });

  const [outstandingDaily, setOutstandingDaily] = useState(() =>
    getLocalStorageData("outstandingDaily", [])
  );
  const [outstandingWeekly, setOutstandingWeekly] = useState(() =>
    getLocalStorageData("outstandingWeekly", [])
  );
  const [paymentDaily, setPaymentDaily] = useState(() =>
    getLocalStorageData("paymentDaily", [])
  );
  const [paymentWeekly, setPaymentWeekly] = useState(() =>
    getLocalStorageData("paymentWeekly", [])
  );
  const [salesOrders, setSalesOrders] = useState(() =>
    getLocalStorageData("salesOrders", [])
  );
  const [purchaseOrders, setPurchaseOrders] = useState(() =>
    getLocalStorageData("purchaseOrders", [])
  );
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [tempSalesOrder, setTempSalesOrder] = useState(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [tempPurchaseOrder, setTempPurchaseOrder] = useState(null);

  const generateRandomSlipNumber = () => {
    return `SL-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const generateRandomPurchaseOrderNumber = () => {
    return `PO-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#111827";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f3f4f6";
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const savedSlide = localStorage.getItem("currentSlide");
    if (savedSlide) setCurrentSlide(parseInt(savedSlide));
  }, []);

  useEffect(() => {
    localStorage.setItem("currentSlide", currentSlide.toString());
  }, [currentSlide]);

  useEffect(() => {
    const saveData = () => {
      localStorage.setItem("salesOrders", JSON.stringify(salesOrders));
      localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders));
      localStorage.setItem("outstandingDaily", JSON.stringify(outstandingDaily));
      localStorage.setItem("outstandingWeekly", JSON.stringify(outstandingWeekly));
      localStorage.setItem("paymentDaily", JSON.stringify(paymentDaily));
      localStorage.setItem("paymentWeekly", JSON.stringify(paymentWeekly));
    };

    const timer = setTimeout(saveData, 500);
    return () => clearTimeout(timer);
  }, [salesOrders, purchaseOrders, outstandingDaily, outstandingWeekly, paymentDaily, paymentWeekly]);

  useEffect(() => {
    let interval;
    if (autoSlide) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sales Order Functions
  const addNewSalesOrder = () => {
    const newOrder = {
      name: "",
      slipNo: generateRandomSlipNumber(),
      source: "whatsapp",
      status: "order",
      bagged: "no",
      delivery: "takeaway",
      bagNumber: "",
      bagAmount: "",
      date: new Date().toISOString(),
    };
    setTempSalesOrder(newOrder);
    setSelectedSalesOrder(-1);
    setSalesFormErrors({
      name: false,
      slipNo: false,
      slipNoUnique: false,
    });
  };

  const deleteSalesOrder = (index) => {
    const updatedOrders = salesOrders.filter((_, i) => i !== index);
    setSalesOrders(updatedOrders);
    setSelectedSalesOrder(null);
    setTempSalesOrder(null);
  };

  const updateTempSalesOrder = (field, value) => {
    setTempSalesOrder((prev) => {
      if (!prev) return prev;

      let updatedOrder = {
        ...prev,
        [field]: field === "slipNo" ? value : capitalize(value),
      };

      if (field === "status") {
        const status = value.toLowerCase();

        if (status === "bagged") {
          updatedOrder.bagged = "yes";
        } else if (status === "order" || status === "packing") {
          updatedOrder.bagged = "no";
          updatedOrder.bagNumber = "";
          updatedOrder.bagAmount = "";
        } else {
          updatedOrder.bagged = prev.bagged;
        }

        if (status === "done" && !prev.completedDate) {
          updatedOrder.completedDate = new Date().toISOString();
        }

        if (prev.status?.toLowerCase() === "done" && status !== "done") {
          delete updatedOrder.completedDate;
        }
      }

      return updatedOrder;
    });

    if (field === "slipNo") {
      setSalesFormErrors((prev) => ({
        ...prev,
        slipNoUnique: false,
      }));
    }

    setSalesTrackingKey((prev) => prev + 1);
  };

  const validateSalesForm = () => {
    if (!tempSalesOrder) return false;

    const isSlipNoEmpty = !tempSalesOrder.slipNo.trim();

    const isSlipNoUnique =
      selectedSalesOrder === -1
        ? !salesOrders.some(
            (order) =>
              order.slipNo.toLowerCase() === tempSalesOrder.slipNo.toLowerCase()
          )
        : !salesOrders.some(
            (order, index) =>
              index !== selectedSalesOrder &&
              order.slipNo.toLowerCase() === tempSalesOrder.slipNo.toLowerCase()
          );

    const errors = {
      name: !tempSalesOrder.name.trim(),
      slipNo: isSlipNoEmpty,
      slipNoUnique: !isSlipNoUnique && !isSlipNoEmpty,
    };

    setSalesFormErrors(errors);
    return !errors.name && !errors.slipNo && !errors.slipNoUnique;
  };

  const saveSalesOrder = () => {
    if (!validateSalesForm() || !tempSalesOrder) return;

    setSalesOrders((prev) => {
      if (selectedSalesOrder !== -1 && selectedSalesOrder !== null) {
        const updatedOrders = [...prev];
        updatedOrders[selectedSalesOrder] = { ...tempSalesOrder };
        return updatedOrders;
      } else {
        if (
          prev.some(
            (order) =>
              order.slipNo.toLowerCase() === tempSalesOrder.slipNo.toLowerCase()
          )
        ) {
          setSalesFormErrors((prev) => ({
            ...prev,
            slipNoUnique: true,
          }));
          return prev;
        }
        return [...prev, { ...tempSalesOrder }];
      }
    });

    setSelectedSalesOrder(null);
    setTempSalesOrder(null);
    setSalesFormErrors({
      name: false,
      slipNo: false,
      slipNoUnique: false,
    });
  };

  const cancelSalesEdit = () => {
    setSelectedSalesOrder(null);
    setTempSalesOrder(null);
    setSalesFormErrors({
      name: false,
      slipNo: false,
      slipNoUnique: false,
    });
  };

  const getSalesStatusIndex = (status) => {
    const statusMap = {
      order: 0,
      packing: 1,
      bagged: 2,
      delivery: 3,
      done: 4,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  // Purchase Order Functions
  const addNewPurchaseOrder = () => {
    const newOrder = {
      item: "",
      category: "",
      orderNo: generateRandomPurchaseOrderNumber(),
      status: "order",
      date: new Date().toISOString(),
    };
    setTempPurchaseOrder(newOrder);
    setSelectedPurchaseOrder(-1);
    setPurchaseFormErrors({
      item: false,
      category: false,
    });
  };

  const deletePurchaseOrder = (index) => {
    const updatedOrders = purchaseOrders.filter((_, i) => i !== index);
    setPurchaseOrders(updatedOrders);
    setSelectedPurchaseOrder(null);
    setTempPurchaseOrder(null);
  };

  const updateTempPurchaseOrder = (field, value) => {
    setTempPurchaseOrder((prev) => {
      if (!prev) return prev;

      let updatedOrder = {
        ...prev,
        [field]: field === "orderNo" ? value : capitalize(value),
      };

      if (field === "status") {
        const status = value.toLowerCase();
        if (status === "received" && !prev.completedDate) {
          updatedOrder.completedDate = new Date().toISOString();
        }
        if (prev.status?.toLowerCase() === "received" && status !== "received") {
          delete updatedOrder.completedDate;
        }
      }

      return updatedOrder;
    });

    setPurchaseTrackingKey((prev) => prev + 1);
  };

  const validatePurchaseForm = () => {
    if (!tempPurchaseOrder) return false;

    const errors = {
      item: !tempPurchaseOrder.item.trim(),
      category: !tempPurchaseOrder.category.trim(),
    };

    setPurchaseFormErrors(errors);
    return !errors.item && !errors.category;
  };

  const savePurchaseOrder = () => {
    if (!validatePurchaseForm() || !tempPurchaseOrder) return;

    setPurchaseOrders((prev) => {
      if (selectedPurchaseOrder !== -1 && selectedPurchaseOrder !== null) {
        const updatedOrders = [...prev];
        updatedOrders[selectedPurchaseOrder] = { ...tempPurchaseOrder };
        return updatedOrders;
      } else {
        return [...prev, { ...tempPurchaseOrder }];
      }
    });

    setSelectedPurchaseOrder(null);
    setTempPurchaseOrder(null);
    setPurchaseFormErrors({
      item: false,
      category: false,
    });
  };

  const cancelPurchaseEdit = () => {
    setSelectedPurchaseOrder(null);
    setTempPurchaseOrder(null);
    setPurchaseFormErrors({
      item: false,
      category: false,
    });
  };

  const getPurchaseStatusIndex = (status) => {
    const statusMap = {
      order: 0,
      received: 1,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  // Sales Order Components
  const SalesTrackingSteps = ({ status }) => {
    const steps = ["Order", "Packing", "Bagged", "Delivery", "Delivered"];
    const currentIndex = getSalesStatusIndex(status);
    const stepWidth = 100 / (steps.length - 1);

    return (
      <div className="relative w-full h-24 my-4">
        <div className="absolute top-12 h-2 left-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <motion.div
          className="absolute top-12 h-2 left-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${currentIndex * stepWidth}%`,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          key={salesTrackingKey}
        ></motion.div>
        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: `${stepWidth}%` }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full z-10 flex items-center justify-center shadow-lg ${
                  i <= currentIndex
                    ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                }`}
                style={{ position: "absolute", top: "calc(3rem - 1rem)" }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.1,
                  },
                }}
                whileHover={{ scale: 1.2 }}
              >
                <span className="text-xs font-bold">{i + 1}</span>
              </motion.div>
              <p
                className={`text-[10px] mt-16 text-center font-semibold truncate max-w-[80px] ${
                  i <= currentIndex
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sortSalesOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (a.completedDate && b.completedDate) {
        return new Date(b.completedDate) - new Date(a.completedDate);
      }
      if (!a.completedDate && b.completedDate) return -1;
      if (a.completedDate && !b.completedDate) return 1;
      return new Date(b.date) - new Date(a.date);
    });
  };

  const filteredSalesOrders = sortSalesOrders(
    salesOrders.filter(
      (order) =>
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.slipNo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const orderPlacedSalesOrders = filteredSalesOrders.filter(
    (order) => order.status.toLowerCase() === "order"
  );
  const packagingSalesOrders = filteredSalesOrders.filter(
    (order) => order.status.toLowerCase() === "packing"
  );
  const baggedSalesOrders = filteredSalesOrders.filter(
    (order) =>
      order.status.toLowerCase() === "bagged" ||
      order.status.toLowerCase() === "delivery"
  );
  const deliveryDoneSalesOrders = filteredSalesOrders.filter(
    (order) => order.status.toLowerCase() === "done"
  );

  const SalesOrderMetaInfo = ({ order }) => {
    const metaItems = [
      {
        label: "Slip No",
        value: order.slipNo,
        icon: "📝",
        color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
      },
      {
        label: "Mode",
        value: capitalize(order.source),
        icon: order.source === "whatsapp" ? "💬" : "✍️",
        color: "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200",
      },
      {
        label: "Delivery",
        value: capitalize(order.delivery),
        icon: order.delivery === "home" ? "🏠" : "🛍️",
        color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      },
      {
        label: "Created",
        value: formatDate(order.date),
        icon: "⏱️",
        color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      },
      ...(order.completedDate
        ? [
            {
              label: "Completed",
              value: formatDate(order.completedDate),
              icon: "✅",
              color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
            },
          ]
        : []),
    ];

    return (
      <motion.div
        className="flex flex-wrap gap-3 mt-2 mb-1 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {metaItems.map((item, i) => (
          <motion.div
            key={i}
            className={`flex items-center ${item.color} px-3 py-1.5 rounded-full text-sm shadow-md transition-transform duration-200 hover:scale-105`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
          >
            <span className="mr-2 text-lg">{item.icon}</span>
            <span className="font-semibold">
              {item.label}: <span className="font-bold">{item.value}</span>
            </span>
          </motion.div>
        ))}
        {order.bagged === "yes" && order.bagNumber && order.bagAmount && (
          <motion.div
            className="flex items-center bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full text-sm shadow-md transition-transform duration-200 hover:scale-105"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <span className="mr-2 text-lg">👜</span>
            <span className="font-semibold">
              Bag: <span className="font-bold">{order.bagNumber}</span> (
              {order.bagAmount})
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const SalesOrderCard = ({ order, index }) => (
    <motion.div
      key={order.slipNo}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.03, boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      className="border rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 w-full border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-lg font-bold cursor-pointer bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent hover:underline"
            onClick={() => {
              setTempSalesOrder({ ...order });
              setSelectedSalesOrder(salesOrders.indexOf(order));
              setSalesFormErrors({ name: false, slipNo: false, slipNoUnique: false });
            }}
          >
            {order.name || "Unnamed Order"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setTempSalesOrder({ ...order });
              setSelectedSalesOrder(salesOrders.indexOf(order));
              setSalesFormErrors({ name: false, slipNo: false, slipNoUnique: false });
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-blue
            
            rounded-lg text-sm px-4 py-2 transition-all duration-200 hover:scale-105"
          >
            Track
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteSalesOrder(salesOrders.indexOf(order))}
            className="border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm px-4 py-2 transition-all duration-200 hover:scale-105"
          >
            Delete
          </Button>
        </div>
      </div>
      <SalesOrderMetaInfo order={order} />
      <SalesTrackingSteps status={order.status} />
    </motion.div>
  );

  // Purchase Order Components
  const PurchaseTrackingSteps = ({ status }) => {
    const steps = ["Order", "Received"];
    const currentIndex = getPurchaseStatusIndex(status);
    const stepWidth = 100 / (steps.length - 1);

    return (
      <div className="relative w-full h-24 my-4">
        <div className="absolute top-12 h-2 left-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <motion.div
          className="absolute top-12 h-2 left-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${currentIndex * stepWidth}%`,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          key={purchaseTrackingKey}
        ></motion.div>
        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: `${stepWidth}%` }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full z-10 flex items-center justify-center shadow-lg ${
                  i <= currentIndex
                    ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                }`}
                style={{ position: "absolute", top: "calc(3rem - 1rem)" }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.1,
                  },
                }}
                whileHover={{ scale: 1.2 }}
              >
                <span className="text-xs font-bold">{i + 1}</span>
              </motion.div>
              <p
                className={`text-[10px] mt-16 text-center font-semibold truncate max-w-[80px] ${
                  i <= currentIndex
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sortPurchaseOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (a.completedDate && b.completedDate) {
        return new Date(b.completedDate) - new Date(a.completedDate);
      }
      if (!a.completedDate && b.completedDate) return -1;
      if (a.completedDate && !b.completedDate) return 1;
      return new Date(b.date) - new Date(a.date);
    });
  };

  const filteredPurchaseOrders = sortPurchaseOrders(
    purchaseOrders.filter(
      (order) =>
        order.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const orderPlacedPurchaseOrders = filteredPurchaseOrders.filter(
    (order) => order.status.toLowerCase() === "order"
  );
  const receivedPurchaseOrders = filteredPurchaseOrders.filter(
    (order) => order.status.toLowerCase() === "received"
  );

  const PurchaseOrderMetaInfo = ({ order }) => {
    const metaItems = [
      {
        label: "Order No",
        value: order.orderNo,
        icon: "📝",
        color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
      },
      {
        label: "Category",
        value: capitalize(order.category),
        icon: "🏷️",
        color: "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200",
      },
      {
        label: "Created",
        value: formatDate(order.date),
        icon: "⏱️",
        color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      },
      ...(order.completedDate
        ? [
            {
              label: "Received",
              value: formatDate(order.completedDate),
              icon: "✅",
              color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
            },
          ]
        : []),
    ];

    return (
      <motion.div
        className="flex flex-wrap gap-3 mt-2 mb-1 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {metaItems.map((item, i) => (
          <motion.div
            key={i}
            className={`flex items-center ${item.color} px-3 py-1.5 rounded-full text-sm shadow-md transition-transform duration-200 hover:scale-105`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
          >
            <span className="mr-2 text-lg">{item.icon}</span>
            <span className="font-semibold">
              {item.label}: <span className="font-bold">{item.value}</span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const PurchaseOrderCard = ({ order, index }) => (
    <motion.div
      key={order.orderNo}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.03, boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      className="border rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 w-full border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-lg font-bold cursor-pointer bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent hover:underline"
            onClick={() => {
              setTempPurchaseOrder({ ...order });
              setSelectedPurchaseOrder(purchaseOrders.indexOf(order));
              setPurchaseFormErrors({ item: false, category: false });
            }}
          >
            {order.item || "Unnamed Order"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setTempPurchaseOrder({ ...order });
              setSelectedPurchaseOrder(purchaseOrders.indexOf(order));
              setPurchaseFormErrors({ item: false, category: false });
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-blue rounded-lg text-sm px-4 py-2 transition-all duration-200 hover:scale-105"
          >
            Track
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deletePurchaseOrder(purchaseOrders.indexOf(order))}
            className="border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm px-4 py-2 transition-all duration-200 hover:scale-105"
          >
            Delete
          </Button>
        </div>
      </div>
      <PurchaseOrderMetaInfo order={order} />
      <PurchaseTrackingSteps status={order.status} />
    </motion.div>
  );

  const renderSalesOrderTracking = () => (
    <CardContent className="py-8 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-5xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              📦
            </motion.span>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Sales Order Tracking
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-base"
              />
            </div>
          </div>
        </div>

        {selectedSalesOrder === null && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Button
                onClick={addNewSalesOrder}
                className="mb-6 text-base px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                + Add Order
              </Button>
            </motion.div>
            <div className="w-full max-w-[1600px] mx-auto overflow-x-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Order Placed
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {orderPlacedSalesOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No orders placed.
                      </motion.div>
                    ) : (
                      orderPlacedSalesOrders.map((order, i) => (
                        <SalesOrderCard key={order.slipNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Packaging
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {packagingSalesOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No orders in packaging.
                      </motion.div>
                    ) : (
                      packagingSalesOrders.map((order, i) => (
                        <SalesOrderCard key={order.slipNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Bagged & Delivery
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {baggedSalesOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No orders bagged or in delivery.
                      </motion.div>
                    ) : (
                      baggedSalesOrders.map((order, i) => (
                        <SalesOrderCard key={order.slipNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Delivered
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {deliveryDoneSalesOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No orders delivered.
                      </motion.div>
                    ) : (
                      deliveryDoneSalesOrders.map((order, i) => (
                        <SalesOrderCard key={order.slipNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {selectedSalesOrder !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-8 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <SalesTrackingSteps status={tempSalesOrder?.status || "order"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Customer Name
                </label>
                <Input
                  placeholder="Customer Name"
                  value={tempSalesOrder?.name || ""}
                  onChange={(e) => {
                    updateTempSalesOrder("name", e.target.value);
                    setSalesFormErrors((prev) => ({ ...prev, name: false }));
                  }}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                    salesFormErrors.name ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                {salesFormErrors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-sm"
                  >
                    Please enter a customer name
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Slip Number
                </label>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    placeholder="Slip Number"
                    value={tempSalesOrder?.slipNo || ""}
                    onChange={(e) => {
                      if (selectedSalesOrder === -1) {
                        updateTempSalesOrder("slipNo", e.target.value);
                        setSalesFormErrors((prev) => ({
                          ...prev,
                          slipNo: false,
                          slipNoUnique: false,
                        }));
                      }
                    }}
                    className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      selectedSalesOrder !== -1
                        ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                        : ""
                    } ${
                      salesFormErrors.slipNo || salesFormErrors.slipNoUnique
                        ? "border-rose-500 dark:border-rose-500"
                        : ""
                    }`}
                    readOnly={selectedSalesOrder !== -1}
                  />
                  {selectedSalesOrder !== -1 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                    >
                      Slip number cannot be changed for existing orders
                    </motion.p>
                  )}
                  {salesFormErrors.slipNo && selectedSalesOrder === -1 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-rose-500 text-sm"
                    >
                      Please enter a slip number
                    </motion.p>
                  )}
                  {salesFormErrors.slipNoUnique && selectedSalesOrder === -1 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-rose-500 text-sm"
                    >
                      This slip number is already in use
                    </motion.p>
                  )}
                </motion.div>
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Order Mode
                </label>
                <div className="flex gap-3 flex-wrap">
                  {["whatsapp", "manual"].map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={
                        tempSalesOrder?.source?.toLowerCase() === opt
                          ? "default"
                          : "outline"
                      }
                      onClick={() => updateTempSalesOrder("source", opt)}
                      className={
                        tempSalesOrder?.source?.toLowerCase() === opt
                          ? "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                          : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                      }
                    >
                      {capitalize(opt)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Order Status
                </label>
                <div className="flex gap-3 flex-wrap">
                  {["order", "packing", "bagged", "delivery", "done"].map(
                    (opt) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={
                          tempSalesOrder?.status?.toLowerCase() === opt
                            ? "default"
                            : "outline"
                        }
                        onClick={() => updateTempSalesOrder("status", opt)}
                        className={
                          tempSalesOrder?.status?.toLowerCase() === opt
                            ? opt === "bagged"
                              ? "bg-amber-600 hover:bg-amber-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                              : opt === "done"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                              : opt === "delivery"
                              ? "bg-purple-600 hover:bg-purple-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                              : "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                            : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                        }
                      >
                        {capitalize(opt)}
                      </Button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Delivery
                </label>
                <div className="flex gap-3">
                  {["takeaway", "home"].map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={
                        tempSalesOrder?.delivery?.toLowerCase() === opt
                          ? "default"
                          : "outline"
                      }
                      onClick={() => updateTempSalesOrder("delivery", opt)}
                      className={
                        tempSalesOrder?.delivery?.toLowerCase() === opt
                          ? "bg-purple-600 hover:bg-purple-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                          : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                      }
                    >
                      {capitalize(opt)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {(tempSalesOrder?.status?.toLowerCase() === "bagged" ||
              tempSalesOrder?.status?.toLowerCase() === "delivery" ||
              tempSalesOrder?.status?.toLowerCase() === "done") && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="space-y-2">
                  <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    Baggage Number
                  </label>
                  <Input
                    placeholder="Enter Bag Number"
                    value={tempSalesOrder?.bagNumber || ""}
                    onChange={(e) => updateTempSalesOrder("bagNumber", e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    Baggage Amount
                  </label>
                  <Input
                    placeholder="Enter Bag Amount"
                    value={tempSalesOrder?.bagAmount || ""}
                    onChange={(e) => updateTempSalesOrder("bagAmount", e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </motion.div>
            )}
            {tempSalesOrder?.status?.toLowerCase() === "done" &&
              tempSalesOrder?.completedDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-xl shadow-md"
                >
                  <p className="text-emerald-800 dark:text-emerald-200 font-semibold text-base">
                    Order completed on: {formatDate(tempSalesOrder.completedDate)}
                  </p>
                </motion.div>
              )}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={cancelSalesEdit}
                  className="h-10 flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base px-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </Button>
              </motion.div>
              <Button
                onClick={saveSalesOrder}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white h-10 rounded-xl shadow-lg transition-all duration-200 text-base hover:scale-105"
              >
                {selectedSalesOrder === -1 ? "Create Order" : "Update Order"}
              </Button>
              {selectedSalesOrder !== -1 && (
                <Button
                  variant="outline"
                  onClick={() => deleteSalesOrder(selectedSalesOrder)}
                  className="h-10 border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-200 text-base px-4 hover:scale-105"
                >
                  Delete Order
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </CardContent>
  );

  const renderPurchaseOrderTracking = () => (
    <CardContent className="py-8 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-5xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              🛒
            </motion.span>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Purchase Order Tracking
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search purchase orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-base"
              />
            </div>
          </div>
        </div>

        {selectedPurchaseOrder === null && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Button
                onClick={addNewPurchaseOrder}
                className="mb-6 text-base px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                + Add Purchase Order
              </Button>
            </motion.div>
            <div className="w-full max-w-[1600px] mx-auto overflow-x-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Order Placed
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {orderPlacedPurchaseOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No purchase orders placed.
                      </motion.div>
                    ) : (
                      orderPlacedPurchaseOrders.map((order, i) => (
                        <PurchaseOrderCard key={order.orderNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent sticky top-0 bg-inherit py-3 z-10">
                    Received
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {receivedPurchaseOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 text-gray-500 dark:text-gray-400 text-base"
                      >
                        No purchase orders received.
                      </motion.div>
                    ) : (
                      receivedPurchaseOrders.map((order, i) => (
                        <PurchaseOrderCard key={order.orderNo} order={order} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {selectedPurchaseOrder !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-8 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <PurchaseTrackingSteps status={tempPurchaseOrder?.status || "order"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Item
                </label>
                <Input
                  placeholder="Item Name"
                  value={tempPurchaseOrder?.item || ""}
                  onChange={(e) => {
                    updateTempPurchaseOrder("item", e.target.value);
                    setPurchaseFormErrors((prev) => ({ ...prev, item: false }));
                  }}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                    purchaseFormErrors.item ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                {purchaseFormErrors.item && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-sm"
                  >
                    Please enter an item name
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Category
                </label>
                <Input
                  placeholder="Category"
                  value={tempPurchaseOrder?.category || ""}
                  onChange={(e) => {
                    updateTempPurchaseOrder("category", e.target.value);
                    setPurchaseFormErrors((prev) => ({ ...prev, category: false }));
                  }}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                    purchaseFormErrors.category ? "border-rose-500 dark:border-rose-500" : ""
                  }`}
                />
                {purchaseFormErrors.category && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-sm"
                  >
                    Please enter a category
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Order Number
                </label>
                <Input
                  placeholder="Order Number"
                  value={tempPurchaseOrder?.orderNo || ""}
                  readOnly
                  className="w-full bg-gray-200 dark:bg-gray-600 cursor-not-allowed border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-base p-3 rounded-xl transition-all duration-300"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                >
                  Order number is auto-generated
                </motion.p>
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Order Status
                </label>
                <div className="flex gap-3 flex-wrap">
                  {["order", "received"].map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={
                        tempPurchaseOrder?.status?.toLowerCase() === opt
                          ? "default"
                          : "outline"
                      }
                      onClick={() => updateTempPurchaseOrder("status", opt)}
                      className={
                        tempPurchaseOrder?.status?.toLowerCase() === opt
                          ? opt === "received"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                            : "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                          : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                      }
                    >
                      {capitalize(opt)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {tempPurchaseOrder?.status?.toLowerCase() === "received" &&
              tempPurchaseOrder?.completedDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-xl shadow-md"
                >
                  <p className="text-emerald-800 dark:text-emerald-200 font-semibold text-base">
                    Order received on: {formatDate(tempPurchaseOrder.completedDate)}
                  </p>
                </motion.div>
              )}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={cancelPurchaseEdit}
                  className="h-10 flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base px-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </Button>
              </motion.div>
              <Button
                onClick={savePurchaseOrder}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white h-10 rounded-xl shadow-lg transition-all duration-200 text-base hover:scale-105"
              >
                {selectedPurchaseOrder === -1 ? "Create Order" : "Update Order"}
              </Button>
              {selectedPurchaseOrder !== -1 && (
                <Button
                  variant="outline"
                  onClick={() => deletePurchaseOrder(selectedPurchaseOrder)}
                  className="h-10 border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-200 text-base px-4 hover:scale-105"
                >
                  Delete Order
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </CardContent>
  );

  const renderEditableList = (data, setData, title) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 w-full max-w-[900px]"
    >
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-base"
          />
        </div>
        <Button
          onClick={() =>
            setData([...data, { name: "", amount: "", date: new Date().toISOString() }])
          }
          className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-200 text-base px-6 py-3 hover:scale-105"
        >
          + Add
        </Button>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {data.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-base">
            No {title.toLowerCase()} found
          </p>
        ) : (
          data.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1, type: "spring" }}
              className="border rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-lg flex items-center gap-4 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300"
            >
              <Input
                value={item.name}
                placeholder="Name"
                onChange={(e) =>
                  handleEdit(setData, i, "name", capitalize(e.target.value))
                }
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 flex-1 min-w-[200px] rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-base p-3"
              />
              <Input
                value={item.amount}
                placeholder="Amount"
                onChange={(e) => handleEdit(setData, i, "amount", e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 w-32 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-base p-3"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const updated = [...data];
                  updated.splice(i, 1);
                  setData(updated);
                }}
                className="border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
              >
                Delete
              </Button>
              {item.date && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Added: {formatDate(item.date)}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );

  const handleEdit = (setState, index, field, value) => {
    setState((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const filteredOutstandingDaily = outstandingDaily.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredOutstandingWeekly = outstandingWeekly.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPaymentDaily = paymentDaily.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPaymentWeekly = paymentWeekly.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <CardContent className="w-full max-w-[900px] mx-auto py-8 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  className="text-5xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  📋
                </motion.span>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Slips Reminder
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-200">
                Don't forget your pending slips today!
              </p>
            </motion.div>
          </CardContent>
        );
      case 1:
        return <div className="w-full">{renderSalesOrderTracking()}</div>;
      case 2:
        return <div className="w-full">{renderPurchaseOrderTracking()}</div>;
      case 3:
        return (
          <CardContent className="w-full max-w-[900px] mx-auto py-8 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  className="text-5xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  📌
                </motion.span>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Outstanding Reminder
                </h2>
              </div>
              <div className="flex gap-3 mb-4">
                <Button
                  variant={outstandingType === "daily" ? "default" : "outline"}
                  onClick={() => {
                    setOutstandingType("daily");
                    setSearchQuery("");
                  }}
                  className={
                    outstandingType === "daily"
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                      : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                  }
                >
                  Daily
                </Button>
                <Button
                  variant={outstandingType === "weekly" ? "default" : "outline"}
                  onClick={() => {
                    setOutstandingType("weekly");
                    setSearchQuery("");
                  }}
                  className={
                    outstandingType === "weekly"
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                      : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                  }
                >
                  Weekly
                </Button>
              </div>
              {outstandingType === "daily" &&
                renderEditableList(
                  filteredOutstandingDaily,
                  setOutstandingDaily,
                  "Daily Outstanding"
                )}
              {outstandingType === "weekly" &&
                renderEditableList(
                  filteredOutstandingWeekly,
                  setOutstandingWeekly,
                  "Weekly Outstanding"
                )}
            </motion.div>
          </CardContent>
        );
      case 4:
        return (
          <CardContent className="w-full max-w-[900px] mx-auto py-8 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  className="text-5xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  💸
                </motion.span>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Payment Reminder
                </h2>
              </div>
              <div className="flex gap-3 mb-4">
                <Button
                  variant={paymentType === "daily" ? "default" : "outline"}
                  onClick={() => {
                    setPaymentType("daily");
                    setSearchQuery("");
                  }}
                  className={
                    paymentType === "daily"
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                      : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                  }
                >
                  Daily
                </Button>
                <Button
                  variant={paymentType === "weekly" ? "default" : "outline"}
                  onClick={() => {
                    setPaymentType("weekly");
                    setSearchQuery("");
                  }}
                  className={
                    paymentType === "weekly"
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white text-base px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                      : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                  }
                >
                  Weekly
                </Button>
              </div>
              {paymentType === "daily" &&
                renderEditableList(
                  filteredPaymentDaily,
                  setPaymentDaily,
                  "Daily Payment"
                )}
              {paymentType === "weekly" &&
                renderEditableList(
                  filteredPaymentWeekly,
                  setPaymentWeekly,
                  "Weekly Payment"
                )}
            </motion.div>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-[1800px] mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <Button
                key={index}
                variant={currentSlide === index ? "default" : "outline"}
                onClick={() => {
                  setCurrentSlide(index);
                  setSearchQuery("");
                  setSelectedSalesOrder(null);
                  setTempSalesOrder(null);
                  setSelectedPurchaseOrder(null);
                  setTempPurchaseOrder(null);
                }}
                className={
                  currentSlide === index
                    ? "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                    : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-base px-4 py-2 transition-all duration-200 hover:scale-105"
                }
              >
                {slide}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setDarkMode(!darkMode)}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2 transition-all duration-200 hover:scale-105"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant={autoSlide ? "default" : "outline"}
              onClick={() => setAutoSlide(!autoSlide)}
              className={
                autoSlide
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl p-2 transition-all duration-200 hover:scale-105"
                  : "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2 transition-all duration-200 hover:scale-105"
              }
            >
              {autoSlide ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2 transition-all duration-200 hover:scale-105"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2 transition-all duration-200 hover:scale-105"
            >
              <SkipForward className="h-5 w-5" />

            </Button>
            <AnalogClock />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}