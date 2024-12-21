"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import Link from 'next/link';
import { FaSearch } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import dynamic from 'next/dynamic';
import "gridjs/dist/theme/mermaid.css";
import { jwtDecode } from "jwt-decode";
import GridWrapper from '../../../../components/GridWrapper';

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const VerifikasiAuthor2 = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [data, setData] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [errorUser, setErrorUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  useEffect(() => {
    const getUserIdFromToken = () => {
      try {
        setLoading(true);
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token tidak ditemukan');
          }
  
          const decodedToken = jwtDecode(token);
          if (!decodedToken.id) {
            throw new Error('User ID tidak ditemukan dalam token');
          }
  
          setUserId(decodedToken.id);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    getUserIdFromToken();
  }, []);
  
  useEffect(() => {
    const fetchUserData = async () => {
      let token;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
      
      if (!token) {
        setErrorUser('Token tidak ditemukan');
        setLoadingUser(false);
        return;
      }

      try {
        setLoadingUser(true);
        const response = await fetch(`http://${URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data) {
          setUserData(data);
        } else {
          throw new Error('Data pengguna tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorUser('Gagal mengambil data pengguna');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(`http://${URL}/author/get-author`);
        if (Array.isArray(response.data.data)) {
          const fetchedAuthors = response.data.data.map((author) => ({
            ...author,
            dokumenKelengkapan: "--",
            status: author.isApproved ? 'Disetujui' : 'Tidak Disetujui',
          }));
          setAuthors(fetchedAuthors);
          setData(fetchedAuthors);
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

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

  const filteredData = () => {
    let result = data;
  
    if (filter === "belumVerifikasi") {
      result = result.filter((item) => item.status === 'Tidak Disetujui');
    } else if (filter === "sudahVerifikasi") {
      result = result.filter((item) => item.status === 'Disetujui');
    }
  
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery) ||
          item.email.toLowerCase().includes(searchQuery)
      );
    }
  
    return result;
  };

  const handleUpdateVerifikasi = async (id, newVerifikasiStatus) => {
    const updatedData = data.map(item => {
      if (item.id === id) {
        return { ...item, isApproved: newVerifikasiStatus === "Yes", status: newVerifikasiStatus === "Yes" ? 'Disetujui' : 'Tidak Disetujui' };
      }
      return item;
    });
    setData(updatedData);

    try {
      const response = await axios.patch(`http://${URL}/author/edit-author/${id}/status`, {
        id: id,
        isApproved: newVerifikasiStatus === "Yes",
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

  const handleLogout = async () => {
    try {
        const response = await fetch(`http://${URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const gridData = useMemo(() => {
    return filteredData().map(item => ({
      tanggal: new Date(item.createdAt).toLocaleDateString(),
      id: item.id,
      nama: item.name,
      email: item.email,
      verifikasi: item.isApproved ? "Yes" : "No",
      status: item.status
    }));
  }, [data, filter, searchQuery]);
  
  const gridColumns = useMemo(() => [
    { id: 'tanggal', name: 'Tanggal' },
    { id: 'id', name: 'ID' },
    { id: 'nama', name: 'Nama' },
    { id: 'email', name: 'Email' },
    { 
      id: 'verifikasi',
      name: 'Verifikasi', 
      formatter: (cell, row) => {
        return (
          <select
            defaultValue={cell}
            onChange={(e) => handleUpdateVerifikasi(row.cells[1].data, e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      }
    },
    { 
      id: 'status',
      name: 'Status', 
      formatter: (cell) => {
        const className = cell === 'Tidak Disetujui' ? 'bg-[#CF0000] text-white' : 
                          cell === 'Disetujui' ? 'bg-[#228804] text-white' : '';
        return (
          <span className={`inline-block w-[151px] px-2 py-1 rounded-full ${className}`}>
            {cell}
          </span>
        );
      }
    }
  ], []);
      
  return (
    <>
      <div className="flex h-screen ">
        <div className="flex h-screen">
          <div className="w-[131px] lg:w-[350px] bg-[#78AED6] p-4 flex flex-col items-center">
            <div className="mb-5 flex items-center justify-center w-full">
              <img src="/images/etamtest.png" alt="Etam Test Logo" className="object-contain lg:h-[50px]" />
            </div>
            <div className="mb-5 flex items-center">
              <div className="relative inline-block">
                {userData?.userPhoto ? (
                  <img
                    src={userData.userPhoto}
                    alt="User Profile"
                    className="h-14 w-14 rounded-full cursor-pointer mr-5 object-cover"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  />
                ) : (
                  <IoPersonCircle
                    className="h-14 w-14 rounded-full cursor-pointer text-white mr-5"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  />
                )}

                {isDropdownOpen && (
                  <div
                    className="absolute right-2 mt-0 w-37 bg-white rounded-lg shadow-lg z-10 p-1 
                    before:content-[''] before:absolute before:-top-4 before:right-8 before:border-8
                    before:border-transparent before:border-b-white"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link legacyBehavior href={`/admin/edit-profile/${userId}`}>
                      <a className="block px-4 py-1 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md border-abumuda">
                        Ubah Profil
                      </a>
                    </Link>
                    <Link legacyBehavior href="/auth/login-admin">
                      <a
                        onClick={handleLogout}
                        className="block px-4 py-1 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md"
                      >
                        Logout
                      </a>
                    </Link>
                  </div>
                )}

              </div>
              <div className="ml-3 text-white">
                <h3 className="font-poppins font-bold text-basic text-white text-[10px] lg:text-[24px] ">{userData?.name}</h3>
                <p className="text-[18px] font-poppins m-0">Administrator</p>
              </div>
            </div>
            <div className="justify-start w-full ">
              <Link href="/admin/dashboard"> 
                <button className="block font-poppins font-bold w-full py-2 px-2 bg-deepBlue bg-opacity-50  hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">
                  Home
                </button>
              </Link>
              <Link href="/admin/kelola-author"> 
                <button className="block font-poppins font-bold w-full py-2 px-2 hover:bg-deepBlue text-white rounded-full text-sm lg:text-lg text-left">
                  Kelola Author
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <nav className="bg-[#0B61AA] p-4 flex justify-center items-center">
            <div className="flex items-center pr-5">
              <span className="text-white text-[32px] font-poppins font-semibold mr-3">Verifikasi Author</span>
            </div>
          </nav>

          <div className="flex items-center px-8 py-5 bg-white gap-4 justify-between">
            <div className="flex justify-end items-center w-2/3 max-w-lg bg-white px-4 py-2 rounded-full shadow">
              <FaSearch className="h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 border-none outline-none ml-4 text-lg"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex gap-4 items-center font-poppins">
              <button
                onClick={() => setFilter("semua")}
                className={`flex items-center justify-between w-[130px] px-4 py-2 text-black rounded-full ${filter === "semua" ? "bg-paleBlue" : "bg-abumuda"}`}
              >
                <span>Semua</span> 
                <span className="text-red-600 font-semibold">{total}</span>
              </button>

              <button
                onClick={() => setFilter("belumVerifikasi")}
                className={`flex items-center w-auto px-4 py-2 text-black rounded-full ${filter === "belumVerifikasi" ? "bg-paleBlue" : "bg-abumuda"}`}
              > 
              <div className="flex gap-4 justify-between items-center ">
                  <span>Belum Verifikasi</span>
                  <span>  </span>
                  <span className="text-red-600 font-semibold">{belumVerifikasi}</span>
                </div>
              </button>
              <button
                onClick={() => setFilter("sudahVerifikasi")}
                className={`flex items-center px-4 py-2 text-black rounded-full ${filter === "sudahVerifikasi" ? "bg-paleBlue" : "bg-abumuda"}`}
              >
                <div className="flex gap-4 justify-between items-center ">
                  <span>Sudah Verifikasi </span>
                  <span className="text-red-600 font-semibold "> {sudahVerifikasi}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="px-8 py-5 overflow-x-auto">
            <GridWrapper
              data={gridData}
              columns={gridColumns}
              search={true}
              pagination={{
                limit: 10
              }}
              className={{
                table: 'min-w-full border-collapse bg-white shadow-lg',
                th: 'border p-2 sm:p-3 bg-powderBlue text-white',
                td: 'border p-2 sm:p-3 text-center'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifikasiAuthor2;