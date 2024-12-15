'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { AiOutlineUser } from "react-icons/ai";
import { IoPersonCircle } from "react-icons/io5";
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const TopScore = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const params = useParams();
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testTitle, setTestTitle] = useState('');
    const [loadingTitle, setLoadingTitle] = useState(true);
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            if (!params.testId) return;

            try {
                setLoading(true);
                const response = await axios.get(`https://${URL}/api/leaderboard/${params.testId}`);
                if (response.data && response.data.data) {
                    setScores(response.data.data);
                } else {
                    throw new Error('Data tidak sesuai format yang diharapkan');
                }
            } catch (error) {
                console.error('Error fetching top scores:', error);
                setError('Gagal mengambil data top score');
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [params.testId]);

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
        const fetchTestTitle = async () => {
            if (!params.testId) return;
    
            setLoadingTitle(true);
            try {
                const response = await axios.get(`https://${URL}/test/get-test/${params.testId}`);
                if (response.status === 200 && response.data && response.data.data && response.data.data.title) {
                    setTestTitle(response.data.data.title);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching test title:', error);
                setTestTitle('Untitled Test'); // Fallback title
            } finally {
                setLoadingTitle(false);
            }
        };
    
        fetchTestTitle();
    }, [params.testId]);

    const handleHome = () => {
        // Redirect ke halaman dashboard
        router.push('/user/dashboard');
    };
      


    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans">
            {/* Header */}
            <header className="relative flex w-full bg-deepBlue text-white p-3 items-center z-50">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center p-2 lg:ml-9">
            <Link href="/">
              <img 
                src="/images/etamtest.png" 
                alt="EtamTest" 
                className="lg:h-14 h-8 mr-3 object-contain" 
              />
            </Link> 
          </div>

          <div className="relative flex  items-center">
            <div className="mx-auto">
              <h5 className="text-xl lg:text-3xl font-bold font-bodoni lg:mr-8">Top Score</h5>
              <nav className="mt-0 lg:mt-1">
                <ol className="list-reset flex space-x-2">
                  <li>
                  <Link href="/user/dashboard" legacyBehavior>
                      <a onClick={handleHome} className="text-[0.6rem] lg:text-sm hover:text-orange font-poppins font-bold">Home</a>
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link href={`/user/topscore/${params.testId}`} legacyBehavior>
                      <a className="text-[0.6rem] lg:text-sm hover:text-orange font-poppins font-bold">Top Score</a>
                    </Link>
                  </li>
                </ol>
              </nav>
            </div>
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
                  className="absolute right-0 mt-1 w-35 bg-white rounded-lg shadow-lg z-10 p-1
                              before:content-[''] before:absolute before:-top-4 before:right-8 before:border-8 
                              before:border-transparent before:border-b-white"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link legacyBehavior href="/profile-edit">
                    <a className="block px-4 py-1 text-deepBlue text-sm  hover:bg-deepBlue hover:text-white rounded-md border-abumuda">
                      Ubah Profil
                    </a>
                  </Link>
                  <Link legacyBehavior href="/logout">
                    <a className="block px-4 py-1 text-deepBlue text-sm  hover:bg-deepBlue hover:text-white rounded-md">
                      Logout
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto mt-6 px-4 sm:px-0">
                {/* Top Score Section */}
                <div className="flex items-center justify-center" style={{ maxWidth: '1018px', height: '160px', margin: '0 auto' }}>
                    <div className="bg-[#F3F3F3] p-6 rounded-[30px] shadow-md w-full flex flex-col items-center justify-center">
                        <div className="text-center">
                            <p className="text-2xl text-[#0B61AA] font-bold mb-2 font-poppins">Top Score</p>
                            <p className="text-xl text-[#0B61AA] mb-2 font-poppins">{testTitle}</p>
                            
                        </div>
                    </div>
                </div>

                {/* Kontainer untuk scrollbar */}
                <div className="overflow-x-auto" style={{ maxHeight: '350px' }}>

                    {/* Scores Table Section */}
                    <div className="mt-6">
                            <div className="max-w-full p-6 rounded-lg shadow-md bg-[#F3F3F3]">
                            <table className="min-w-full text-left table-auto border-collapse">
                                <thead className="bg-[#CAE6F9] text-black">
                                    <tr>
                                        <th className="px-2 py-2 text-center sticky top-0 bg-[#CAE6F9] font-poppins">Rangking</th>
                                        <th className="px-2 py-2 text-center sticky top-0 bg-[#CAE6F9] font-poppins">Nama</th>
                                        <th className="px-2 py-2 text-center sticky top-0 bg-[#CAE6F9] font-poppins">Nilai Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 font-poppins">Loading...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 font-poppins text-red-500">{error}</td>
                                        </tr>
                                    ) : scores.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 font-poppins">Tidak ada data</td>
                                        </tr>
                                    ) : (
                                        scores.map((score, index) => (
                                            <tr key={index} className={`border ${index === 0 ? 'rounded-t-[30px]' : ''} ${index === scores.length - 1 ? 'rounded-b-[30px]' : ''}`}>
                                                <td className={`border px-2 py-2 text-center ${index % 2 === 0 ? 'bg-[#C5CBCA]-100' : 'bg-white'} rounded-tl-[30px] ${index === 0 ? 'rounded-tl-[30px]' : ''} ${index === scores.length - 1 ? 'rounded-bl-[30px]' : ''} font-poppins`}>
                                                    {score.ranking}
                                                </td>
                                                <td className={`border px-2 py-2 text-left ${index % 2 === 0 ? 'bg-[#C5CBCA]-100' : 'bg-white'} font-poppins`}>
                                                    {score.name}
                                                </td>
                                                <td className={`border px-2 py-2 text-center rounded-tr-[30px] rounded-br-[30px] ${index % 2 === 0 ? 'bg-[#C5CBCA]-100' : 'bg-white'} ${index === 0 ? 'rounded-tr-[30px]' : ''} ${index === scores.length - 1 ? 'rounded-br-[30px]' : ''} font-poppins`}>
                                                    {score.score}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TopScore;
