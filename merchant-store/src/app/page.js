"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useStore } from "./context/StoreContext";

const PRODUCTS = [
  {
    id: "prod_1",
    name: "CyberDeck Matrix Keypad",
    category: "Peripherals",
    price: 499,
    rating: "4.9",
    description: "Haptic feedback mechanical macropad with RGB per-key lighting.",
    image: "/images/keypad.jpg",
    badge: "Best Seller"
  },
  {
    id: "prod_2",
    name: "AeroPulse Wireless Earbuds",
    category: "Audio",
    price: 899,
    rating: "4.8",
    description: "Active noise cancellation with ultra-low latency cybernetic case.",
    image: "/images/earbuds.jpg",
    badge: "New Release"
  },
  {
    id: "prod_4",
    name: "Synapse Neo Glass XR",
    category: "Smart Wear",
    price: 1499,
    rating: "5.0",
    description: "Next-generation augmented visual HUD with ambient display.",
    image: "/images/glasses.jpg",
    badge: "Flagship"
  },
  {
    id: "prod_3",
    name: "Titanium MagCharge Dock",
    category: "Power",
    price: 299,
    rating: "4.7",
    description: "3-in-1 magnetic fast charging stand built with aerospace aluminum.",
    image: "/images/dock.jpg",
    badge: "Popular"
  },
  {
    id: "prod_5",
    name: "Carbon Stealth Gaming Mouse",
    category: "Peripherals",
    price: 349,
    rating: "4.6",
    description: "Ultra-lightweight 49g ergonomic mouse with 32,000 DPI optical sensor.",
    image: "/images/mouse.jpg",
    badge: "Featured"
  },
  {
    id: "prod_6",
    name: "NovaBeam Desk Lightbar",
    category: "Workspace",
    price: 199,
    rating: "4.8",
    description: "Auto-dimming ambient light bar with zero screen reflection.",
    image: "/images/lightbar.jpg",
    badge: "Essential"
  }
];

