'use client';

import React from 'react';
import  { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {IoPersonCircle} from "react-icons/io5";
import {LuFileSpreadsheet} from "react-icons/lu";
import {LuTimer} from "react-icons/lu";
import { IoMdArrowRoundBack } from "react-icons/io";
import Swal from 'sweetalert2';

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const DetailSoal = () => {
  const [loading, setLoading] = useState([true]);
  const [error, setError] = useState([null]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [testData, setTestData] = useState([]);
  const { testId } = useParams(); 
  const router = useRouter();
  const menus = [
    {href:'/', text: "Home"},
    {href:'/fav', text: "Favorit"},
    {href:'/transaksi', text: "Transaksi"},
  ]
  const [userProfile, setUserProfile] = useState(null);

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
          setUserProfile(data);
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
  if (!testId) return; // Jangan jalankan jika testId belum ada

  const fetchTestData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token tidak ditemukan');
      return;
    }

    try {
      const response = await fetch(`https://${URL}/tes/${testId}/detail`, { // Ganti URL dengan endpoint yang benar
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data soal');
      }

      const data = await response.json();
      setTestData(data); // Set data hasil fetch ke state testData
    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Gagal mengambil data soal');
    }
  };

  fetchTestData();
}, [testId]);

const handleStartTryOut = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Token tidak ditemukan. Silakan login terlebih dahulu.');
    return;
  }

  // Cek apakah testData sudah di-set
  if (!testData || Object.keys(testData).length === 0) {
    alert('Data tes belum tersedia. Silakan tunggu sebentar.');
    return;
  }

  // Cek harga test dengan mengonversi ke number
  const testPrice = parseFloat(testData.price); // Mengonversi price dari string ke number
  if (testPrice === 0) {
    // Jika harga 0, arahkan langsung ke halaman mengerjakan tes
    router.push(`/tes/mengerjakan-tes/${testId}`);
    return;
  }

  try {
    const response = await fetch(`https://${URL}/api/transaction/check-status?testId=${testId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text(); // Ambil pesan error dari response
      console.error('Response status:', response.status); // Tampilkan status response
      throw new Error(`Gagal memeriksa status transaksi: ${errorMessage}`);
    }

    const data = await response.json();

      // Tangani redirect berdasarkan status yang diterima
      switch (data.status) {
        case 'PAID':
          router.push(`/tes/mengerjakan-tes/${testId}`);
          break;
          case 'PENDING':
            Swal.fire({
              icon: 'info',
              title: 'Menunggu Pembayaran',
              text: 'Harap selesaikan pembayaran untuk melanjutkan.',
              confirmButtonText: 'OK',
            }).then(() => {
              router.push(`/tes/kuis-terkunci-pending/${testId}`);
            });
            break;
        case 'FAILED':
            Swal.fire({
              icon: 'error',
              title: 'Pembayaran Gagal',
              text: 'Pembayaran Anda tidak berhasil. Silakan coba lagi.',
              confirmButtonText: 'Coba Lagi',
              customClass: {
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded',
              },
            }).then(() => {
              router.push(`/tes/kuis-terkunci-akses/${testId}`);
            });
          break;
        case 'EXPIRED':
          Swal.fire({
            icon: 'error',
            title: 'Transaksi Kedaluwarsa',
            text: 'Transaksi telah kedaluwarsa. Silakan coba lagi.',
            confirmButtonText: 'OK',
          }).then(() => {
            router.push(`/tes/kuis-terkunci-akses/${testId}`);
          });
          break;
      
          case 'NOT_FOUND':
            Swal.fire({
              title: 'Akses Tidak Ditemukan',
              text: 'Anda perlu mendapatkan akses untuk mengikuti tes ini.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Dapatkan Akses',
              cancelButtonText: 'Batal',
              customClass: {
                confirmButton:
                  'bg-deepBlue hover:bg-paleBlue hover:text-deepBlue hover:border text-white font-bold py-2 px-4 rounded',
                cancelButton:
                  'bg-red-500 hover:bg-red-800 text-white font-bold py-2 px-4 rounded',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                router.push(`/tes/kuis-terkunci-akses/${testId}`);
              }
            });
            break;
          break;
      
        default:
          alert('Status transaksi tidak dikenal.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      alert('Terjadi kesalahan saat memeriksa status transaksi.');
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
  

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center">
        <header className="relative flex w-full bg-deepBlue text-white p-3 items-center z-50">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center p-2 lg:ml-9">
                
                    <Link href="/user/dashboard">
                      <IoMdArrowRoundBack className='lg:hidden text-white text-2xl ' />
                    </Link> 
        
                    <Link href="/">
                        <img 
                        src="/images/etamtest.png" 
                        alt="EtamTest" 
                        className="lg:h-14 h-8 ml-5 md:ml-8 object-contain" 
                        />
                    </Link> 
            
                </div>

                <div className="relative flex inline-block items-center ">
                  <div className="mx-auto">
                      {/* Judul besar */}
                      <h5 className="hidden lg:block md:text-sm lg:text-3xl font-bold font-bodoni lg:mr-8">Detail Soal</h5>
                          {/* Breadcrumb di bawah h5 */}
                          <nav className="hidden lg:block mt-2">
                              <ol className="list-reset flex space-x-2 ">
                              <li>
                                  <Link href="/user/dashboard" legacyBehavior>
                                  <a className="hover:text-orange font-poppins font-bold">Home</a>
                                  </Link>
                              </li>
                              <li>/</li>
                              <li>
                                  <Link href="" legacyBehavior>
                                  <a className="hover:text-orange font-poppins font-bold">Detail Soal</a>
                                  </Link>
                              </li>
                              </ol>
                          </nav>
                  </div>
                  {/* Profile */}
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

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute right-2 mt-0 w-37 bg-white rounded-lg shadow-lg z-10 p-1 
                        before:content-[''] before:absolute before:-top-4 before:right-8 before:border-8
                        before:border-transparent before:border-b-white"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <Link legacyBehavior href={`/user/edit-profile/${userId}`}>
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

            </div>
        </header>
      
        <div className="bg-white w-full max-w-2xl mt-8 rounded-lg shadow-md p-6 font-poppins ">
          <div className="bg-gray-100 p-4 rounded-md mt-4 text-gray-600">
              <h2 className="text-center text-2xl font-semibold text-deepBlue">Detail Soal</h2>
              <p className="text-center text-sm font-bold text-deepBlue mt-2">{testData.title}</p>
              <p className="text-center text-sm text-gray-500 mt-2">
                  <LuTimer className="inline mr-1 text-lg relative -top-0.5" /> {testData.duration} menit
              </p>
          </div>

          <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-100  w-full max-w-2xl font-bold p-4 rounded-md mt-4 text-gray-600">
                  <p className="border border-gray-500 text-[0.8rem] rounded-md p-4 text-justify text-gray-500 font-bold">
                  {testData.description}
                  </p>
                  <div className="mt-6 space-y-4 text-[1.0rem]  font-poppins text-gray-500 ">
                    {/* Periksa apakah groupedQuestions ada */}
                    {testData.groupedQuestions ? (
                      Object.entries(testData.groupedQuestions).map(([subtestName, subtest]) => (
                        <div key={subtestName} className="flex justify-between">
                          <span>{subtestName}</span>
                          <span className="flex items-center">
                                <LuFileSpreadsheet alt="Paper Icon" className="w-4 h-4 mr-2 relative -top-0.5" />
                                <span className="mr-2">{subtest.count} soal</span>
                              </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-500">Tidak ada pertanyaan tersedia.</p> // Pesan jika groupedQuestions tidak ada
                    )}
                  </div>
              </div>
              <button className="bg-deepBlue text-white text-sm mt-6 py-3 px-4 rounded-full font-poppins" onClick={handleStartTryOut}>
                Mulai Try Out Sekarang
              </button>

          </div>
        </div>

    </div>
  );
};

export default DetailSoal;