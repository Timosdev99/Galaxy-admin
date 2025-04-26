'use client'
import { useState } from "react";

interface FilterProps {
  filters: {
    status: string;
    marketplace: string;
    customerId: string;
    fromDate: string;
    toDate: string;
    minAmount: string;
    maxAmount: string;
  };
  onFilterChange: (filters: any) => void;
  onApplyFilters: () => void;
}

export default function OrderFilters({ filters, onFilterChange, onApplyFilters }: FilterProps) {
  const [localFilters, setLocalFilters] = useState({ ...filters });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onFilterChange(localFilters);
    onApplyFilters();
  };

  const handleReset = () => {
    const resetFilters = {
      status: "",
      marketplace: "",
      customerId: "",
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onApplyFilters();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Orders</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={localFilters.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace</label>
            <select
              name="marketplace"
              value={localFilters.marketplace}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Marketplaces</option>
              <option value="GalaxyService">Galaxy Service</option>
              <option value="studio43">Studio 43</option>
              <option value="NorthernEats">Northern Eats</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
            <input
              type="text"
              name="customerId"
              value={localFilters.customerId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Customer ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={localFilters.fromDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={localFilters.toDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount ($)</label>
            <input
              type="number"
              name="minAmount"
              value={localFilters.minAmount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Min Amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount ($)</label>
            <input
              type="number"
              name="maxAmount"
              value={localFilters.maxAmount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Max Amount"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}