export default function ShopPage() {
  const { cart, addToCart, removeFromCart, clearCart, cartTotal, addOrder } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState(null);

  const executeRazorpayPayment = async (itemsToBuy, totalAmount, customDescription) => {
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const orderData = await response.json();
      if (!response.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to initialize order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Neon Store",
        description: customDescription || `Order for ₹${totalAmount}`,
        order_id: orderData.id,
        handler: function (razorpayResponse) {
          const newOrderRecord = {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            orderId: razorpayResponse.razorpay_order_id,
            paymentId: razorpayResponse.razorpay_payment_id,
            signature: razorpayResponse.razorpay_signature,
            amount: totalAmount,
            currency: "INR",
            items: itemsToBuy,
            createdAt: new Date().toISOString(),
            status: "Paid"
          };

          addOrder(newOrderRecord);
          setCheckoutMessage({
            type: "success",
            text: `Payment Successful! Payment ID: ${razorpayResponse.razorpay_payment_id}. Saved to My Orders.`,
            orderId: newOrderRecord.id
          });

          // Sync directly to PaySynapse Reconciler & Bank Ecosystem
          fetch("/api/sync-paysynapse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: razorpayResponse.razorpay_payment_id,
              orderId: razorpayResponse.razorpay_order_id,
              amount: totalAmount,
              currency: "INR",
              method: "card"
            })
          }).catch((err) => console.warn("Sync to PaySynapse error:", err));
        },
        prefill: {
          name: "Test Customer",
          email: "customer@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#528FF0"
        },
        modal: {
          ondismiss: function () {
            setActivePaymentId(null);
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not ready yet. Please refresh the page.");
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setCheckoutMessage({
          type: "error",
          text: `Payment failed: ${resp.error?.description || "Transaction declined"}`
        });
      });
      rzp.open();
    } catch (err) {
      setCheckoutMessage({
        type: "error",
        text: err.message || "An error occurred during checkout."
      });
    } finally {
      setActivePaymentId(null);
    }
  };

  const handleDirectPay = async (product) => {
    setActivePaymentId(product.id);
    setCheckoutMessage(null);
    await executeRazorpayPayment(
      [{ ...product, qty: 1 }],
      product.price,
      `Direct Purchase: ${product.name}`
    );
  };

  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    setActivePaymentId("cart");
    setCheckoutMessage(null);
    await executeRazorpayPayment(
      [...cart],
      cartTotal,
      `Cart Checkout (${cart.length} items)`
    );
    clearCart();
    setIsCartOpen(false);
  };

  const totalItemCount = cart.reduce((count, item) => count + item.qty, 0);

  return (
    <div className="py-8 space-y-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 md:p-12 border border-slate-800 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-[#528FF0] border border-blue-500/20">
            Razorpay Sandbox Verified
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            Developer Gear & Electronics
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Seamless one-click checkout powered by Razorpay. Test transactions and trace real-time settlement lifecycles.
          </p>
        </div>
      </section>

      {/* Notification Banner */}
      {checkoutMessage && (
        <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${
          checkoutMessage.type === "success" 
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
            : "bg-rose-950/40 border-rose-500/30 text-rose-300"
        }`}>
          <div className="flex items-center gap-3">
            {checkoutMessage.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm font-medium">{checkoutMessage.text}</p>
          </div>
          {checkoutMessage.type === "success" && (
            <Link
              href="/orders"
              className="shrink-0 px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition text-center"
            >
              View in My Orders & Claim Refund
            </Link>
          )}
        </div>
      )}

      {/* Section Header & Cart Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="text-sm text-slate-400">Choose Direct Pay or add items to cart</p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm flex items-center gap-2 transition active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>View Cart</span>
          {totalItemCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#528FF0] text-white text-xs font-bold flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((prod) => {
          const isPayingThis = activePaymentId === prod.id;

          return (
            <div
              key={prod.id}
              className="group relative rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                {/* Product Visual */}
                <div className="relative h-56 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-900/90 text-white border border-slate-700">
                    {prod.badge}
                  </span>
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700">
                    Rating: {prod.rating}
                  </span>
                </div>

                {/* Product Details */}
                <div>
                  <span className="text-xs font-medium text-[#528FF0] uppercase tracking-wider">{prod.category}</span>
                  <h3 className="text-lg font-semibold text-white mt-0.5">{prod.name}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                </div>
              </div>

              {/* Price & Dual Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Price</span>
                  <span className="text-2xl font-bold text-white">₹{prod.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      addToCart(prod);
                      setIsCartOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs transition active:scale-95 text-center"
                  >
                    + Add to Cart
                  </button>

                  <button
                    onClick={() => handleDirectPay(prod)}
                    disabled={isPayingThis || activePaymentId !== null}
                    className="py-2.5 px-3 rounded-lg bg-[#528FF0] hover:bg-[#4080E0] text-white font-semibold text-xs transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isPayingThis ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening...
                      </>
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                    {totalItemCount} items
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items List */}
              <div className="mt-6 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-16 text-center text-gray-500 space-y-3">
                    <svg className="w-10 h-10 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-sm">Your shopping cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <div className="text-xs text-gray-400">
                          ₹{item.price} × {item.qty} = <span className="text-white font-medium">₹{item.price * item.qty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer / Checkout */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-base">
                <span className="text-gray-400">Order Subtotal:</span>
                <span className="text-2xl font-extrabold text-white">₹{cartTotal}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0 || activePaymentId === "cart"}
                  className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-medium text-xs transition disabled:opacity-40"
                >
                  Clear
                </button>
                <button
                  onClick={handleCartCheckout}
                  disabled={cart.length === 0 || activePaymentId === "cart"}
                  className="flex-1 py-3.5 rounded-xl bg-[#528FF0] hover:bg-[#4080E0] text-white font-semibold text-sm transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm flex items-center justify-center gap-2"
                >
                  {activePaymentId === "cart" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opening Gateway...
                    </>
                  ) : (
                    `Pay ₹${cartTotal} with Razorpay`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
