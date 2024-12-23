'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { IoPersonCircle } from "react-icons/io5";
import { SlBookOpen } from "react-icons/sl";
import Link from 'next/link';

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

function TestPayment() {
  const { testId } = useParams();
  const [userId, setUserId] = useState(null);
  const [testTitle, setTestTitle] = useState('');
  const [testSimilarity, setTestSimilarity] = useState(null);
  const [testPrice, setTestPrice] = useState(null);
  const [testCategory, setTestCategory] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);

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
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"
    const clientKey = process.env.PUBLIC_CLIENT_KEY
    const script = document.createElement('script')
    script.src = snapScript
    script.setAttribute('data-client-key', clientKey)
    script.async = true

    document.body.appendChild(script)

     // Decode token to get userId
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
    }

    return () => {
      document.body.removeChild(script)
    }
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
    const fetchTestDetail = async () => {
      try {
        const response = await fetch(`https://${URL}/api/tests/get-test/${testId}`);
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`)
        }
        const data = await response.json();
        console.log('Data fetched:', data);
        setTestCategory(data.data.category);
        setTestTitle(data.data.title);
        setTestSimilarity(data.data.similarity);
        setTestPrice(data.data.price);
      } catch (error) {
        console.error('Failed to fetch test details:', error);
        setError('Terjadi kesalahan: ' + error.message);
      }
    };
      fetchTestDetail(); // Memanggil API ketika testId ada
  }, [testId]);

  const handlePayment = async () => {
    if (testId) {
      try {
        const token = localStorage.getItem('token'); // Ambil token dari localStorage
        
        // Ambil token dari backend
        const response = await fetch(`https://${URL}/api/payment/payment-process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Tambahkan token ke header
          },
          body: JSON.stringify({ testId }), 
        });
  
        const data = await response.json();
  
        // Cek apakah token berhasil didapatkan
        if (response.ok && data.token) {
          // Menampilkan Midtrans Snap
          window.snap.pay(data.token, {
            onSuccess: function (result) {
              console.log('Payment success:', result);
            },
            onPending: function (result) {
              console.log('Payment pending:', result);
            },
            onError: function (result) {
              console.log('Payment error:', result);
            },
            onClose: function () {
              console.log('Payment dialog closed');
            },
          });
        } else {
          console.error('Failed to get payment token:', data.error);
        }
      } catch (error) {
        console.error('Error during payment:', error);
      }
    } else {
      console.error('Test ID not found');
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

// Navbar Component (diganti dari kode awal Anda)
const Navbar = ({testCategory}) => {
  return (
    <nav className="w-full bg-[#0B61AA] py-4 px-8 flex justify-between items-center">
      {/* Logo EtamTest di kiri */}
      <div className="flex items-center">
        <img
          src="/images/etamtest.png"
          alt="EtamTest"
          className="h-8"
        />
      </div>

      <div className="relative flex  items-center text-white">
          <div className="mx-auto">
              {/* Judul besar */}
              <h5 className="text-sm lg:text-3xl font-bold font-poppins lg:mr-8  text-white mr-5 ">Membeli Paket</h5>
                  {/* Breadcrumb di bawah h5 */}
                  <nav className="hidden lg:block mt-2 mr-5">
                      <ol className="list-reset flex space-x-2 ">
                      <li>
                          <Link href="/user/dashboard" legacyBehavior>
                          <a className="hover:text-orange font-poppins font-bold  text-white">Home</a>
                          </Link>
                      </li>
                      <li>/</li>
                      <li>
                      <Link href={`/tes/category/${testCategory?.toLowerCase()}`} className="hover:text-orange font-poppins font-bold text-white">
                        Try Out {testCategory}
                      </Link>
                      </li>
                      <li>/</li>
                      <li>
                      <Link href={`/tes/payment/${testId}`} className="hover:text-orange font-poppins font-bold">
                        Membeli Paket
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
                    className="h-14 w-14 rounded-full cursor-pointer object-cover"
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
                      <a className="block px-4 py-1 text-deepBlue text-sm hover:bg-deepBlue hover:text-white rounded-md border-abumuda">
                        Ubah Profil
                      </a>
                    </Link>
                    <Link legacyBehavior href="/auth/login">
                      <a
                        onClick={handleLogout}
                        className="block px-4 py-1 text-deepBlue text-sm hover:bg-deepBlue hover:text-white rounded-md"
                      >
                        Logout
                      </a>
                    </Link>
                  </div>
                )}
            </div>

        </div>

    </nav>
  );
};



// Box Content Component
const PaymentBox = ({ testTitle, testPrice, testSimilarity }) => {
  return (
    <div className="flex justify-center items-center flex-1">
      <div className="bg-[#F3F3F3] shadow-lg rounded-lg p-8 w-5/6 max-w-md text-center relative ">
        {/* Logo Buku */}
        <SlBookOpen className="text-[#0B61AA] h-[108px] w-[120px] mx-auto mb-4" />

        {/* Header */}
        <h1 className="text-[#0B61AA] text-2xl font-bold mb-2">{testTitle}</h1>

        {/* Sub-header */}
        <h2 className="text-sm text-[#0B61AA] mb-4">Prediksi kemiripan {testSimilarity}%</h2>

        {/* Bullet List */}
        <ul className="list-disc list-inside text-justify text-black space-y-2 mb-6 text-sm tablet:text-base">
          <li>Memiliki 1x kesempatan mengerjakan soal</li>
          <li>Mendapatkan hasil Try Out secara langsung</li>
          <li>Mengetahui jawaban salah dan benar</li>
          <li>Mendapatkan penjelasan soal dalam bentuk pdf</li>
        </ul>

        {/* Harga */}
        <div className="text-right text-2xl font-bold text-gray-800 mb-8">Rp.{testPrice},-</div>

        {/* Button Beli */}
        <button className="absolute bottom-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        onClick={handlePayment}>
          Beli
        </button>
      </div>
    </div>
  );
};

if (loading) {
  return <LoadingAnimation />;
}


  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar 
      testCategory={testCategory}
      />

      {/* Content Box */}
      <div className="flex justify-center items-center flex-1">
        <PaymentBox 
        testTitle={testTitle}
        testPrice={testPrice}
        testSimilarity={testSimilarity}
        />
      </div>
    </div>
  );

}
export default  TestPayment;