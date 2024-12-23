"use client"; 
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import axios from 'axios';
import { IoPersonCircle } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";


import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const VerifikasiAuthor2 = () => {
  const [data, setData] = useState([]); // State for backend data
  const [filter, setFilter] = useState("semua"); // State for filtering
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [token, setToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredData = () => {
    let result = authors;
  
    // Filter berdasarkan status
    if (filter === "aktif") {
      result = result.filter((item) => item.isApproved);
    } else if (filter === "nonaktif") {
      result = result.filter((item) => !item.isApproved);
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

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://${URL}/author/get-author`);
        if (response.data && response.data.data) {
          setAuthors(response.data.data);
        } else {
          throw new Error('Data tidak sesuai format yang diharapkan');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data author');
        console.error('Error fetching authors:', err);
      } finally {
        setLoading(false);
      }
    };

  fetchAuthors();
  }, []);

  const getStatusCount = () => {
    let aktif = 0;
    let nonaktif = 0;
  
    authors.forEach(item => {
      if (item.isApproved) aktif++;
      else nonaktif++;
    });
  
    return { aktif, nonaktif, total: authors.length };
  };
  

const { aktif, nonaktif, total } = getStatusCount();

const handleStatusChange = async (id, newStatus) => {
  try {
   
    await axios.patch(`https://${URL}/author/edit-author/${id}/status`, { isApproved: newStatus === 'Aktif' });
    
    setAuthors(authors.map(author => 
      author.id === id ? { ...author, isApproved: newStatus === 'Aktif' } : author
    ));
  } catch (error) {
    console.error('Error updating author status:', error);
    
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
            <span className="text-white font-poppins font-bold mr-3">Data Author</span>
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
                  className={`flex items-center text-[0.7rem]  lg:text-basic justify-between w-[90px] lg:w-[130px] px-4 py-2 text-black rounded-full ${filter === "semua" ? "bg-paleBlue" : "bg-abumuda"}`}
                >
                  <span>Semua</span>
                  <span className="text-red-600 font-semibold">{total}</span>
                </button>

                <button
                  onClick={() => setFilter("aktif")}
                  className={`flex items-center text-[0.7rem] lg:text-basic  justify-between  w-[80px]  lg:w-[130px] px-4 py-2 text-black rounded-full ${filter === "aktif" ? "bg-paleBlue" : "bg-abumuda"}`}
                >
                  <span>Aktif</span>
                  <span className="text-red-600 font-semibold">{aktif}</span>
                </button>

                <button
                  onClick={() => setFilter("nonaktif")}
                  className={`flex items-center text-[0.7rem] lg:text-basic justify-between  w-[94px]  lg:w-[130px] px-4 py-2 text-black rounded-full ${filter === "nonaktif" ? "bg-paleBlue" : "bg-abumuda"}`}
                >
                  <span>Nonaktif</span>
                  <span className="text-red-600 font-semibold">{nonaktif}</span>
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
                        <th className="border text-[0.5rem] lg:text-sm p-2 lg:block hidden align-middle">ID</th> {/* Hide on mobile */}
                        <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Nama</th>
                        <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Email</th>
                        <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Tes Diterbitkan</th>
                        <th className="border text-[0.5rem] lg:text-sm p-1 align-middle">Status Akun</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData().map((author, rowIndex) => (
                        <tr key={author.id}>
                          <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{new Date(author.createdAt).toLocaleDateString()}</td>
                          <td className="border text-[0.5rem] lg:text-sm p-2 text-center lg:block hidden align-middle">{author.id}</td> {/* Hide on mobile */}
                          <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{author.name}</td>
                          <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{author.email}</td>
                          <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">{author.publishedTestCount}</td>
                          <td className="border text-[0.5rem] lg:text-sm p-1 text-center align-middle">
                            <select
                              value={author.isApproved ? 'Aktif' : 'Nonaktif'}
                              onChange={(e) => handleStatusChange(author.id, e.target.value)}
                              className={`inline-block w-[60px] lg:w-[151px] px-0 md:px-2 lg:px-2 py-1 rounded-full text-white ${author.isApproved ? 'bg-[#228804]' : 'bg-[#CF0000]'}`}
                            >
                              <option value="Aktif">Aktif</option>
                              <option value="Nonaktif">Nonaktif</option>
                            </select>
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