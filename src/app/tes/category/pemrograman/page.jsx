"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AiOutlineBars } from "react-icons/ai";
import { IoPersonCircle } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import { IoSadOutline } from "react-icons/io5";
import { SlBookOpen } from "react-icons/sl";
import { FaEye } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from 'next/navigation';

import dotenv from "dotenv";
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

export default function Pemrograman() {
  
  const [popularTestsByCategory, setPopularTestsByCategory] = useState([]);
  const [freeTestsByCategory, setFreeTestsByCategory] = useState([]);
  const [berbayarTests, setBerbayarTests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState ('');
  const [loading, setLoading] = useState([true]);
  const [error, setError] = useState([null]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

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
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Token tidak ditemukan");
          }

          const decodedToken = jwtDecode(token);
          if (!decodedToken.id) {
            throw new Error("User ID tidak ditemukan dalam token");
          }

          setUserId(decodedToken.id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
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
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      if (!token) {
        setErrorUser("Token tidak ditemukan");
        setLoadingUser(false);
        return;
      }

      try {
        setLoadingUser(true);
        const response = await fetch(`https://${URL}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data) {
          setUserData(data);
        } else {
          throw new Error("Data pengguna tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorUser("Gagal mengambil data pengguna");
        if (error.message === "Failed to fetch user data") {
          // Token mungkin tidak valid atau kadaluarsa
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          router.push("/login");
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchPopularTestsByCategory = async () => {
      try {
        const response = await fetch(
          `https://${URL}/dashboard/popular-tests-by-category?category=Pemrograman`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch popular tests by category");
        }
        const data = await response.json();
        setPopularTestsByCategory(data);
      } catch (error) {
        console.error("Error fetching popular tests by category:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTestsByCategory();
  }, []);

  useEffect(() => {
    const fetchBerbayarTestsByCategory = async () => {
      try {
        const response = await fetch(
          `https://${URL}/dashboard/locked-tests-by-category?category=Pemrograman`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch berbayar tests by category");
        }
        const data = await response.json();
        setBerbayarTests(data);
      } catch (error) {
        console.error("Error fetching berbayar tests by category:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBerbayarTestsByCategory();
  }, []);

  useEffect(() => {
    const fetchFreeTestsByCategory = async () => {
      try {
        const response = await fetch(
          `https://${URL}/dashboard/free-tests-by-category?category=Pemrograman`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch free tests by category");
        }
        const data = await response.json();
        setFreeTestsByCategory(data);
      } catch (error) {
        console.error("Error fetching free tests by category:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeTestsByCategory();
  }, []);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  
  const handleSearch = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`https://${URL}/dashboard/search-tests-by-category?title=${encodeURIComponent(
          searchQuery
        )}&category=Pemrograman`);
      if (!response.ok) throw new Error("Failed to search tests");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching tests:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, 500);
  
  const handleInputChange = (e) => {
    const value = e.target.value || '';
    setSearchQuery(value);
  
    // Update sementara ke UI
    if (!value.trim()) {
      setSearchResults([]);
    }
  
    // Trigger debounce untuk pencarian sebenarnya
    handleSearch(value);
  };

  if (loading && !error) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  const [searchcurrentIndex, searchsetCurrentIndex] = useState(0);
  const [searchitemsToShow, setSearchItemsToShow] = useState(2);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setSearchItemsToShow(4); // Tampilkan 4 item di desktop
      } else {
        setSearchItemsToShow(2); // Tampilkan 2 item di mobile
      }
    };

    // Jalankan saat component dimuat
    updateItemsToShow();

    // Tambahkan event listener untuk mendeteksi perubahan ukuran layar
    window.addEventListener("resize", updateItemsToShow);

    // Bersihkan event listener saat component dilepas
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  const searchnextSlide = () => {
    if (searchcurrentIndex < searchResults.length - searchitemsToShow) {
      searchsetCurrentIndex(searchcurrentIndex + 1);
    }
  };

  const searchprevSlide = () => {
    if (searchcurrentIndex > 0) {
      searchsetCurrentIndex(searchcurrentIndex - 1);
    }
  };

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

    // Jalankan saat component dimuat
    updateItemsToShow();

    // Tambahkan event listener untuk mendeteksi perubahan ukuran layar
    window.addEventListener("resize", updateItemsToShow);

    // Bersihkan event listener saat component dilepas
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  const populernextSlide = () => {
    if (
      populercurrentIndex <
      popularTestsByCategory.length - populeritemsToShow
    ) {
      populersetCurrentIndex(populercurrentIndex + 1);
    }
  };

  const populerprevSlide = () => {
    if (populercurrentIndex > 0) {
      populersetCurrentIndex(populercurrentIndex - 1);
    }
  };

  // fungsi slider section berbayar
  const [berbayarcurrentIndex, berbayarsetCurrentIndex] = useState(0);
  const [berbayaritemsToShow, setBerbayarItemsToShow] = useState(2);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setBerbayarItemsToShow(4); // Tampilkan 4 item di desktop
      } else {
        setBerbayarItemsToShow(2); // Tampilkan 2 item di mobile
      }
    };

    // Jalankan saat component dimuat
    updateItemsToShow();

    // Tambahkan event listener untuk mendeteksi perubahan ukuran layar
    window.addEventListener("resize", updateItemsToShow);

    // Bersihkan event listener saat component dilepas
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  const berbayarnextSlide = () => {
    if (berbayarcurrentIndex < berbayarTests.length - berbayaritemsToShow) {
      berbayarsetCurrentIndex(berbayarcurrentIndex + 1);
    }
  };

  const berbayarprevSlide = () => {
    if (berbayarcurrentIndex > 0) {
      berbayarsetCurrentIndex(berbayarcurrentIndex - 1);
    }
  };

  // fungsi slider section gratis
  const [gratiscurrentIndex, gratissetCurrentIndex] = useState(0);
  const [gratisitemsToShow, setGratisItemsToShow] = useState(2);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setGratisItemsToShow(4); // Tampilkan 4 item di desktop
      } else {
        setGratisItemsToShow(2); // Tampilkan 2 item di mobile
      }
    };

    // Jalankan saat component dimuat
    updateItemsToShow();

    // Tambahkan event listener untuk mendeteksi perubahan ukuran layar
    window.addEventListener("resize", updateItemsToShow);

    // Bersihkan event listener saat component dilepas
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  const gratisnextSlide = () => {
    if (gratiscurrentIndex < freeTestsByCategory.length - gratisitemsToShow) {
      gratissetCurrentIndex(gratiscurrentIndex + 1);
    }
  };

  const gratisprevSlide = () => {
    if (gratiscurrentIndex > 0) {
      gratissetCurrentIndex(gratiscurrentIndex - 1);
    }
  };

  const menus = [
    { href: "/", text: "Home" },
    { href: "/fav", text: "Favorit" },
    { href: "/transaksi", text: "Transaksi" },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  const [likedItems, setLikedItems] = useState({});

  // Ambil status like dari local storage atau API saat komponen dimuat
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true); // Mulai loading
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }
        const response = await fetch(`https://${URL}/api/favorites`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const favoriteTests = await response.json();

        // Buat objek liked items berdasarkan favoriteTests
        const initialLikedItems = {};
        favoriteTests.forEach((test) => {
          initialLikedItems[test.id] = true; // Asumsikan test.id adalah ID dari tes
        });

        setLikedItems(initialLikedItems);
      } catch (error) {
        console.error("Error fetching favorite tests:", error);
      } finally {
        setLoading(false); // Akhiri loading
      }
    };

    // Memanggil fetchFavorites untuk mendapatkan favorit dari server
    fetchFavorites();
  }, [token, URL]);

  // Mengambil status like dari local storage saat pertama kali komponen dimuat
  useEffect(() => {
    const storedLikedItems = localStorage.getItem("likedItems");
    if (storedLikedItems) {
      setLikedItems(JSON.parse(storedLikedItems));
    }
  }, []);

  // Mengupdate local storage setiap kali likedItems diupdate
  useEffect(() => {
    localStorage.setItem("likedItems", JSON.stringify(likedItems));
  }, [likedItems]);

  // Fungsi toggle like untuk semua bagian
  const toggleLike = async (id) => {
    const isLiked = likedItems[id];

    try {
      if (isLiked) {
        // Jika sudah di-like, lakukan DELETE request
        await fetch(`https://${URL}/api/favorites`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ testId: id }),
        });
      } else {
        // Jika belum di-like, lakukan POST request
        await fetch(`https://${URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ testId: id }),
        });
      }

      // Update state setelah permintaan berhasil
      setLikedItems((prevLikedItems) => ({
        ...prevLikedItems,
        [id]: !prevLikedItems[id], // Toggle status like
      }));
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch(`https://${URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Sertakan token jika perlu
        },
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.clear();

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  const handleHome = (event) => {
    event.preventDefault(); // Mencegah perilaku default link
  
    // Ambil sessionId dari localStorage
    const sessionId = localStorage.getItem('sessionId');
  
    if (sessionId) {
      // Hapus data terkait sessionId dari localStorage
      localStorage.removeItem('resultId');
      localStorage.removeItem('answers');
      localStorage.removeItem(`remainingTime_${sessionId}`);
      localStorage.removeItem(`workTime_${sessionId}`);
      localStorage.removeItem(`sessionId`);
      localStorage.removeItem(`currentOption`);
    }
  
    // Redirect ke halaman dashboard
    router.push('/user/dashboard');
  };
  
  if (loading) {
    return <LoadingAnimation />;
  }
  

  return (
    <>
      <header className="relative flex w-full bg-deepBlue text-white p-3 items-center z-50">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center p-2 lg:ml-9">
            <Link href="/user/dashboard">
              <IoMdArrowRoundBack className="lg:hidden text-white text-2xl" />
            </Link>

            
              <img
                src="/images/etamtest.png"
                alt="EtamTest"
                className="lg:h-14 h-8 mr-3 object-contain"
              />
            
          </div>

          <div className="relative flex inline-block items-center ">
            <div className="mx-auto">
              {/* Judul besar */}
              <h5 className="text-sm lg:text-3xl font-bold font-bodoni mr-2 sm:mr-8">
                Latihan Soal Tes Pemrograman
              </h5>
              {/* Breadcrumb di bawah h5 */}
              <nav className="hidden lg:block mt-2">
                <ol className="list-reset flex space-x-2 ">
                  <li>
                  <Link href="/user/dashboard" legacyBehavior>
                    <a onClick={handleHome} className="hover:text-orange font-poppins font-bold">Home</a>
                  </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link href="/tes/category/pemrograman" legacyBehavior>
                      <a className="hover:text-orange font-poppins font-bold">
                        Latihan Tes Pemrograman
                      </a>
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

      {/* Search Bar */}
      <section className="bg-gradient-custom p-20 lg:pt-40 pt-30">
        <div className="container justify-between mt-10 lg:mt-4 lg:max-w-[610px] max-w-full ">
        <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex items-center p-1 rounded-2xl bg-white w-full font-poppins sm:max-w-[400px] lg:max-w-[610px] justify-between"
          >
            <input
              type="text"
              placeholder="Cari Tes Soal"
              className="flex-grow p-1 lg:p-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-powderBlue font-poppins max-w-[130px] lg:max-w-[610px]"
              value={searchQuery}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="p-1 sm:p-2 text-deepBlue font-bold rounded-2xl hover:bg-gray-200 font-poppins flex items-center justify-end"
            >
              <IoSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </form>
        </div>
      </section>

      {/* Bagian search bar */}
      {!loading && searchQuery.trim() && searchResults.length > 0 && (
        <section className="block mx-auto p-5 font-poppins relative">
          <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
            Hasil Pencarian
            {/* Container untuk kategori, menambahkan grid layout yang konsisten */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {searchResults
                .slice(
                  searchcurrentIndex,
                  searchcurrentIndex + searchitemsToShow
                )
                .map((test) => (
                  <div
                    key={test.testId}
                    className="bg-abumuda shadow-lg p-1 relative group"
                  >
                                    {/* Overlay background abu-abu yang muncul saat hover */}
                <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

<div className="flex justify-between items-center group-hover:blur-[2px] transition-opacity duration-300 z-10">
  <div className="flex items-center space-x-2 font-bold text-deepBlue p-2">
    <FaEye />
    <span className="text-[0.6rem] lg:text-sm font-poppins">{test.accessCount}</span>
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="text-4xl lg:text-8xl">
      <SlBookOpen />
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 text-deepBlue relative z-20 group-hover:blur-[2px] transition duration-300">
  <h3 className="text-center text-[0.8rem] lg:text-lg font-bold mt-0 lg:mt-2 font-poppins">{test.category}</h3>
</div>

<div className="bg-deepBlue text-white p-1 lg:p-2  mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="flex items-center space-x-2 justify-between">
    <h3 className="text-left text-[0.625rem] lg:text-base font-bold mt-2">{test.title}</h3>
  </div>

  <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">Prediksi kemiripan {test.similarity}%</p>
  <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>

  <div className="flex justify-between space-x-2 leading-relaxed mt-1">
      <div className="flex text-left space-x-1 lg:space-x-4">

        {test.author.authorPhoto ? (
          <img
            src={test.author.authorPhoto}
            alt={test.category}
            className="h-3 w-3 lg:h-6 lg:w-6 object-contain object-cover rounded-full"
          />
        ) : (
          <IoPersonCircle className="h-3 lg:h-6 text-white" />
        )}

      <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author.name}</span>
      </div>
      <span className="text-[0.375rem] lg:text-sm font-semibold">
        {Number(test.price) === 0 ? 'Gratis' : (
            <IoIosLock className="h-2 lg:h-4 inline-block text-current object-contain text-white" alt="Berbayar" />
        )}
      </span>
    </div>
</div>

<div className="absolute gap-1 bottom-5 left-0 right-0 flex justify-center items-center lg:justify-center lg:space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 p-1 w-full">
    <a href={`/tes/detailsoal/${test.id}`} className="w-3/4 lg:w-1/4 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-3 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      Mulai
    </a>
    <a href={`/user/topscore/${test.id}`} className="w-3/4 lg:w-2/5 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-1 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      <i className="fa-solid fa-medal"></i>
      <span className="ml-1">Top Score</span>
    </a>
    <button 
      onClick={() => toggleLike(test.id)} 
      className="lg:block text-center bg-paleBlue text-deepBlue inline-block px-3 py-2 rounded-full hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0"
    >
      <i className={`fa${likedItems[test.id] ? "s" : "r"} fa-heart ${likedItems[test.id] ? "text-red-500" : "text-deepBlue"}`}></i>
    </button>
</div>
</div>
))}
</div>
            {/* Tombol panah kiri */}
            <button
              onClick={searchprevSlide}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
                searchcurrentIndex === 0 ? "hidden" : ""
              }`}
            >
              &#10094; {/* Simbol panah kiri */}
            </button>
            {/* Tombol panah kanan */}
            <button
              onClick={searchnextSlide}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
                searchcurrentIndex >= searchResults.length - searchitemsToShow
                  ? "hidden"
                  : ""
              }`}
            >
              &#10095; {/* Simbol panah kanan */}
            </button>
          </div>
        </section>
      )}
      {!loading && searchQuery.trim() && searchResults.length === 0 && (
        <section className="block mx-auto p-5 font-poppins relative">
          <div className="flex flex-col items-center text-gray-500 font-poppins mt-5">
            <IoSadOutline className="text-4xl lg:text-6xl text-gray-400" />
            <p className="mt-2 font-bold">Tidak ada hasil yang ditemukan.</p>
            <p className="text-sm">Coba gunakan kata kunci lain!</p>
          </div>
        </section>
      )}

      {/* Bagian Paling Populer */}
      {popularTestsByCategory && popularTestsByCategory.length > 0 && (
      <section className="mx-auto p-5 font-poppins relative">
        <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
          Paling Populer
          {/* Container untuk kategori, menambahkan grid layout yang konsisten */}
          <div className=" mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTestsByCategory.slice(populercurrentIndex, populercurrentIndex + populeritemsToShow).map((test, index) => (
            <div
              key={test.testId || index} // Using index as fallback
              className="bg-abumuda shadow-lg p-1 relative group"
            >
                  {/* Overlay background abu-abu yang muncul saat hover */}
                  <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

                  <div className="flex justify-between items-center group-hover:blur-[2px] transition-opacity duration-300 z-10">
                    <div className="flex items-center space-x-2 font-bold text-deepBlue p-2">
                      <FaEye />
                      <span className="text-[0.6rem] lg:text-sm font-poppins">{test.accessCount}</span>
                    </div>
                  </div>

                  <div className="flex justify-center mt-2 lg:mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
                    <div className="text-4xl lg:text-8xl">
                      <SlBookOpen />
                    </div>
                  </div>

                  <div className="flex justify-center mt-2 lg:mt-4 text-deepBlue relative z-20 group-hover:blur-[2px] transition duration-300">
                    <h3 className="text-center text-[0.8rem] lg:text-lg font-bold mt-0 lg:mt-2 font-poppins">{test.category}</h3>
                  </div>

                  <div className="bg-deepBlue text-white p-1 lg:p-2  mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
                    <div className="flex items-center space-x-2 justify-between">
                      <h3 className="text-left text-[0.625rem] lg:text-base font-bold mt-2">{test.title}</h3>
                    </div>

                    <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">Prediksi kemiripan {test.similarity}%</p>
                    <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>

                    <div className="flex justify-between space-x-2 leading-relaxed mt-1">
                      <div className="flex text-left space-x-1 lg:space-x-4">
                        {test.author.authorPhoto ? (
                          <img
                            src={test.author.authorPhoto}
                            alt={test.category}
                            className="h-3 w-3 lg:h-6 lg:w-6 object-cover rounded-full"
                          />
                        ) : (
                          <IoPersonCircle className="h-3 lg:h-6 text-white" />
                        )}
                        <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author.name}</span>
                      </div>
                      <span className="text-[0.375rem] lg:text-sm font-semibold">
                        {Number(test.price) === 0 ? 'Gratis' : (
                          <IoIosLock className="h-2 lg:h-4 inline-block text-current object-contain text-white" alt="Berbayar" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="absolute gap-1 bottom-5 left-0 right-0 flex justify-center items-center lg:justify-center lg:space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 p-1 w-full">
                    <a href={` /tes/detailsoal/${test.id}`} className="w-3/4 lg:w-1/4 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-3 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
                      Mulai
                    </a>
                    <a href={`/user/topscore/${test.id}`} className="w-3/4 lg:w-2/5 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-1 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
                      <i className="fa-solid fa-medal"></i>
                      <span className="ml-1">Top Score</span>
                    </a>
                    <button 
                      onClick={() => toggleLike(test.id)} 
                      className="lg:block text-center bg-paleBlue text-deepBlue inline-block px-3 py-2 rounded-full hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0"
                    >
                      <i className={`fa${likedItems[test.id] ? "s" : "r"} fa-heart ${likedItems[test.id] ? "text-red-500" : "text-deepBlue"}`}></i>
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          {/* Tombol panah kiri */}
          <button
            onClick={populerprevSlide}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              populercurrentIndex === 0 ? "hidden" : ""
            }`}
          >
            &#10094;
          </button>
          {/* Tombol panah kanan */}
          <button
            onClick={populernextSlide}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              populercurrentIndex >=
              popularTestsByCategory.length - populeritemsToShow
                ? "hidden"
                : ""
            }`}
          >
            &#10095;
          </button>
        </div>
      </section>
      )}

      {/* Bagian Berbayar */}
      <section className="block mx-auto p-5 font-poppins relative">
        <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
          Berbayar
          {/* Container untuk kategori, menambahkan grid layout yang konsisten */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {berbayarTests
            .slice(berbayarcurrentIndex, berbayarcurrentIndex + berbayaritemsToShow)
            .map((test) => (
              <div
                key={test.testId}
                className="bg-abumuda shadow-lg p-1 relative group"
              >
                  {/* Overlay background abu-abu yang muncul saat hover */}
                <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

<div className="flex justify-between items-center group-hover:blur-[2px] transition-opacity duration-300 z-10">
  <div className="flex items-center space-x-2 font-bold text-deepBlue p-2">
    <FaEye />
    <span className="text-[0.6rem] lg:text-sm font-poppins">{test.accessCount}</span>
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="text-4xl lg:text-8xl">
    <SlBookOpen />
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 text-deepBlue relative z-20 group-hover:blur-[2px] transition duration-300">
  <h3 className="text-center text-[0.8rem] lg:text-lg font-bold mt-0 lg:mt-2 font-poppins">{test.category}</h3>
</div>

<div className="bg-deepBlue text-white p-1 lg:p-2  mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="flex items-center space-x-2 justify-between">
    <h3 className="text-left text-[0.625rem] lg:text-base font-bold mt-2">{test.title}</h3>
  </div>

  <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">Prediksi kemiripan {test.similarity}%</p>
  <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>

  <div className="flex justify-between space-x-2 leading-relaxed mt-1">
    <div className="flex text-left space-x-1 lg:space-x-4">
        {test.author.authorPhoto ? (
          <img
            src={test.author.authorPhoto}
            alt={test.category}
            className="h-3 w-3 lg:h-6 lg:w-6 object-cover rounded-full"
          />
        ) : (
          <IoPersonCircle className="h-3 lg:h-6 text-white" />
        )}
          <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author.name}</span>
    </div>
    
      <span className="text-[0.375rem] lg:text-sm font-semibold">
        {Number(test.price) === 0 ? 'Gratis' : (
            <IoIosLock className="h-2 lg:h-4 inline-block text-current object-contain text-white" alt="Berbayar" />
        )}
      </span>
      
  </div>
</div>

<div className="absolute gap-1 bottom-5 left-0 right-0 flex justify-center items-center lg:justify-center lg:space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 p-1 w-full">
    <a href= {`/tes/detailsoal/${test.id}`} className="w-3/4 lg:w-1/4 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-3 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      Mulai
    </a>
    <a href={`/user/topscore/${test.id}`}className="w-3/4 lg:w-2/5 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-1 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      <i className="fa-solid fa-medal"></i>
       <span className="ml-1">Top Score</span>
    </a>
    <button 
      onClick={() => toggleLike(test.id)} 
      className="lg:block text-center bg-paleBlue text-deepBlue inline-block px-3 py-2 rounded-full hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0"
    >
      <i className={`fa${likedItems[test.id] ? "s" : "r"} fa-heart ${likedItems[test.id] ? "text-red-500" : "text-deepBlue"}`}></i>
    </button>
</div>
</div>
))}
</div>
          {/* Tombol panah kiri */}
          <button
            onClick={berbayarprevSlide}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              gratiscurrentIndex === 0 ? "hidden" : ""
            }`}
          >
            &#10094;
          </button>
          {/* Tombol panah kanan */}
          <button
            onClick={berbayarnextSlide}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              gratiscurrentIndex >=
              freeTestsByCategory.length - gratisitemsToShow
                ? "hidden"
                : ""
            }`}
          >
            &#10095;
          </button>
        </div>
      </section>

      {/* Bagian gratis */}
      <section className="block mx-auto p-5 font-poppins relative">
        <div className="mx-auto mt-5 font-bold font-poppins text-deepBlue">
          Gratis
          {/* Container untuk kategori, menambahkan grid layout yang konsisten */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {freeTestsByCategory
              .slice(gratiscurrentIndex, gratiscurrentIndex + gratisitemsToShow)
              .map((test, index) => (
                <div
                  key={test.testId || `fallback-key-${index}`}
                  className="bg-abumuda shadow-lg p-1 relative group"
                >
                  {/* Overlay background abu-abu yang muncul saat hover */}
                <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

<div className="flex justify-between items-center group-hover:blur-[2px] transition-opacity duration-300 z-10">
  <div className="flex items-center space-x-2 font-bold text-deepBlue p-2">
    <FaEye />
    <span className="text-[0.6rem] lg:text-sm font-poppins">{test.accessCount}</span>
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="text-4xl lg:text-8xl">
    <SlBookOpen />
  </div>
</div>

<div className="flex justify-center mt-2 lg:mt-4 text-deepBlue relative z-20 group-hover:blur-[2px] transition duration-300">
  <h3 className="text-center text-[0.8rem] lg:text-lg font-bold mt-0 lg:mt-2 font-poppins">{test.category}</h3>
</div>

<div className="bg-deepBlue text-white p-1 lg:p-2  mt-4 relative z-20 group-hover:blur-[2px] transition duration-300">
  <div className="flex items-center space-x-2 justify-between">
    <h3 className="text-left text-[0.625rem] lg:text-base font-bold mt-2">{test.title}</h3>
  </div>

  <p className="text-left text-[0.5rem] lg:text-sm leading-relaxed">Prediksi kemiripan {test.similarity}%</p>
  <p className="text-[0.4rem] lg:text-xs leading-relaxed">Dibuat Oleh:</p>

  <div className="flex justify-between space-x-2 leading-relaxed mt-1">
    <div className="flex text-left space-x-1 lg:space-x-4">
        {test.author.authorPhoto ? (
          <img
            src={test.author.authorPhoto}
            alt={test.category}
            className="h-3 w-3 lg:h-6 lg:w-6 object-contain object-cover rounded-full"
          />
        ) : (
          <IoPersonCircle className="h-3 lg:h-6 text-white" />
        )}
          <span className="text-[0.375rem] lg:text-sm font-semibold">{test.author.name}</span>
    </div>
    
      <span className="text-[0.375rem] lg:text-sm font-semibold">
        {Number(test.price) === 0 ? 'Gratis' : (
            <IoIosLock className="h-2 lg:h-4 inline-block text-current object-contain text-white" alt="Berbayar" />
        )}
      </span>
      
  </div>
</div>

<div className="absolute gap-1 bottom-5 left-0 right-0 flex justify-center items-center lg:justify-center lg:space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 p-1 w-full">
    <a href= {`/tes/detailsoal/${test.id}`} className="w-3/4 lg:w-1/4 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-3 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      Mulai
    </a>
    <a href={`/user/topscore/${test.id}`}className="w-3/4 lg:w-2/5 text-xs lg:text-base text-center bg-paleBlue text-deepBlue py-1 lg:py-2 rounded-full inline-block hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0">
      <i className="fa-solid fa-medal"></i>
       <span className="ml-1">Top Score</span>
    </a>
    <button 
      onClick={() => toggleLike(test.id)} 
      className="lg:block text-center bg-paleBlue text-deepBlue inline-block px-3 py-2 rounded-full hover:bg-orange hover:text-deepBlue mb-2 lg:mb-0"
    >
      <i className={`fa${likedItems[test.id] ? "s" : "r"} fa-heart ${likedItems[test.id] ? "text-red-500" : "text-deepBlue"}`}></i>
    </button>
</div>
</div>
))}
</div>
          {/* Tombol panah kiri */}
          <button
            onClick={gratisprevSlide}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              gratiscurrentIndex === 0 ? "hidden" : ""
            }`}
          >
            &#10094;
          </button>
          {/* Tombol panah kanan */}
          <button
            onClick={gratisnextSlide}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-200 ${
              gratiscurrentIndex >=
              freeTestsByCategory.length - gratisitemsToShow
                ? "hidden"
                : ""
            }`}
          >
            &#10095;
          </button>
        </div>
      </section>
    </>
  );
}