"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { IoPersonCircle } from "react-icons/io5";
import { SlBookOpen } from "react-icons/sl";
import { FaBookReader } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IoMenu } from "react-icons/io5";
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;


const VerifikasiAuthor1 = () => {
  const router = useRouter();

  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalAuthors: 0,
    totalPublishedTests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`https://${URL}/api/admin/dashboard-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication header if required
            // 'Authorization': `Bearer ${yourAuthToken}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const data = await response.json();
        setDashboardStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const menus = [
    {href:'/admin/dashboard', text: "Home"},
    {href:'/admin/kelola-author', text: "Kelola Author"},
    {href:'/auth/login-admin', text: "Logout"},
  ]

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  return (
    <>  
      {/* Header */}
      <header className="fixed p-4 bg-deepBlue top-0 left-0 right-0 text-white w-full font-poppins lg:p-3 z-50">
        <div className="mx-auto flex justify-between items-center font-poppins max-w-full ">
          <div className="flex justify-between">
            {/* Ikon Menu untuk mobile */}
            <button onClick={toggleSidebar}>
            <IoMenu  className="h-[30px] lg:hidden"/>
            </button>

            <img 
              src="/images/etamtest.png" 
              alt="EtamTest" 
              className="h-[30px] lg:h-10 pl-3" 
            />

          </div>
            <span className="text-white font-poppins font-bold mr-3">Hai, Admin </span>
        </div>
      </header>

      {/* Sidebar ketika tampilan mobile */}
      <aside className={`fixed bg-[#78AED6] top-17 mt-5 pt-6 left-0 w-64 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden z-40`}>
        <ul className="p-4 space-y-4 text-deepblue round-lg">
          <div className="flex flex-col items-center text-center">
            <li>
              <IoPersonCircle className="h-14 w-14 cursor-pointer text-white"/>
            </li>
            <div className="text-white">
              <p className="text-[18px] font-poppins">Administrator</p>
            </div>
          </div>
          {menus.map((menu, index) => (
            <li key={index}>
              <Link legacyBehavior href={menu.href}>
                <a className="block font-poppins font-bold w-full py-2 px-2 bg-deepBlue bg-opacity-50  hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">{menu.text}</a>
              </Link>
            </li>
          ))}
        </ul>
      </aside>  

      {/* Overlay untuk menutup sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* side menu */}
      <div className={`fixed bg-[#78AED6] w-[131px]  lg:w-[350px] hidden lg:block top-15 mt-8 pt-6 left-0 w-64 h-full transition-transform transform z-40`}>
        <ul className="p-4 space-y-4 text-deepblue round-lg">
          <div className="flex flex-col items-center text-center">
            <li>
              <IoPersonCircle className="text-8xl cursor-pointer text-white"/>
            </li>
            <div className="text-white">
              <p className="text-[18px] font-poppins">Administrator</p>
            </div>
          </div>
          {menus.map((menu, index) => (
            <li key={index}>
              <Link legacyBehavior href={menu.href}>
                <a className="block font-poppins font-bold w-full py-2 px-2 hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">{menu.text}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>  

      <div className="flex mt-8 min-h-screen bg-white min-h-screen justify-center items-center lg:ml-[350px] ">
        <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap text-center justify-center items-center p-8 rounded-lg bg-paleBlue">
          {/* Box 1 */}
          <div className="bg-[#F3F3F3] w-[125px] h-[160px] lg:w-[240px] lg:h-[240px] m-2 p-2 rounded-lg flex flex-col items-center justify-center text-[#0B61AA] font-bold shadow-lg">
            <p className="font-poppins text-sm lg:text-lg text-center truncate">Total Pengguna</p>
            <div className="flex justify-center items-center h-[60px]">
              <FaBookReader className="text-4xl lg:text-7xl lg:mt-9" />
            </div>
            <p className="font-poppins font-bold text-sm lg:text-2xl lg:mt-8">{dashboardStats.totalUsers}</p>
          </div>

          {/* Box 2 */}
          <div className="bg-[#F3F3F3] w-[125px] h-[160px] lg:w-[240px] lg:h-[240px] m-2 p-2 rounded-lg flex flex-col items-center justify-center text-[#0B61AA] font-bold shadow-lg">
            <p className="font-poppins text-sm lg:text-lg text-center truncate">Total Author</p>
            <div className="flex justify-center items-center h-[60px]">
              <FaUserTie className="text-4xl lg:text-7xl lg:mt-9 " />
            </div>
            <p className="font-poppins font-bold text-sm lg:text-2xl lg:mt-8">{dashboardStats.totalAuthors}</p>
          </div>

          {/* Box 3 */}
          <div className="bg-[#F3F3F3] w-[125px] h-[160px] lg:w-[240px] lg:h-[240px] m-2 p-2 rounded-lg flex flex-col items-center justify-center text-[#0B61AA] font-bold shadow-lg">
          <p className="font-poppins text-sm lg:text-lg text-center truncate">Total Tes</p>
            <div className="flex justify-center items-center h-[60px]">
              <SlBookOpen className="text-4xl lg:text-7xl lg:mt-9" />
            </div>
            <p className="font-poppins font-bold text-sm lg:text-2xl lg:mt-8">{dashboardStats.totalPublishedTests}</p>
          </div>

        </div>
      </div>           
    </>
  );
};

export default VerifikasiAuthor1 ;
