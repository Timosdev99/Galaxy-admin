"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import AdminDashboard from "./component/admin/dashboard";
import DashboardLayout from "./component/layout/dashboardLayout";
import StatCard from "./component/layout/StatCard";
import { Package, Percent, Ticket } from "lucide-react";
import ProjectTable from "./component/layout/ProjectTable";
import AuthComponent from "./component/SignUp";
export default function Home() {
  const [isLightMode, setIsLightMode] = useState(false);
 const [loading, setLoading] = useState(true);


  useEffect(() => { 
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);
  return (
   <div className="items-center justify-center flex my-36">
     < AuthComponent/>
   </div>
  );
}
