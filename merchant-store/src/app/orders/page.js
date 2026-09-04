"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "../context/StoreContext";

export default function OrdersPage() {
  const { orders, markOrderRefunded } = useStore();
  const [refundingId, setRefundingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleClaimRefund = async (order) => {
    if (order.status === "Refunded") return;

    const confirmRefund = window.confirm(
      `Are you sure you want to claim a full refund of ₹${order.amount} for Order #${order.id}?`
    );
    if (!confirmRefund) return;

    setRefundingId(order.paymentId);
    setFeedback(null);

    try {
      const response = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: order.paymentId }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to process refund with Razorpay");
      }

      markOrderRefunded(order.paymentId);
      setFeedback({
        type: "success",
        message: `Refund successful (Refund ID: ${data.refund?.id || "Processed"}). Status updated. Check your Razorpay Dashboard under Refunds.`
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Refund failed: ${err.message}`
      });
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Order History & Refunds</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track purchases and initiate automated refunds directly via the Razorpay API.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-medium text-white transition self-start"
        >
          ← Continue Shopping
        </Link>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in ${
          feedback.type === "success" 
            ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-300"
            : "bg-rose-950/50 border-rose-500/30 text-rose-300"
        }`}>
          {feedback.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-sm text-gray-400">
            You haven't completed any purchases yet. Explore the catalog and test a purchase.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#528FF0] hover:bg-[#4080E0] text-white font-medium text-sm transition shadow-sm"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-6 shadow-xl backdrop-blur-md"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Order ID</span>
                    <span className="font-semibold text-white">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Date Placed</span>
                    <span className="text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Razorpay Payment ID</span>
                    <code className="text-xs bg-white/5 px-2 py-0.5 rounded text-blue-300 font-mono">
                      {order.paymentId}
                    </code>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      order.status === "Refunded"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {order.status === "Refunded" ? "Refunded" : "Paid"}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-white">{item.name}</h4>
                      <span className="text-xs text-gray-400">Qty: {item.qty}</span>
                    </div>
                    <span className="text-sm font-bold text-white">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer & Refund Action */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="text-gray-400">Total Amount: </span>
                  <span className="text-xl font-black text-white">₹{order.amount}</span>
                </div>

                <div>
                  {order.status === "Refunded" ? (
                    <span className="text-xs text-gray-400 italic">
                      This order has already been fully refunded.
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimRefund(order)}
                      disabled={refundingId === order.paymentId}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition active:scale-95 disabled:opacity-50 shadow-md shadow-rose-600/20 flex items-center gap-2"
                    >
                      {refundingId === order.paymentId ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Refund...
                        </>
                      ) : (
                        "Claim Refund"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
