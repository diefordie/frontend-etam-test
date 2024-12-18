'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiEye} from 'react-icons/fi';
import { IoMenu } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;


export default function RiwayatTransaksiHeader() {
  const [activeTab, setActiveTab] = useState('Belum Bayar');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const { testId } = useParams();

  const menus = [
    { href: '/user/profile', text: "Ubah Profile", icon: <FaUserCircle className="inline-block mr-2" /> },
    { href: '/user/dashboard', text: "Home" },
    { href: '/user/favorite', text: "Favorit" },
    { href: '/user/riwayat-transaksi', text: "Transaksi" },
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); 
    if (!isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };


  // Ambil token dari localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Ambil data pengguna berdasarkan token
  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchTransactions();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`https://${URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData(userData); // Menyimpan data pengguna yang login
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!token) {
      console.error('Token tidak tersedia');
      return;
    }

    try {
      const response = await fetch(`https://${URL}/api/riwayat-transaksi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const formatStatus = (status) => {
    return status.replace(/\s*\(.*?\)\s*/g, '').trim();
  };

  const getDataByTab = () => {
    return transactions.filter((item) => {
      const itemStatus = item.customStatus || '';
      return itemStatus.includes(activeTab);
    });
  };

  return (
    <>
      {/* Sidebar untuk Tampilan Mobile */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white transition-transform transform lg:hidden z-40 font-bold ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ul className="p-4 space-y-4 text-deepblue">
          {/* Profile Icon at the top */}
          <li key="profile-icon" className="flex justify-center pt-16 mb-4"> {/* Increased padding-top */}
          <Link href="/user/profile" className="block p-2 hover:bg-gray-200 rounded flex items-center justify-center w-full">
          {
            userData?.userPhoto ? (
              <img
                src={userData?.userPhoto}
                alt="Foto Pengguna"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="h-16 w-16 text-gray-500" /> // Display the user icon when no photo is available
            )
          }
        </Link>
          </li>

          {/* Daftar menu lainnya */}
          {menus.map((menu, index) => (
            <li key={index} className="flex items-center justify-between">
              <Link href={menu.href} className="block p-2 hover:bg-gray-200 rounded flex items-center w-full">
                {menu.text}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Overlay Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
          onClick={toggleSidebar} // Klik overlay menutup sidebar
        ></div>
      )}

      {/* Overlay Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
          onClick={toggleSidebar} // Klik overlay menutup sidebar
        ></div>
      )}
      
      {/* Header Utama */}
      <header className="w-full sm:h-[115px] bg-[#0B61AA] text-white p-4 py-2 sm:py-8 relative z-50">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto justify-start">
          <button onClick={toggleSidebar} className="sm:hidden">
            <IoMenu className="h-8 w-8 text-white" /> {/* Gunakan IoMenu sebagai ikon */}
          </button>

            <Link href="/">
              <img
                src="/images/etamtest.png"
                alt="Etamtest"
                className="w-[85px] h-[25px] sm:w-[190px] sm:h-[43px]"
              />
            </Link>
          </div>

          <div className="hidden sm:flex flex-wrap justify-center sm:justify-end items-center space-x-4">
            <Link href="/user/dashboard" className="hover:text-gray-200 text-2xl">Home</Link>
            <Link href="/user/favorite" className="hover:text-gray-200 text-2xl">Favorit</Link>
            <Link href="/transaksi" className="text-black font-bold text-2xl">Transaksi</Link>
            <Link href="/faq" className="hover:text-gray-200 text-2xl">FAQ</Link>
            <Link href={userData ? `/user/edit-profile/${userData.userId}` : '#'}>
            {
              userData?.userPhoto ? (
                <img
                  src={userData?.userPhoto}
                  alt="Foto Pengguna"
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <FaUserCircle className="h-14 w-14 text-white" /> // Display the React icon if no photo is available
              )
            }
          </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed insert-0 z-40 flex">
          <div className="flex-1 bg-black opacity-50 z-30" onClick={toggleMenu}></div>
        </div>
      )}

      <nav className="w-full h-[51px] sm:h-[68px] bg-white shadow-md overflow-x-hidden">
        <div className="container mx-auto flex flex-nowrap justify-start space-x-2 py-2 sm:py-2">
          {['Belum Bayar', 'Berhasil (Belum Dikerjakan)', 'Selesai (Sudah Dikerjakan)', 'Tidak Berhasil'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg px-4 pb-2 text-xs sm:text-lg ${activeTab === tab ? 'text-[#0B61AA] border-b-4 border-[#0B61AA]' : 'text-gray-500'} hover:text-[#0B61AA]`}
            >
              {formatStatus(tab)}
            </button>
          ))}
        </div>
      </nav>

      <div className="container mx-auto p-4 space-y-4 overflow-y-auto h-screen">
  {getDataByTab().map((item) => (
    <div
      key={item.id}
      className="w-full bg-[#F3F3F3] shadow-md p-4 flex rounded-lg"
    >
      <div className="bg-white relative w-[112px] h-[140px] sm:w-[150px] sm:h-[168px] rounded-lg shadow-md flex flex-col items-center justify-center">
      <div className="absolute top-1 left-2 flex items-center space-x-1 text-sm text-gray-500">
        <FiEye className="w-4 h-4 text-gray-500" /> {/* Ganti gambar dengan ikon */}
        <span>{item.historyCount}</span>
      </div>

        <img
          src={item.image || '/images/tes.png'}
          alt={item.test.title}
          className="w-[70px] h-[80px] sm:w-[100px] sm:h-[120px] object-contain"
        />
        <div className="text-center mt-2 text-sm font-semibold text-[#0B61AA]">
          Try Out {item.test.category}
        </div>
      </div>

      <div className="ml-4 flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-[#0B61AA]">{item.test.title}</h3>
        <p className="text-xs sm:text-sm text-[#0B61AA]">Prediksi Kemiripan {item.test.similarity}%</p>
        <div className="flex items-center mt-4 pt-4">
        {
          item.test.author?.photo ? (
            <img
              src={item.test.author?.photo}
              alt="Foto Author"
              className="w-10 h-10 rounded-full mr-2"
            />
          ) : (
            <FaUserCircle className="w-6 h-6 text-gray-500 mr-2" /> // Show the React icon if no photo is available
          )
        }
        <div>
            <p className="text-xs sm:text-sm">Dibuat Oleh:</p>
            <strong className="text-xs sm:text-sm">{item.test.author?.name || 'Penulis Tidak Diketahui'}</strong>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          {item.customStatus === 'Belum Bayar' && <Link href={`/tes/payment/${item.testId}`} className="bg-[#0B61AA] text-white text-sm sm:text-lg px-4 py-2 rounded-lg">Bayar</Link>}
          {item.customStatus === 'Berhasil (Belum Dikerjakan)' && <Link href={`/tes/detailsoal/${item.testId}`}className="bg-[#0B61AA] text-white text-sm sm:text-lg px-4 py-2 rounded-lg">Mulai</Link>}
          {item.customStatus === 'Selesai (Sudah Dikerjakan)' && <Link href={`/user/topscore/${item.testId}`} className="bg-[#0B61AA] text-white text-sm sm:text-lg px-4 py-2 rounded-lg">Score</Link>}
          {(item.customStatus === 'Tidak Berhasil (Gagal)' || item.customStatus === 'Tidak Berhasil (Expired)') && (
            <Link href="/user/dashboard" className="bg-[#0B61AA] text-white text-sm sm:text-lg px-4 py-2 rounded-lg">Beli Lagi</Link>
          )}
        </div>
      </div>
    </div>
  ))}
</div>
    </>
  );
}
