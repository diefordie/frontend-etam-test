"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Link from 'next/link';
import { FaSearch } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const VerifikasiAuthor2 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua"); // Filter untuk verifikasi
  const [data, setData] = useState([]); // Data dengan kelengkapan dokumen
  const [error, setError] = useState(null);
  const [errorUser, setErrorUser] = useState(null);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };  

  // Fetch authors from the backend
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(`http://${URL}/author/get-author`);
        if (Array.isArray(response.data.data)) {
          const fetchedAuthors = response.data.data.map((author) => ({
            ...author,
            dokumenKelengkapan: "--", // Default untuk kelengkapan dokumen di frontend
            status: author.isApproved ? 'Disetujui' : 'Tidak Disetujui', // Tambahkan status verifikasi
          }));
          setAuthors(fetchedAuthors);
          setData(fetchedAuthors); // Simpan data dengan tambahan kolom dokumen
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  // Fungsi untuk menghitung jumlah sudah dan belum verifikasi
  const getVerificationCounts = () => {
    let sudahVerifikasi = 0;
    let belumVerifikasi = 0;

    data.forEach((item) => {
      if (item.status === 'Disetujui') {
        sudahVerifikasi++;
      } else {
        belumVerifikasi++;
      }
    });

    return { sudahVerifikasi, belumVerifikasi, total: data.length };
  };

  const { sudahVerifikasi, belumVerifikasi, total } = getVerificationCounts();

  // Fungsi untuk mengupdate status berdasarkan kelengkapan dokumen dan verifikasi

  const updateStatus = (index) => {
    const updatedData = [...data];
    const item = updatedData[index];

    if (item.isApproved) {
        item.status = 'Disetujui';
    } else if (!item.isApproved) { // Pengkondisian baru
        item.status = 'Tidak Disetujui'; // Status baru untuk kondisi ini
    }

    setData(updatedData);
  };

  // Fungsi untuk memfilter data berdasarkan jenis verifikasi

  const filteredData = () => {
    let result = authors;
  
    // Filter berdasarkan status
    if (filter === "belumVerifikasi") {
      return data.filter((item) => item.status === 'Tidak Disetujui');
    }
    if (filter === "sudahVerifikasi") {
      return data.filter((item) => item.status === 'Disetujui');
    }
  
    // Filter berdasarkan pencarian
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery) ||
          item.email.toLowerCase().includes(searchQuery)
      );
    }
  
    return result;
  };
  

  // Fungsi untuk mengupdate verifikasi author (nanti disesuaikan dengan endpoint)
  const handleUpdateVerifikasi = async (index, newVerifikasiStatus) => {
    const updatedData = [...data];
    updatedData[index].isApproved = newVerifikasiStatus === "Yes"; // Update status verifikasi di frontend
    setData(updatedData);
    updateStatus(index);

    try {
      // Panggil service untuk update verifikasi author di backend
      const response = await axios.patch(`http://${URL}/author/edit-author/${updatedData[index].id}/status`, {
        id: updatedData[index].id, // Kirim ID author yang akan di-update
        isApproved: updatedData[index].isApproved, // Kirim status verifikasi
      });

      if (response.status === 200) {
        console.log("Verifikasi berhasil diupdate:", response.data);
      } else {
        console.error("Gagal memperbarui verifikasi:", response);
      }
    } catch (error) {
      console.error("Error updating verifikasi:", error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
        const response = await fetch(`http://${URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Sertakan token jika perlu
            },
        });
        if (!response.ok) {
            throw new Error('Logout failed');
        }

        localStorage.clear();

        window.location.href = '/auth/login-admin';
    } catch (error) {
        console.error('Error during logout:', error);
    }
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const menus = [
    {href:'/admin/dashboard', text: "Home"},
    {href:'/admin/kelola-author', text: "Kelola Author"},
    {href:'/auth/login-admin', text: "Logout"},
  ]

  return (
      <>
        {/* Header */}
        <header className="fixed p-3 bg-deepBlue top-0 left-0 right-0 text-white w-full font-poppins lg:p-3 z-50">
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
              <span className="text-white font-poppins font-bold mr-3">Verifikasi Author</span>
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
                <a className="block font-poppins font-bold w-full py-2 px-2 bg-opacity-50  hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">{menu.text}</a>
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

        <div className="col-span-3 h-full">
          <div className={`fixed bg-[#78AED6] w-auto  lg:w-[350px] hidden lg:block top-15 mt-8 pt-6 left-0 w-64 h-full transition-transform transform z-40`}>
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
        </div>
        
        
        {/* Main content */}
        <div className="flex flex-col flex-1 mt-8">
          {/* Search Bar Section */}
          
          <div className="flex flex-col lg:flex-row items-center justify-between px-2 md:px-7 lg:px-8 py-5 bg-white gap-4 font-poppins lg:pl-[380px] mt-[42px] md:mt-[50px] lg:mt-[60px]">
            <div className="flex items-center max-w-lg bg-white rounded-full shadow  py-1 lg:py-3 px-3 md:px-8 lg:px-8  ">
              <div>
              <FaSearch className="text-[0.9rem] lg:text-basic text-gray-600 mr-0 md:mr-3 lg:mr-4"/>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Cari Nama atau Email"
                  className="flex-1 border-none outline-none ml-4 text-sm md:text-basic lg:text-basic"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

            </div>

            <div className="flex gap-4 items-center font-poppins">
              <button
                onClick={() => setFilter("semua")}
                className={`flex items-center text-[0.7rem]  lg:text-basic justify-between w-[94px] lg:w-[130px] px-2 md:px-4 lg:px-4 py-4 md:py-2 lg:py-2 text-black rounded-full ${filter === "semua" ? "bg-paleBlue" : "bg-abumuda"}`}
              >
                <span>Semua</span> 
                <span className="text-red-600 font-semibold">{total}</span>
              </button>

              <button
                onClick={() => setFilter("belumVerifikasi")}
                className={`flex items-center text-[0.7rem] lg:text-basic  justify-between  w-[100px]  lg:w-[165px] px-2 md:px-4 py-2 text-black rounded-full ${filter === "belumVerifikasi" ? "bg-paleBlue" : "bg-abumuda"}`}
              > 
                <div className="flex gap-4 justify-between items-center ">
                <span>Belum Verifikasi</span>
                <span className="text-red-600 font-semibold">{belumVerifikasi}</span>
                </div>
              </button>

              <button
                onClick={() => setFilter("sudahVerifikasi")}
                className={`flex items-center text-[0.7rem] lg:text-basic  justify-between  w-[100px]  lg:w-[165px] px-2 md:px-4 py-2 text-black rounded-full ${filter === "sudahVerifikasi" ? "bg-paleBlue" : "bg-abumuda"}`}
                >
                < div className="flex gap-4 justify-between items-center ">
                  <span>Sudah Verifikasi </span>
                  <span className="text-red-600 font-semibold "> {sudahVerifikasi}</span>
                  </div>
              </button>
            </div>
          </div>
          

          {/* Table Section */}
          <div className="p-3 overflow-x-auto item-center bg-white min-h-screen justify-center lg:pl-[355px]">
            <div className="p-3 overflow-x-auto md:overflow-x-auto lg:overflow-visible">
              <div className=" p-1 md:p-3 lg:p-5 -mx-3 md:-mx-7 lg:-mx-4">
                
                <table className="p-4 min-w-full text-left text-sm font-light table-auto">
                  <thead className="border-b font-medium dark:border-neutral-500">
                    <tr className="bg-powderBlue text-white text-center">
                      <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Tanggal</th>
                      <th className="border text-[0.5rem] lg:text-sm p-2 lg:block hidden align-middle">ID</th>
                      <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Nama</th>
                      <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Email</th>
                      <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Verifikasi</th>
                      <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredData().map((item, rowIndex) => (
                    <tr key={item.id}>
                      <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="border text-[0.5rem] lg:text-sm p-2 text-center lg:block hidden align-middle">{item.id}</td>
                      <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{item.name}</td>
                      <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{item.email}</td>
                      <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">
                      <select
                          value={item.isApproved ? "Yes" : "No"}
                          onChange={(e) => handleUpdateVerifikasi(rowIndex, e.target.value)}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">
                          <span className={`inline-block  w-[75px] md:w-[120px]  lg:w-[151px] px-2  py-0 md:py-1 lg:py-1 rounded-full ${
                              item.status === 'Tidak Disetujui' ? 'bg-[#CF0000] text-white' : 
                              item.status === 'Disetujui' ? 'bg-[#228804] text-white' : 
                              '' // Default jika status tidak cocok
                            }`}>
                            {item.status} 
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
                
              </div>
            </div>
          </div>
          </div>
        
      
    </>
  );
};

export default VerifikasiAuthor2;


