"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { IoPersonCircle, IoMenu } from "react-icons/io5";
import { useRouter } from "next/navigation";
import dotenv from 'dotenv';
import { FaUserTie } from "react-icons/fa";

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const VerifikasiAuthor1 = () => {
  const router = useRouter();

  const menus = [
    {href:'/admin/dashboard', text: "Home"},
    {href:'/admin/kelola-author', text: "Kelola Author"},
    {href:'/auth/login-admin', text: "Logout"},
  ];

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
        <div className="mx-auto flex justify-between items-center font-poppins max-w-full px-4">
          <div className="flex justify-between items-center">
            {/* Ikon Menu untuk mobile */}
            <button onClick={toggleSidebar} className="lg:hidden">
              <IoMenu className="h-[30px]" />
            </button>

            <img 
              src="/images/etamtest.png" 
              alt="EtamTest" 
              className="h-[30px] lg:h-10 pl-3 object-cover" 
            />
          </div>
          <span className="text-white font-poppins font-bold mr-3">Hai, Admin </span>
        </div>
      </header>

      {/* Sidebar untuk mobile */}
      <aside className={`fixed bg-[#78AED6] top-17 mt-5 pt-6 left-0 w-64 h-full transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden z-40`}>
        <ul className="p-4 space-y-4 text-deepblue rounded-lg">
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
              <Link href={menu.href} className="block font-poppins font-bold w-full py-2 px-2 bg-deepBlue bg-opacity-50 hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">
                {menu.text}
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

      {/* Sidebar untuk desktop */}
      <div className="hidden lg:block fixed bg-[#78AED6] top-15 mt-8 pt-6 left-0 w-[250px] lg:w-[350px] h-full transition-transform z-40">
        <ul className="p-4 space-y-4 text-deepblue rounded-lg">
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
              <Link href={menu.href} className="block font-poppins font-bold w-full py-2 px-2 hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">
                {menu.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>  

      {/* Konten */}
      <div className="flex mt-8 min-h-screen bg-white justify-center items-center lg:ml-[350px]">
        {/* Kontainer utama */}
        <div className="flex-1 flex justify-center items-center bg-white p-4">
          <div className="block lg:flex justify-center rounded-lg items-center bg-[#F3F3F3] lg:w-[837px] w-[90%] lg:h-[463px]">
            {/* Box 1 */}
            <div className="lg:w-[190px] lg:h-[200px] text-center p-3 bg-paleBlue hover:bg-powderBlue shadow-lg m-3 rounded-lg flex flex-col justify-center items-center text-[#0B61AA] text-lg font-bold">
              <Link href="/admin/kelola-author/data-author" className="w-full h-full flex flex-col justify-center items-center animate-flyIn">
                <FaUserTie className="text-8xl text-deepblue object-cover" />
                <p className="mt-3 lg:text-basic">Data Author</p>
              </Link>
            </div>

            {/* Box 2 */}
            <div className="lg:w-[190px] lg:h-[200px] justify-center text-center p-3 bg-paleBlue shadow-lg hover:bg-powderBlue m-3 rounded-lg flex flex-col items-center text-[#0B61AA] text-lg font-bold">
              <Link href="/admin/kelola-author/verifikasi-author" className="w-full h-full flex flex-col justify-center items-center animate-flyIn">
                <FaUserTie className="text-8xl text-deepBlue object-cover" />
                <p className="mt-3 lg:text-basic">Verifikasi Author</p>
              </Link>
            </div>
          </div>
        </div>
      </div>           
    </>
  );
};

export default VerifikasiAuthor1;
