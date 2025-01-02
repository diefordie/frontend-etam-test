'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";
import dotenv from 'dotenv';
import Swal from 'sweetalert2';
import {jwtDecode} from 'jwt-decode';


dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const BuatTes = () => {
  const router = useRouter();
  const [jenisTes, setJenisTes] = useState('PilihanGanda');
  const [kategoriTes, setKategoriTes] = useState('');
  const [namaTes, setNamaTes] = useState(''); 
  const [deskripsi, setDeskripsi] = useState('');
  const [userId, setUserId] = useState(null);
  const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);

  const [activeTab, setActiveTab] = useState('buatTes');
  const [token, setToken] = useState("");
  const kategoriDropdownRef = useRef(null);
  const [authorId, setAuthorId] = useState(null);

  useEffect(() => {
    const checkRoleFromToken = () => {
      try {
        // Ambil token dari localStorage
        const token = localStorage.getItem("token");

        // Jika token tidak ditemukan, arahkan ke halaman login
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Decode token untuk mendapatkan data pengguna
        const decodedToken = jwtDecode(token);

        // Pastikan token terdecode dengan benar dan memiliki field role
        if (!decodedToken.role) {
          throw new Error("Role tidak ditemukan dalam token");
        }

        // Jika role bukan "author", arahkan ke halaman login
        if (decodedToken.role !== "AUTHOR") {
          router.push("/auth/login");
        }

      } catch (error) {
        console.error("Error decoding token:", error);
        // Jika ada error, arahkan ke halaman login
        router.push("/auth/login");
      }
    };

    // Jalankan fungsi untuk memeriksa role pengguna
    checkRoleFromToken();
  }, [router]);
  
  useEffect(() => {
    const fetchAuthorId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch(`https://${URL}/author/author-data`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch author data');
        }

        const authorData = await response.json();
        setAuthorId(authorData.id);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    fetchAuthorId();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (kategoriDropdownRef.current && !kategoriDropdownRef.current.contains(event.target)) {
        setShowKategoriDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi apakah semua data sudah diisi
    if (!jenisTes || !kategoriTes || !namaTes || !deskripsi) {
        // Tampilkan SweetAlert jika ada data yang belum diisi
        await Swal.fire({
            title: 'Data Tidak Lengkap!',
            text: 'Harap isi semua data sebelum melanjutkan.',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
        return; // Hentikan proses jika ada data yang belum diisi
    }

    const newTest = {
        authorId: authorId,
        type: jenisTes, 
        category: kategoriTes,
        title: namaTes,
        testDescription: deskripsi,
    };

    try {
        const response = await fetch(`https://${URL}/test/tests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTest),
        });

        if (response.ok) {
            const result = await response.json();
            const testId = result.id;
            if (testId) {
                await Swal.fire({
                    title: 'Berhasil!',
                    text: 'Tes berhasil disimpan. Anda akan diarahkan ke halaman selanjutnya.',
                    icon: 'success',
                    confirmButtonText: 'Lanjutkan',
                });
                router.push(`/author/buatSoal?testId=${testId}&category=${kategoriTes}&multiplechoiceId=${result.multiplechoiceId}`);
            } else {
                console.error('Test ID tidak ditemukan dalam respons:', result);
            }
        } else {
            console.error('Gagal menyimpan tes.');
            await Swal.fire({
                title: 'Terjadi Kesalahan!',
                text: 'Gagal menyimpan tes. Silakan coba lagi.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            title: 'Terjadi Kesalahan!',
            text: 'Kesalahan saat menyimpan tes. Silakan coba lagi.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }
};


  return (
    <>
    {/* Header dengan Warna Biru Kustom */}
    <header className="bg-[#0B61AA] text-white p-6 font-poppins w-auto" style={{height: '108px' }}>
  <div className=" flex items-center max-w-7xl px-4">
    <Link href="/author/dashboard">
      <IoMdArrowRoundBack className="text-white text-3xl sm:text-3xl lg:text-4xl ml-2" />
    </Link>
    <Link href="/author/dashboard">
      <img src="/images/etamtest.png" alt="Etamtest" className="h-[50px] ml-4" style={{ maxWidth: '179px' }} />
    </Link>
  </div>
</header>





      {/* Navigasi */}
      <nav className="bg-[#FFFFFF] text-black p-4">
        <ul className="grid grid-cols-2 flex justify-start sm:flex sm:justify-around gap-4 sm:gap-10">
          <li>
            <button
              className={`w-[140px] sm:w-[180px] px-4 sm:px-8 py-2 sm:py-4 rounded-full shadow-xl font-bold font-poppins ${activeTab === 'buatTes' ? 'bg-[#78AED6]' : ''}`}
              onClick={() => setActiveTab('buatTes')}
            >
              Buat Soal
            </button>
          </li>
          <li>
            <button
              className={`w-[140px] sm:w-[180px] px-4 sm:px-8 py-2 sm:py-4 rounded-full shadow-xl font-bold font-poppins ${activeTab === 'publikasi' ? 'bg-[#78AED6]' : ''}`}
            >
              Publikasi
            </button>
          </li>
        </ul>
      </nav>

      <div className='bg-white p-4'>
      {/* Konten Utama */}
      <div className="flex justify-center items-start mx-0 sm:mx-12">
        {activeTab === 'buatTes' && (
          <div className="bg-[#78AED6] p-8 rounded-md mx-auto w-full h-[750px] mt-[20px]">
            <div className="flex justify-start ">
              {/* Bagian Kiri, Teks Rata Kanan */}
              <div className="text-left pr-4 mobile:hidden tablet:block ">
                <h3 className="font-poppins text-black sm:text-lg mb-7 mt-7 sm:mt-8 sm:pt-6 ">Jenis</h3>
                <h3 className="font-poppins text-black sm:text-lg mb-4 mt-7 sm:mt-.6 sm:pt-12">Kategori</h3>
                <h3 className="font-poppins text-black sm:text-lg mb-4 mt-16 sm:mt-2 sm:pt-12">Nama</h3>
                <h3 className="font-poppins text-black sm:text-lg mb-4 mt-10 sm:mt-10 sm:pt-12 ">Deskripsi</h3>
              </div>

              {/* Bar putih di samping */}
              <div className="bg-white p-6 rounded-md shadow-lg w-full h-[550px] sm:mr-0 tablet:mx-4">
                {/* Jenis Tes Langsung Pilihan Ganda */}
                <div className="mb-4 sm:pt-4">
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded-full text:sm sm:text-lg"
                    value="Pilihan Ganda"
                    readOnly
                  />
                </div>
                {/* Dropdown Kategori Tes */}
                <div className="mb-4 sm:pt-12 w-full  mr-0 sm:mr-0">
                  <div className="relative" ref={kategoriDropdownRef}>
                    <button
                      className="w-full border border-gray-300 p-2 rounded-full flex justify-between items-center bg-white "
                      onClick={() => setShowKategoriDropdown(!showKategoriDropdown)}
                    >
                      <span className="font-poppins text-gray-500 italic">{kategoriTes || 'Kategori Tes'}</span>
                      <svg
                        className="w-4 h-4 ml-2 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.293 9.293a1 1 0 011.414 0L10 10.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {showKategoriDropdown && (
                      <div className="absolute z-10 w-full mt-1 border border-gray-300 bg-white rounded-md shadow-lg">
                        <ul className="absolute z-10 w-full mt-1 border border-gray-300 bg-white rounded-md shadow-lg">
                          <li>
                            <button
                              className="font-poppins w-full text-left px-4 py-2 text-gray-700 italic hover:bg-gray-100"
                              onClick={() => { setKategoriTes('CPNS'); setShowKategoriDropdown(false); }}
                            >
                              CPNS
                            </button>
                          </li>
                          <li>
                            <button
                              className="font-poppins w-full text-left px-4 py-2 text-gray-700 italic hover:bg-gray-100"
                              onClick={() => { setKategoriTes('UTBK'); setShowKategoriDropdown(false); }}
                            >
                              UTBK
                            </button>
                          </li>
                          <li>
                            <button
                              className="font-poppins w-full text-left px-4 py-2 text-gray-700 italic hover:bg-gray-100"
                              onClick={() => { setKategoriTes('Pemrograman'); setShowKategoriDropdown(false); }}
                            >
                              Pemrograman
                            </button>
                          </li>
                          <li>
                            <button
                              className="font-poppins w-full text-left px-4 py-2 text-gray-700 italic hover:bg-gray-100"
                              onClick={() => { setKategoriTes('Psikotes'); setShowKategoriDropdown(false); }}
                            >
                              Psikotes
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Nama Tes */}
                <div className="mb-4 sm:pt-12">
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded-full"
                    placeholder="Nama Tes"
                    value={namaTes} // Diubah di sini
                    onChange={(e) => setNamaTes(e.target.value)} 
                  />
                </div>

                {/* Input Deskripsi */}
                <div className="mb-4 sm:pt-12">
                  <textarea
                    className="w-full border border-gray-300 p-2 rounded-md resize-y"
                    rows="4"
                    placeholder="Deskripsi"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    style={{height: "150px", minHeight: "150px", maxHeight: "300px"}}
                  />
                </div>


                {/* Tombol Simpan */}
                <div className="relative min-h-[600px] sm:min-h-[450px]">
                  <div className="absolute bottom-80 right-0 pb-10  mr-[-20px]">
                    <button
                      className="bg-white text-black w-[150px] sm:w-[170px] tablet:px-6 mx-auto py-2 rounded-md hover:bg-[#0B61AA] hover:text-white transition duration-300" 
                      onClick={handleSubmit}>
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      
    </>
  );
}

export default BuatTes;