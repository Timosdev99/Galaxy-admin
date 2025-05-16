'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { formatCurrency } from "../../utils/formatter";
import { useAuth } from "../../context/authcontext";

// Define types for the analytics data
interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
  ordersByMarketplace: Record<string, number>;
  revenueByMarketplace: Record<string, number>;
}

// Define type for stat cards
interface StatCard {
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}

export default function OrderStats() {
  const [analytics, setAnalytics] = useState<OrderAnalytics>({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    totalRevenue: 0,
    ordersByStatus: {},
    ordersByPaymentMethod: {},
    ordersByMarketplace: {},
    revenueByMarketplace: {}
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {

      try {
        setLoading(true);
        const response = await axios.get("https://galaxy-backend-imkz.onrender.com/order/v1/orders/analytics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (response.data && response.data.analytics) {
          setAnalytics(response.data.analytics);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch order analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const statCards: StatCard[] = [
    {
      title: "Total Orders",
      value: analytics.totalOrders,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Completed Orders",
      value: analytics.completedOrders,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Cancelled Orders",
      value: analytics.cancelledOrders,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gray-100 p-4 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} p-4 rounded-lg shadow`}
          >
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className={`text-2xl font-bold ${card.textColor} mt-2`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Orders by Status</h3>
          <div className="space-y-2">
            {Object.entries(analytics.ordersByStatus || {}).map(([status, count]: [string, number]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Orders by Marketplace</h3>
          <div className="space-y-2">
            {Object.entries(analytics.ordersByMarketplace || {}).map(([marketplace, count]: [string, number]) => (
              <div key={marketplace} className="flex justify-between items-center">
                <span>{marketplace}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}  