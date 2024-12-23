'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoPersonCircle } from 'react-icons/io5';
import { AiTwotoneCamera } from 'react-icons/ai';
import { BsTrash3 } from "react-icons/bs";
import { BsDoorOpen } from 'react-icons/bs';
import { AiOutlineForm } from 'react-icons/ai';
import Swal from 'sweetalert2';

import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProfile({ params }) {
  const { userId } = params;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    handphoneNum: '', 
    email: '',
    currentPassword: '',
    newPassword: '',
    profileImage: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [handphoneNum, setHandphoneNum] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setError("User ID is not available");
      return;
    }

    const fetchHandphoneNum = async () => {
      try {
        const token = localStorage.getItem('token'); // Ambil token dari localStorage
        if (!token) {
          console.error('Token tidak tersedia');
          setError('Autentikasi gagal. Silakan login kembali.');
          return;
        }
    
        const response = await fetch(`http://localhost:2000/user/profile/handphoneNum/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch handphone number');
        }
    
        const data = await response.json();
        setFormData((prevState) => ({
          ...prevState,
          handphoneNum: data.handphoneNum || '', 
        }));
      } catch (err) {
        console.error('Error fetching handphoneNum:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil nomor handphone.');
      }
    };

    fetchHandphoneNum();
  }, [userId]); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token tidak tersedia');
          return;
        }

        const response = await fetch(`http://localhost:2000/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const [firstName, lastName] = data.name ? data.name.split(' ') : ["", ""];
          setFormData({
            firstName,
            lastName,
            email: data.email || '',
            profileImage: data.userPhoto || '',
          });
        } else {
          console.error('Failed to fetch user data');
          setError('Gagal mengambil data profil');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteProfileImage = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token tidak tersedia');
        Swal.fire({
          title: 'Gagal!',
          text: 'Token tidak ditemukan. Silakan login kembali.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }
  
      // Make the DELETE request to the backend to remove the profile photo
      const response = await fetch('http://localhost:2000/user/profile/author/photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      // Handle the response from the server
      if (response.ok) {
        setFormData({ ...formData, profileImage: '' }); // Update form data to clear the profile image
        Swal.fire({
          title: 'Berhasil!',
          text: 'Foto profil berhasil dihapus.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        // Parse the error response from the backend and show an error message
        const errorData = await response.json();
        Swal.fire({
          title: 'Gagal!',
          text: errorData.message || 'Gagal menghapus foto profil.',
          icon: 'error',
          confirmButtonText: 'Coba Lagi',
        });
      }
    } catch (error) {
      console.error('Error deleting profile image:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus foto profil. Coba lagi nanti.',
        icon: 'error',
        confirmButtonText: 'Coba Lagi',
      });
    }
  };
  

  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({
          ...prevState,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:2000/user/profile/author/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: `${formData.firstName} ${formData.lastName}` }),
      });

      await fetch(`http://localhost:2000/user/profile/author/handphone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          handphoneNum: formData.handphoneNum,
        }),
      });

      await fetch(`http://localhost:2000/user/profile/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (selectedFile) {
        const profileImageData = new FormData();
        profileImageData.append("profileImage", selectedFile);

        await fetch(`http://localhost:2000/user/profile/author/photo`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: profileImageData,
        });
      }

      if (formData.currentPassword && formData.newPassword) {
        const passwordResponse = await fetch(`http://localhost:2000/user/profile/password`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || "Gagal memperbarui password");
        }
      }

      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui!',
        icon: 'success',
        confirmButtonText: 'OK',
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memperbarui profil!',
        icon: 'error',
        confirmButtonText: 'Coba ',
      });
    }
  };

  const handleDashboard = () => {
    router.push('/author/dashboard');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-0 md:px-0" >
      {/* Header */}
      <div className="flex justify-between p-4 bg-deepBlue top-0 left-0 right-0 text-white w-full font-poppins lg:p-3 z-50">
        <div className="flex-shrink-0 items-center">
          <img src="/images/etamtest.png" alt="Etamtest" className="h-[30px] lg:h-10 pl-3"  />
        </div>
        <div className="flex-shrink-0 items-center">
          {/* Ikon Pintu Menggunakan react-icons */}
          <BsDoorOpen
            className="max-w-[44px] h-[22px] mt-2 cursor-pointer"
            onClick={handleDashboard}
          />
        </div>
      </div>

      {/* Profil Header */}
      <div className="min-h-screen flex flex-col p-8 bg-[#FFFFFF] font-sans">
        <div className="w-full max-w-[1228px] h-[88px] mx-auto mt-2 p-4 bg-[#0B61AA] text-white flex items-center justify-between rounded-md">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full flex justify-center items-center relative">
              {/* Gambar Profil atau Ikon Default */}
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profil"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <IoPersonCircle className="h-16 w-16 text-white-500" />
              )}
              
              {/* Ikon Kamera */}
              <AiTwotoneCamera
                className="h-6 w-6 absolute bottom-0 right-1 cursor-pointer text-gray-600"
                onClick={() => document.getElementById('uploadProfileImage').click()}
              />
              
              {/* Input File (Hidden) */}
              <input
                type="file"
                id="uploadProfileImage"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold font-poppins">{`${formData.firstName} ${formData.lastName}`}</h3>
                <p className="font-poppins">{formData.email}</p>
              </div>
          </div>
          <div className="flex items-center justify-center w-[29px] h-[29px] bg-white rounded-[10px] ml-auto">
            {/* Ikon Sampah (Trash) Menggunakan react-icons */}
            <BsTrash3
              className="w-5 h-5 cursor-pointer  text-black"
              onClick={handleDeleteProfileImage}
            />
          </div>
        </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-[1228px] mx-auto mt-0 p-4 bg-white shadow-md border border-black rounded-md">
          <form className="space-y-4 mt-4" onSubmit={handleSave}>
          <div className="relative">
            <label className="block text-gray-700 font-poppins">Nama Depan</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border border-black rounded-[15px] mt-1 font-poppins"
            />
            {/* Ikon Edit Menggunakan react-icons */}
            <AiOutlineForm 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer mt-3"
              onClick={handleEdit} // Tambahkan fungsi handleEdit jika diperlukan
            />
          </div>

            <div className="relative">
              <label className="block text-gray-700 font-poppins">Nama Belakang</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-black rounded-[15px] mt-1 pr-10 font-poppins"
              />
              <AiOutlineForm 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer mt-3"
              onClick={handleEdit} // Tambahkan fungsi handleEdit jika diperlukan
            />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-poppins">Nomor Handphone</label>
              <input
                type="text"
                name="handphoneNum"
                value={formData.handphoneNum}
                onChange={handleChange}
                className="w-full p-2 border border-black rounded-[15px] mt-1 pr-10 font-poppins"
              />
              <AiOutlineForm 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer mt-3"
              onClick={handleEdit} 
            />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-poppins">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-black rounded-[15px] mt-1 pr-10 font-poppins"
              />
              <AiOutlineForm 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer mt-3"
              onClick={handleEdit} // Tambahkan fungsi handleEdit jika diperlukan
            />
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-gray-700 font-poppins">Kata Sandi Saat Ini</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 border border-black rounded-[15px] mt-1 pr-10 font-poppins"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-gray-700 font-poppins">Kata Sandi baru</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-black rounded-[15px] mt-1 pr-10 font-poppins"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-[#0B61AA] text-white px-4 py-2 rounded-[15px] font-poppins">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}