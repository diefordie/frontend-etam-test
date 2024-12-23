'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {IoPersonCircle} from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import {SlBookOpen} from "react-icons/sl";
import {CiLock} from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import jwtDecode from 'jwt-decode';

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState (['']);
  const [loading, setLoading] = useState([true]);
  const [error, setError] = useState([null]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [authorTests, setAuthorTests] = useState([]);
  const [authorData, setAuthorData] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [totalPublish, setTotalPublish] = useState(0);
  const [totalDraft, setTotalDraft] = useState(0);
  const [token, setToken] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const publishTests = authorTests.filter(test => test.isPublished === true);
  const draftTests = authorTests.filter(test => test.isPublished === false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const LoadingAnimation = () => (
    <div className="flex items-center justify-center h-screen bg-white duration-300">
      <div className="relative">
        {/* Roket */}
        <img
          src="/images/rocket.png"
          alt="Rocket Loading"
          className="w-20 md:w-40 lg:w-55 animate-rocket"
        />
        {/* Tulisan */}
        <p className="text-center text-deepBlue mt-2 text-lg font-bold">
          Loading...
        </p>
      </div>
    </div>
  );


  useEffect(() => {
    const getUserIdFromToken = () => {
      try {
        setLoading(true);
        // Pastikan kode ini hanya dijalankan di sisi klien
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
        // Redirect ke halaman login jika token tidak valid
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
        const response = await fetch(`https://${URL}/user/profile`, {
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
        if (error.message === 'Failed to fetch user data') {
          // Token mungkin tidak valid atau kadaluarsa
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          router.push('/login');
        }
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
    const fetchAuthorTests = async () => {
      try {
        setLoading(true);
        // Ambil token dari localStorage atau dari state management Anda
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`https://${URL}/api/tests/author-tests`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAuthorTests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch author tests');
        setLoading(false);
        console.error('Error fetching author tests:', err);
      }
    };
  
    fetchAuthorTests();
  }, []);

  useEffect(() => {
    console.log('Author Tests:', authorTests);
    const publishCount = authorTests.filter(test => test.isPublished === true).length;
    const draftCount = authorTests.filter(test => test.isPublished === false).length;
  
    setTotalPublish(publishCount);
    setTotalDraft(draftCount);
  }, [authorTests]);

  useEffect(() => {
    const filtered = authorTests.filter(test => 
      (selectedKategori === '' || test.kategori === selectedKategori) &&
      (test.judul.includes(searchTerm) || test.kategori.includes(searchTerm))
    );
    setFilteredTests(filtered);
  }, [selectedKategori, searchTerm, authorTests]);  

  const filterTests = () => {
    let filtered = authorTests;
    
    if (selectedKategori !== 'Semua Kategori') {
      filtered = filtered.filter(test => test.kategori === selectedKategori);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.kategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTests(filtered);
  };


  // Fungsi untuk menangani perubahan dropdown
  const handleKategoriChange = (e) => {
    setSelectedKategori(e.target.value);
  };

  const handleSearch = async (e) => {
    
    e.preventDefault();
    if (!searchQuery) return;
  
    try {
      const response = await fetch(`https://${URL}/dashboard/search-tests?title=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search tests');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching tests:', error);
      setError(error.message);
    }
  };


  // Pindahkan semua state ke dalam komponen
  const [populercurrentIndex, populersetCurrentIndex] = useState(0);
  const [populeritemsToShow, setPopulerItemsToShow] = useState(2);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setPopulerItemsToShow(4); // Tampilkan 4 item di desktop
      } else {
        setPopulerItemsToShow(2); // Tampilkan 2 item di mobile
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  const populernextSlide = () => {
    if (populercurrentIndex < authorTests.length - populeritemsToShow) {
      populersetCurrentIndex(populercurrentIndex + 1);
    }
  };

  const populerprevSlide = () => {
    if (populercurrentIndex > 0) {
      populersetCurrentIndex(populercurrentIndex - 1);
    }
  };

  const [gratiscurrentIndex, gratissetCurrentIndex] = useState(0);
  const [gratisitemsToShow, setGratisItemsToShow] = useState(2);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setGratisItemsToShow(4);
      } else {
        setGratisItemsToShow(2);
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  const gratisnextSlide = () => {
    if (gratiscurrentIndex < authorTests.length - gratisitemsToShow) {
      gratissetCurrentIndex(gratiscurrentIndex + 1);
    }
  };

  const gratisprevSlide = () => {
    if (gratiscurrentIndex > 0) {
      gratissetCurrentIndex(gratiscurrentIndex - 1);
    }
  };

  const [filteredResults, setFilteredResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(2);

  // Mengatur jumlah item yang ingin ditampilkan berdasarkan ukuran layar
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setItemsToShow(4); // Tampilkan 4 item di desktop
      } else {
        setItemsToShow(2); // Tampilkan 2 item di mobile
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  // Filter artikel berdasarkan kata kunci pencarian
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]); // Tidak ada hasil pencarian jika input kosong
    } else {
      const results = authorTests.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) // Filter berdasarkan kata kunci
      );
      setFilteredResults(results); // Update state dengan hasil pencarian
    }
  }, [searchTerm, authorTests]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogout = async () => {
    try {
        const response = await fetch(`https://${URL}/auth/logout`, {
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

        window.location.href = '/auth/login';
    } catch (error) {
        console.error('Error during logout:', error);
    }
  };
  
  const uniqueKategori = ['Semua Kategori', ...new Set(authorTests.map(test => test.kategori))];

  if (loading) {
    return <LoadingAnimation />;
  }
 

  return (
    <>
      <div className="flex flex-col h-screen font-poppins">
        <header className="flex flex-wrap justify-between lg:justify-end items-center bg-[#0B61AA] p-4 z-40">
            {/* Sidebar Toggle Button for mobile */}
            <button
              className="lg:hidden text-white text-2xl"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <IoMenu />
            </button>

            {/* User Info and Profile */}
            <div className="flex items-center justify-between lg:justify-end">
              <span className="text-xl text-white font-poppins font-bold mr-3 lg:mr-5">
                Hai, {userData?.name}
              </span>

              {/* Profile Picture */}
              <div className="relative inline-block">
                {userData?.userPhoto ? (
                  <img
                    src={userData.userPhoto}
                    alt="User Profile"
                    className="h-14 w-14 rounded-full cursor-pointer object-cover"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  />
                ) : (
                  <IoPersonCircle
                    className="h-14 w-14 rounded-full cursor-pointer text-white"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  />
                )}

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-2 mt-0 w-37 bg-white rounded-lg shadow-lg z-10 p-1
                    before:content-[''] before:absolute before:-top-4 before:right-8 before:border-8
                    before:border-transparent before:border-b-white"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link legacyBehavior href={`/author/edit-profile`}>
                      <a className="block px-4 py-1 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md border-abumuda">
                        Ubah Profil
                      </a>
                    </Link>
                    <Link legacyBehavior href="/auth/login">
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
            </div>
          </header>
          
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside
              className={`fixed top-0 left-0 h-full w-64 bg-[#78AED6] p-5 z-50 transform transition-transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0`}
            >
              {/* Tombol untuk menutup sidebar di mobile */}
              <button
                className="absolute top-4 left-4 text-white text-2xl lg:hidden"
                onClick={() => setIsSidebarOpen(false)} // Menutup sidebar
              >
                ✕
              </button>

              {/* Logo yang tetap ada di sidebar */}
              <div className="lg:block text-white mb-5 mt-8 lg:mt-2">
                <img src="/images/etamtest.png" alt="Logo" className="h-auto w-36" />
              </div>

              <nav>
                <ul className="space-y-3 mt-7">
                  <li className="text-white cursor-pointer py-2 px-4 hover:bg-deepBlue rounded-lg bg-opacity-50 rounded-lg py-2 px-4 min-w-[200px]">
                    <Link legacyBehavior href="/author/dashboard">
                      <a>Home</a>
                    </Link>
                  </li>
                  <li className="text-white cursor-pointer bg-[#0B61AA] hover:bg-deepBlue bg-opacity-50 rounded-lg py-2 px-4 min-w-[200px]">
                    <Link legacyBehavior href="/author/analisis-soal">
                      <a>Analisis Soal</a>
                    </Link>
                  </li>
                  <li className="text-white cursor-pointer py-2 px-4 hover:bg-deepBlue rounded-lg bg-opacity-50 rounded-lg py-2 px-4 min-w-[200px]">
                    <Link legacyBehavior href="/author/my-saldo">
                      <a>My Saldo</a>
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
           {/* Overlay untuk menutup sidebar ketika klik di luar */}
           {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)} // Menutup sidebar
            />
            )}
          {/* Main Content */}
          <main className="flex-1 bg-white overflow-y-auto lg:ml-64 transition-all duration-300">
            {/* Search Bar */}
            <div className="bg-gradient-to-r from-[#CAE6F9] to-[#0B61AA] p-12">
              <div className="container justify-between mt-10 lg:mt-4 lg:max-w-[610px] max-w-full">
                <form className="flex items-center p-1 rounded-2xl bg-white w-full font-poppins" onSubmit={handleSearch}>
                  {/* Input field */}
                  <input
                    type="text"
                    placeholder="Cari Tes Soal"
                    className="flex-grow p-1 lg:p-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-powderBlue font-poppins max-w-full"
                    value={searchTerm}
                    onChange={handleSearchChange} // Menggunakan handleSearchChange di sini
                  />
                  {/* Search button - Hapus karena tidak lagi dibutuhkan */}
                  <button 
                    type="submit" 
                    className="p-1 lg:p-2 text-deepBlue font-bold rounded-2xl hover:bg-gray-200 font-poppins "
                  >
                  <IoSearch className="h-5 w-5 text-gray-600" />
                  </button>
                </form>
              </div>
            </div>

            {/* Informasi Total Soal dan Peserta */}
            <div className="flex flex-wrap items-center pr-4 gap-5 mt-4 ml-3 justify-between">
              <div className="flex gap-5 flex-wrap">
                <div className="px-3 py-1 text-deepBlue">
                  <span className="ml-2 font-semibold">
                    <span>Kategori:</span>
                    <select
                      className="ml-2 p-1 rounded-lg bg-abumuda text-deepBlue shadow-lg text-[#0B61AA]"
                      value={selectedKategori}
                      onChange={handleKategoriChange}
                    >
                      {uniqueKategori.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>
                <div className="bg-abumuda px-3 py-2 rounded-[15px] shadow-lg text-[#0B61AA]">
                  <span>Publish</span>
                  <span className="font-semibold ml-4">{totalPublish}</span>
                </div>
                <div className="bg-abumuda px-3 py-2 rounded-[15px] shadow-lg text-[#0B61AA]">
                  <span>Draft</span>
                  <span className="font-semibold ml-2">{totalDraft}</span>
                </div>
              </div>
              <Link href="/author/buattes">
                <button className="bg-[#0B61AA] text-white py-2 px-5 rounded-[10px] ml-auto">
                  + NEW
                </button>
              </Link>
            </div>

            {/* Bagian Paling Publish */}
            <section className="mx-auto p-5 font-poppins relative">
              <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
                Publish
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {publishTests.slice(populercurrentIndex, populercurrentIndex + populeritemsToShow).map((test) => (
                    <div
                      key={test.testId}
                      className="bg-abumuda shadow-lg relative group flex flex-col justify-between h-full"
                    >
                      {/* Overlay background abu-abu yang muncul saat hover */}
                      <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

                      {/* Bagian Atas */}
                      <div className="p-2 z-20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 font-bold text-deepBlue">
                            <FaEye />
                            <span className="text-[0.6rem] lg:text-sm font-poppins">{test.history}</span>
                          </div>
                        </div>

                        {/* Ikon Buku */}
                        <div className="flex justify-center mt-2 lg:mt-4">
                          <SlBookOpen className="text-4xl lg:text-[80px] object-contain" />
                        </div>

                        {/* Kategori */}
                        <div className="flex justify-center mt-2 lg:mt-4 text-deepBlue">
                          <h3 className="text-center text-[0.8rem] lg:text-lg font-bold font-poppins">
                            {test.kategori}
                          </h3>
                        </div>
                      </div>

                      {/* Bagian Biru */}
                      <div className="bg-deepBlue text-white p-2 mt-4 z-20 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-left text-[0.625rem] lg:text-base font-bold">{test.judul}</h3>
                          <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">
                            {test.prediksi_kemiripan}
                          </p>
                          <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>
                        </div>

                        {/* Penulis dan Harga */}
                      <div className="flex justify-between space-x-2 leading-relaxed mt-1">
                      <div className="flex text-left space-x-1 lg:space-x-4">
                        {test.authorProfile ? (
                          <img
                            src={test.authorProfile}
                            alt={test.kategori}
                            className="h-3 w-3 lg:h-6 lg:w-6 object-contain object-cover rounded-full"
                          />
                        ) : (
                          <IoPersonCircle className="h-3 lg:h-6 text-white" />
                        )}
                        <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author}</span>
                      </div>
                          <span className="text-[0.375rem] lg:text-sm font-semibold">
                            {Number(test.price) === 0 ? 'Gratis' : (
                              <IoIosLock className="h-4 inline-block text-white" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol panah kiri */}
                <button
                  onClick={populerprevSlide}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${populercurrentIndex === 0 ? 'hidden' : ''}`}
                >
                  &#10094;
                </button>

                {/* Tombol panah kanan */}
                <button
                  onClick={populernextSlide}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${populercurrentIndex >= authorTests.length - populeritemsToShow ? 'hidden' : ''}`}
                >
                  &#10095;
                </button>
              </div>
            </section>

            {/* Bagian Draft */}
            <section className="mx-auto p-5 font-poppins relative">
              <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
                Draft
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {draftTests.slice(gratiscurrentIndex, gratiscurrentIndex + gratisitemsToShow).map((test) => (
                    <div
                      key={test.testId}
                      className="bg-abumuda shadow-lg relative group flex flex-col justify-between h-full"
                    >
                      {/* Overlay background abu-abu yang muncul saat hover */}
                      <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

                      {/* Bagian Atas */}
                      <div className="p-2 z-20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 font-bold text-deepBlue">
                            <FaEye />
                            <span className="text-[0.6rem] lg:text-sm font-poppins">{test.history}</span>
                          </div>
                        </div>

                        {/* Ikon Buku */}
                        <div className="flex justify-center mt-2 lg:mt-4">
                          <SlBookOpen className="text-4xl lg:text-[80px] object-contain" />
                        </div>

                        {/* Kategori */}
                        <div className="flex justify-center mt-2 lg:mt-4 text-deepBlue">
                          <h3 className="text-center text-[0.8rem] lg:text-lg font-bold font-poppins">
                            {test.kategori}
                          </h3>
                        </div>
                      </div>

                      {/* Bagian Biru */}
                      <div className="bg-deepBlue text-white p-2 mt-4 z-20 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-left text-[0.625rem] lg:text-base font-bold">{test.judul}</h3>
                          <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">{test.prediksi_kemiripan}</p>
                          <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>
                        </div>

                        {/* Penulis dan Harga */}
                        <div className="flex justify-between space-x-2 leading-relaxed mt-1">
                      <div className="flex text-left space-x-1 lg:space-x-4">
                        {test.authorProfile ? (
                          <img
                            src={test.authorProfile}
                            alt={test.kategori}
                            className="h-3 w-3 lg:h-6 lg:w-6 object-contain object-cover rounded-full"
                          />
                        ) : (
                          <IoPersonCircle className="h-3 lg:h-6 text-white" />
                        )}
                        <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author}</span>
                      </div>
                          <span className="text-[0.375rem] lg:text-sm font-semibold">
                            {Number(test.price) === 0 ? 'Gratis' : (
                              <IoIosLock className="h-4 inline-block text-white" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol panah kiri */}
                <button
                  onClick={gratisprevSlide}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${gratiscurrentIndex === 0 ? 'hidden' : ''}`}
                >
                  &#10094;
                </button>

                {/* Tombol panah kanan */}
                <button
                  onClick={gratisnextSlide}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${gratiscurrentIndex >= authorTests.length - gratisitemsToShow ? 'hidden' : ''}`}
                >
                  &#10095;
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
