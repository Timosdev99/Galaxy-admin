"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../component/layout/dashboardLayout';
import ChatInterface from './chatUI';
import { useAuth } from '../context/authcontext';

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {  user } = useAuth();


  // const token = localStorage.getItem('token')
  // useEffect(() => {
  //   if (!token) {
  //     router.push('/');
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [token, router]);

  // if (isLoading) {
  //   return (
  //     <DashboardLayout>
  //       <div className="flex justify-center items-center h-64">
  //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <ChatInterface className="h-[calc(100vh-180px)]" />
      </div>
    </DashboardLayout>
  );
}