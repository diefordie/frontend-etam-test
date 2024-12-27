"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineStar } from "react-icons/ai";
import { AiOutlineLaptop } from "react-icons/ai";
import { AiOutlineCode } from "react-icons/ai";
import { AiOutlineBook } from "react-icons/ai";
import { AiFillInstagram } from "react-icons/ai";
import { IoLogoFacebook } from "react-icons/io5";
import { AiFillLinkedin } from "react-icons/ai";
import { AiFillTikTok } from "react-icons/ai";
import { IoPersonCircle } from "react-icons/io5";
import dotenv from "dotenv";

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

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
    const fetchTestimonies = async () => {
      try {
        const response = await fetch(`https://${URL}/api/testimonies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data testimonies");
        }

        const testimonies = await response.json();
        setTestimonials(testimonies); // Set testimonials setelah fetch berhasil
      } catch (error) {
        console.error("Error fetching testimonies:", error);
      }
    };

    fetchTestimonies();
  }, []);

  const handleNext = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  if (testimonials.length === 0) return <LoadingAnimation />;

  const {
    user: { name, userPhoto },
    comment,
  } = testimonials[currentTestimonialIndex];

  return (
    <div id="testimoni" className="bg-gray-50 py-20 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">
        Apa Kata Pengguna?
      </h1>

      <div className="flex justify-center items-center mb-6">
        <button
          onClick={handlePrev}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <span className="text-2xl">‹</span>
        </button>

        <div className="mx-4 opacity-50">
          {testimonials[
            (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length
          ].userPhoto ? (
            <img
              src={
                testimonials[
                  (currentTestimonialIndex - 1 + testimonials.length) %
                    testimonials.length
                ].userPhoto
              }
              alt={
                testimonials[
                  (currentTestimonialIndex - 1 + testimonials.length) %
                    testimonials.length
                ].name
              }
              className="w-16 h-16 rounded-full object-cover mx-auto"
            />
          ) : (
            <IoPersonCircle className="w-16 h-16 text-gray-400 mx-auto" />
          )}
          <p className="text-gray-700">
            {
              testimonials[
                (currentTestimonialIndex - 1 + testimonials.length) %
                  testimonials.length
              ].name
            }
          </p>
        </div>

        <div className="mx-4">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
            />
          ) : (
            <IoPersonCircle className="w-24 h-24 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-lg font-semibold text-gray-800">{name}</p>
          <p className="text-gray-600">{status}</p>
          <p className="text-gray-700 italic">"{comment}"</p>
        </div>

        <div className="mx-4 opacity-50">
          {testimonials[
            (currentTestimonialIndex + 1) % testimonials.length
          ].userPhoto ? (
            <img
              src={
                testimonials[(currentTestimonialIndex + 1) % testimonials.length]
                  .userPhoto
              }
              alt={
                testimonials[(currentTestimonialIndex + 1) % testimonials.length]
                  .name
              }
              className="w-16 h-16 rounded-full object-cover mx-auto"
            />
          ) : (
            <IoPersonCircle className="w-16 h-16 text-gray-400 mx-auto" />
          )}
          <p className="text-gray-700">
            {testimonials[(currentTestimonialIndex + 1) % testimonials.length].name}
          </p>
        </div>

        <button
          onClick={handleNext}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <span className="text-2xl">›</span>
        </button>
      </div>
    </div>
  );
};


// Section Baru di Bawah Testimoni
const CallToActionSection = () => (
  <div className="bg-white mx-auto my-10 p-8 rounded-lg shadow-lg max-w-6xl">
    <div className="flex flex-col justify-between items-center md:flex-row md:items-center md:justify-between">
      {/* Bagian Kiri (Teks) */}
      <div className="text-center md:text-left w-full md:w-1/2 mb-6 md:mb-0">
        <h2 className="text-3xl font-semibold text-[#0B61AA] mb-2">
          Siap Menguji Dirimu?
        </h2>
        <p className="text-gray-700 text-lg">
          Jangan lewatkan kesempatan untuk mempersiapkan dirimu dengan tes soal
          berkualitas. Mulai sekarang dan lihat peningkatan hasil belajarmu.
        </p>
      </div>

      {/* Bagian Kanan (Tombol) */}
<div className="flex flex-col md:flex-col justify-center items-center space-y-4 w-full md:w-auto">
  <Link
    href="/guestDashboard"
    className="bg-[#0B61AA] text-white py-3 px-6 rounded-md shadow-md hover:bg-opacity-80 transition duration-300 w-full md:w-auto min-w-[200px] text-center"
  >
    Mulai Test Sekarang
  </Link>
  <Link
    href="/auth/registrasi"
    className="bg-white text-black border border-gray-300 py-3 px-6 rounded-md shadow-md hover:bg-gray-100 transition duration-300 w-full md:w-auto min-w-[200px] text-center"
  >
    Buat Soal Sendiri
  </Link>
</div>

    </div>
  </div>
);

const LandingPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
    <div style={{ scrollBehavior: "smooth" }}>
        {/* Navbar */}
      <nav className="bg-birutua shadow-md fixed top-0 left-0 w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-full">
          <div className="flex items-center space-x-4">
            {/* Tombol Hamburger untuk layar kecil */}
            <div className="md:hidden">
              {/* Tombol ini muncul hanya pada layar kecil */}
              <button
                className="focus:outline-none text-white"
                onClick={toggleSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="text-2xl font-bold text-white">
              <Link href="/">
                <img
                  src="/images/etamtest.png"
                  alt="EtamTest"
                  className="h-[30px] lg:h-10 pl-2"
                />
              </Link>
            </div>
          </div>

          {/* Menu Navigasi */}
          <ul className="hidden md:flex flex-wrap space-x-6">
            {/* Tambahkan flex-wrap agar item tidak saling bertumpuk */}
            {["Beranda", "Kategori", "Cara Kerja", "Tentang Kami", "Testimoni"].map(
              (item) => (
                <li key={item} className="whitespace-nowrap">
                  {/* whitespace-nowrap: Mencegah teks pecah ke baris baru */}
                  <a
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base"
                    onClick={(e) => {
                      e.preventDefault(); // Mencegah navigasi default
                      const targetId = item.toLowerCase().replace(" ", "-");
                      const targetElement = document.getElementById(targetId);
                      if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>

          {/* Tombol "Masuk" dan "Daftar" */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/auth/login"
              className="bg-transparent text-white border border-white py-2 px-4 rounded-md shadow-sm hover:bg-white hover:text-birutua transition duration-300 text-sm md:text-base"
            >
              Masuk
            </Link>
            <Link
              href="/auth/registrasi"
              className="bg-birulangit text-white py-2 px-4 rounded-md shadow-sm hover:bg-opacity-80 transition duration-300 text-sm md:text-base"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* Sidebar for mobile */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-birutua transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 md:hidden z-20`}
        >
          <div className="p-4 flex flex-col space-y-6">
            <div className="flex justify-between items-center mb-4">
              <Image
                src="/images/etamtest.png"
                alt="EtamTest"
                width={85}
                height={85}
                className="rounded-full"
              />
              <button onClick={toggleSidebar} className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {["Beranda", "Kategori", "Cara Kerja", "Tentang Kami", "Testimoni"].map(
  (item) => (
    <a
      key={item}
      href={`#${item.toLowerCase().replace(" ", "-")}`}
      className="text-white hover:text-gray-300"
      onClick={(e) => {
        e.preventDefault(); // Mencegah perilaku default anchor tag
        document
          .getElementById(item.toLowerCase().replace(" ", "-"))
          .scrollIntoView({ behavior: "smooth" }); // Smooth scroll ke elemen
        toggleSidebar(); // Tetap panggil fungsi toggleSidebar jika diperlukan
      }}
    >
      {item}
    </a>
  )
)}
            <Link
              href="/auth/login"
              className="bg-transparent text-white border border-white py-2 px-4 rounded-md shadow-sm hover:bg-white hover:text-birutua text-center transition duration-300"
            >
              Masuk
            </Link>
            <Link
              href="/auth/registrasi"
              className="bg-birulangit text-white py-2 px-4 rounded-md shadow-sm hover:bg-opacity-80 text-center transition duration-300"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

{/* Hero Section */}
<div
  id="beranda"
  className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center py-20 px-4 mt-16"
>
  <div className="flex flex-col-reverse md:flex-row items-center w-full max-w-6xl">
    <div className="w-full md:w-2/3 mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-lg md:text-4xl lg:text-5xl font-bold text-gray-800 mb-5" style={{ lineHeight: '1.3'}}>
            <span className="typing-effect">
              Tingkatkan Kemampuanmu
            </span>
            <br />
            <span className="typing-effect" style={{ animationDelay: '5s' }}>
              dengan Tes Soal Online
            </span>
            <br />
            <span className="typing-effect" style={{ animationDelay: '8s' }}>
              Terlengkap
            </span>
          </h1>
      <p className="text-1 md:text-xl lg:text-2xl text-gray-600 mb-8">
        Platform komunitas untuk membuat dan mengikuti tes pilihan ganda.
        Buat soal sendiri atau tantang diri dengan soal dari pengguna lain!
      </p>
      <div className="flex justify-center md:justify-start space-x-4">
        <Link
          href="/guestDashboard"
          className="bg-[#0B61AA] text-white py-2 px-4 md:py-3 md:px-6 rounded-md shadow-md hover:bg-opacity-80 transition duration-300 animate-bounce"
        >
          Mulai Test Sekarang
        </Link>
        <Link
          href="/auth/registrasi"
          className="bg-transparent text-[#0B61AA] border border-[#0B61AA] py-2 px-4 md:py-3 md:px-6 rounded-md shadow-md hover:bg-[#0B61AA] hover:text-white transition duration-300"
        >
          Buat Test Sendiri
        </Link>
      </div>
    </div>
    <div className="w-full md:w-1/3 mb-8 md:mb-0">
      <Image
        src="/images/Gambar 1.png"
        alt="Hero Image"
        width={500}
        height={500}
        className="w-full max-w-xs md:max-w-full h-auto mx-auto"
      />
    </div>
  </div>
  {/* Styles */}
  <style jsx>{`
        /* Animasi untuk teks */
        .typing-effect {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          animation: typing 4s steps(40) 1s forwards, blink 0.75s step-end infinite;
        }

        @keyframes typing {
          to {
            width: 100%;
          }
        }

        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
</div>

      {/* Kategori Section */}
<div id="kategori" className="bg-white min-h-screen flex items-center py-20 px-4">
  <div className="container mx-auto text-center w-full lg:max-w-7xl">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      Kategori Etamtest
    </h1>
    <p className="text-base md:text-lg text-gray-600 mb-10">
      Tes soal dikelompokkan berdasarkan kategori yang dibuat oleh author terpercaya dan berkualitas. Temukan kategori tes soal yang kamu butuhkan atau buat soal baru di kategori yang ada!
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
  {[
    {
      title: "CPNS",
      desc: "Tes soal online yang dapat membantu persiapan ujian CPNS.",
      icon: <AiOutlineStar size={48} color="#000000" />,
      bgColor: "#FFC74D",
    },
    {
      title: "Psikotes",
      desc: "Soal psikotes yang dibuat pengguna untuk pengembangan diri.",
      icon: <AiOutlineLaptop size={48} color="#000000" />,
      bgColor: "#4DFFD5",
    },
    {
      title: "Pemrograman",
      desc: "Tes pemrograman pilihan ganda dan essay yang dibangun bersama komunitas.",
      icon: <AiOutlineCode size={48} color="#000000" />,
      bgColor: "#FF4D50",
    },
    {
      title: "UTBK",
      desc: "Pengguna berbagi soal ujian sekolah yang relevan dan menantang.",
      icon: <AiOutlineBook size={48} color="#000000" />,
      bgColor: "#4DC7FF",
    },
  ].map((category, index) => (
    <div
      key={index}
      className="bg-[#CAE6F9] p-6 rounded-lg shadow-md hover:shadow-lg flex flex-col items-center transition-transform transform hover:-translate-y-2 hover:scale-105"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 overflow-hidden"
        style={{ backgroundColor: category.bgColor }}
      >
        {/* Ikon dimasukkan langsung tanpa <icon /> */}
        {category.icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-800">
        {category.title}
      </h2>
      <p className="text-gray-600 mt-2">{category.desc}</p>
    </div>
  ))}
</div>
</div>
</div>

      {/* Cara Kerja Section */}
      <div id="cara-kerja" className="bg-gradient-to-r from-[#DEF6FF] to-[#0B61AA] py-36 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row items-center lg:items-start">
        <div className="lg:w-1/3 mb-6 lg:mb-0">
  <Image
    src="/images/Gambar 2.png"
    alt="Cara Kerja"
    width={900}
    height={900}
    className="w-full h-auto"
  />
</div>
          <div className="lg:w-2/3 lg:ml-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Cara Kerja Platform Komunitas
            </h1>
            <ul className="space-y-4">
              {[
                {
                  title: "Daftar Akun",
                  desc: "Buat akun gratis dan mulai membuat atau mengikuti tes.",
                },
                {
                  title: "Buat Soal atau Pilih Tes",
                  desc: "Pilih untuk membuat soal baru di kategori yang tersedia atau ikuti tes yang sudah ada.",
                },
                {
                  title: "Kolaborasi dan Evaluasi",
                  desc: "Kamu dapat mencoba soal dari berbagai author, dan memberikan review!",
                },
              ].map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 text-xl font-bold mr-3 mt-1">
                    ✓
                  </span>
                  <span className="text-gray-800 text-base md:text-xl">
                    <strong>{step.title}:</strong>
                    <br />
                    {step.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tentang Kami Section */}
      <div id="tentang-kami" className="bg-white py-20 px-4">
  <div className="container mx-auto text-center">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10">
      Keuntungan Bergabung dengan Komunitas Kami
    </h1>
    {[
      {
        title: "Tes Dibuat oleh Author",
        desc: "Semua tes dibuat oleh author, memastikan soal yang relevan dan beragam.",
        img: "/images/Candle.png",
      },
      {
        title: "Membuat Soal",
        desc: "Buat soal untuk membantu komunitas atau tingkatkan kemampuanmu dengan soal dari author berkualitas.",
        img: "/images/Gift.svg",
      },
      {
        title: "Penilaian Otomatis",
        desc: "Dapatkan skor secara otomatis dan pelajari pembahasan soal yang dibuat oleh author.",
        img: "/images/Shapes.png",
      },
      {
        title: "Akses Fleksibilitas",
        desc: "Akses soal kapan saja dan di mana saja, melalui perangkat apa pun.",
        img: "/images/Smartphone.png",
      },
    ].map((benefit, index) => (
      <div
        key={index}
        className="flex flex-col md:flex-row items-center justify-between mb-10 md:gap-10"
      >
        {/* Teks di atas gambar untuk tampilan mobile */}
        <div
          className={`md:w-1/2 text-left sm:order-1 ${
            index % 2 === 0 ? "md:order-1" : "md:order-2"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {benefit.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mt-2">
              {benefit.desc}
          </p>
        </div>
        {/* Gambar di bawah teks untuk tampilan mobile */}
        <div
          className={`md:w-1/2 sm:order-2 ${
            index % 2 === 0 ? "md:order-2" : "md:order-1"
          } bg-[#CAE6F9] p-6 rounded-lg shadow-md hover:shadow-lg mt-4 md:mt-0 transform hover:scale-105 transition-transform duration-300`}
        >
          <Image
            src={benefit.img}
            alt={benefit.title}
            width={300}
            height={300}
            className="w-full h-48 object-contain"
          />
        </div>
      </div>
    ))}
  </div>
</div>


      {/* Testimoni Section */}
      <TestimonialsSection />

      {/* Section Baru di Bawah Testimoni */}
      <CallToActionSection />

      {/* Footer */}
<footer className="bg-[#0B61AA] py-10 text-white">
  <div className="container mx-auto px-4">
    {/* Layout Flex untuk Responsive */}
    <div className="flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
      {/* Logo dan Deskripsi */}
      <div className="w-full md:w-1/3">
        <div className="mb-4 md:mb-0">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/images/etamtest.png"
              alt="EtamTest"
              width={100}
              height={100}
              className="mb-2"
            />
          </div>
          {/* Deskripsi */}
          <p className="text-sm text-gray-200">
            Platform terbaik untuk membuat dan mengikuti tes online. Bergabunglah dengan komunitas kami untuk meningkatkan kemampuanmu!
          </p>
        </div>
      </div>

      {/* Quick Links dan Quotes (Sebelah di Mobile) */}
      <div className="w-full flex flex-col sm:flex-row sm:space-x-8 md:w-1/2">
        {/* Quick Links */}
        <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="text-sm text-gray-200">
            <li><a href="#beranda" className="hover:text-white">Beranda</a></li>
            <li><a href="#kategori" className="hover:text-white">Kategori</a></li>
            <li><a href="#cara-kerja" className="hover:text-white">Cara Kerja</a></li>
            <li><a href="#tentang-kami" className="hover:text-white">Tentang Kami</a></li>
            <li><a href="#testimoni" className="hover:text-white">Testimoni</a></li>
          </ul>
        </div>

        {/* Quotes */}
        <div className="w-full sm:w-1/2">
          <h3 className="text-lg font-semibold mb-2">Quotes</h3>
          <p className="text-sm text-gray-200 italic">
            "If you think that math is hard, <br />
            <span className="mt-2 block">better try to do web design" - Trish Parr</span>
          </p>
        </div>
      </div>

      {/* Follow Us */}
      <div className="w-full md:w-1/4 text-center md:text-left">
        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
        <div className="flex justify-center md:justify-start space-x-6">
          <a href="https://www.facebook.com" className="text-gray-200 hover:text-white" target="_blank" rel="noopener noreferrer">
            <IoLogoFacebook className="inline-block text-4xl"/>
          </a>
          <a href="https://www.linkedin.com" className="text-gray-200 hover:text-white" target="_blank" rel="noopener noreferrer">
            <AiFillLinkedin className="inline-block text-4xl"/>
          </a>
          <a href="https://www.instagram.com" className="text-gray-200 hover:text-white" target="_blank" rel="noopener noreferrer">
            <AiFillInstagram className="inline-block text-4xl"/>
          </a>
          <a href="https://www.tiktok.com" className="text-gray-200 hover:text-white" target="_blank" rel="noopener noreferrer">
            <AiFillTikTok className="inline-block text-4xl"/>
          </a>
        </div>
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-none mt-8 pt-4 text-sm text-gray-400 text-center">
      &copy; 2024 Etam Code. All Rights Reserved.
    </div>
  </div>
</footer>

</div>
</div>
  );
};

export default LandingPage;