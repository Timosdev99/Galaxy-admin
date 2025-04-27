'use client'
import { useState, useEffect, SetStateAction } from "react";
import OrdersTable from "../component/orders/OrdersTable";
import OrderFilters from "../component/orders/OrdersFilters";
import OrderStats from "../component/orders/OrderStats";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/authcontext";
import DashboardLayout from "../component/layout/dashboardLayout";
import ProtectedRoute from "../protectedRoutes";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    marketplace: "",
    customerId: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const { token, user } = useAuth();
  
  const fetchOrders = async () => {
    // Don't attempt to fetch if token is missing
    // if (!token) {
    //   console.log("Skipping fetch - missing token");
    //   return;
    // }
    
    try {
      setLoading(true);
      
      // Build query parameters from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = `https://galaxy-backend-imkz.onrender.com/order/v1/orders?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Add safety check for orders array
      if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        console.error("Orders data is not an array:", response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Only fetch orders when token is available
  // useEffect(() => {
  //   if (token) {
  //     fetchOrders();
  //   }
  // }, [token]);

  const handleFilterChange = (newFilters: SetStateAction<{ status: string; marketplace: string; customerId: string; fromDate: string; toDate: string; minAmount: string; maxAmount: string; }>) => {
    setFilters(newFilters);
  };

  const handleFilterApply = () => {
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      await axios.patch(
        "https://galaxy-backend-imkz.onrender.com/order/v1/orders/update",
        { orderId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order status updated successfully");
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentConfirm = async (orderId: any) => {
    try {
      await axios.post(
        "https://galaxy-backend-imkz.onrender.com/order/v1/orders/confirm-payment",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Payment confirmed successfully");
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error("Failed to confirm payment");
    }
  };

  return (
 
   <DashboardLayout>
     <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
        <OrderStats />
      </div>
      
      <OrderFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onApplyFilters={handleFilterApply} 
      />
      
      <OrdersTable 
        orders={orders} 
        loading={loading} 
        onStatusUpdate={handleStatusUpdate}
        onPaymentConfirm={handlePaymentConfirm}
      />
    </div>
  </DashboardLayout>

  );
}