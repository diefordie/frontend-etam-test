'use client';
import React, { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from "../../../firebase/config";
import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AiOutlineCloseSquare } from 'react-icons/ai';
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsImage } from 'react-icons/bs';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2'; 
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false 
});
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const MembuatSoal = () => {
  const router = useRouter();
  const [testId, setTestId] = useState('');
  const [category, setCategory] = useState('');
  const [multiplechoiceId, setMultiplechoiceId] = useState('');
  const [pageName, setPageName] = useState('');
  const [question, setQuestion] = useState('');
  const [number, setNumber] = useState('');
  const [questionPhoto, setQuestionPhoto] = useState(null);
  const [weight, setWeight] = useState();
  const [discussion, setDiscussion] = useState('');
  const [options, setOptions] = useState([{ optionDescription: '', isCorrect: false }]);
  const [pages, setPages] = useState([{ questions: [] }]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(''); 
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testIdFromUrl = params.get("testId");
    const categoryFromUrl = params.get("category");
    const multiplechoiceIdFromUrl = params.get("multiplechoiceId");
    const pageNameFromUrl = params.get("pageName");
    const numberFromUrl = params.get("nomor");

    console.log("Fetched testId:", testIdFromUrl); 
    console.log("Fetched multiplechoiceId:", multiplechoiceIdFromUrl); 
    console.log("Raw pageName from URL:", pageNameFromUrl);

    if (pageNameFromUrl) {
      const decodedPageName = decodeURIComponent(pageNameFromUrl);
      console.log("Decoded pageName:", decodedPageName);
      setPageName(decodedPageName);
    }
    if (testIdFromUrl) {
      setTestId(testIdFromUrl);
    }
    if (multiplechoiceIdFromUrl) {
      setMultiplechoiceId(multiplechoiceIdFromUrl); 
    }
    if (numberFromUrl) setNumber(numberFromUrl);
  }, []);

  useEffect(() => {
    if (!multiplechoiceId) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`https://${URL}/api/multiplechoice/question/${multiplechoiceId}`);
        if (!response.ok) {
          const errorMessage = await response.text(); 
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        console.log('Response dari API:', data);
        // setPageName(data.pageName);
        setWeight(data.weight);
        setNumber(data.number);
        setQuestion(data.question);
        setOptions(data.option);
        setDiscussion(data.discussion);
        if (data.questionPhoto && data.questionPhoto !== "") {
          setQuestionPhoto(data.questionPhoto);
          console.log("Loaded question photo URL:", data.questionPhoto);
        } else {
          setQuestionPhoto(null);
        }

        if (data.option && Array.isArray(data.option)) {
          setOptions(data.option.map(opt => ({
            id: opt.id,
            optionDescription: opt.optionDescription,
            optionPhoto: opt.optionPhoto || null,
            isCorrect: opt.isCorrect || false,
            points: opt.points
          })));
          console.log('Options sebelum mapping:', data.option);
        }
        
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Terjadi kesalahan saat memuat data: ' + error.message);
      }
    };
  
    fetchData();
  }, [multiplechoiceId]);
  
  const addOption = () => {
    setOptions((prevOptions) => {
      if (prevOptions.length < 5) {
        return [...prevOptions, { optionDescription: '', points: '' }];
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Maksimal 5 opsi hanya diperbolehkan',
          text: 'Anda tidak dapat menambahkan lebih dari 5 opsi.',
          confirmButtonText: 'OK',
        });
        return prevOptions;
      }
    });
    if (options.length < 6) {
      setOptions([...options, { 
        optionDescription: '', 
        optionPhoto: null,
        // points: ''
        isCorrect: false 
      }]);
    }
  };

  // const handleOptionChange = (index, field, value) => {
  //   const newOptions = options.map((option, i) => 
  //     i === index ? { ...option, [field]: value } : option
  //   );
  //   setOptions(newOptions);
  // };

  const handleOptionChange = async (index, content, type) => {
    const newOptions = [...options];
    const currentOption = { ...newOptions[index] };
    
    switch (type) {
      case 'text':
        currentOption.optionDescription = content;
        currentOption.optionPhoto = null;
        break;
      case 'image':
        try {
          const imageRef = ref(storage, `options/${content.name + v4()}`);
          const snapshot = await uploadBytes(imageRef, content);
          const imageUrl = await getDownloadURL(snapshot.ref);
          currentOption.optionDescription = '';
          currentOption.optionPhoto = imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          return;
        }
        break;
      case 'points':
        currentOption.points = content;
        break;
    }
    newOptions[index] = currentOption;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index, // Set `true` untuk index yang dipilih, lainnya `false`
    }));
    console.log('Options setelah perubahan isCorrect:', newOptions);
    setOptions(newOptions);
  };
  
  const validateForm = () => {
    const allOptionsFilled = options.every(option => option.optionDescription.trim() !== '');
    const atLeastOneCorrect = options.some(option => option.isCorrect);
    return allOptionsFilled && atLeastOneCorrect;
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setWeight(value); 
    }
  }

  const loadPagesFromLocalStorage = () => {
    if (testId && typeof window !== 'undefined') {
      const savedPages = localStorage.getItem(`pages_${testId}`);
      if (savedPages) {
        return JSON.parse(savedPages);
      }
    }
    return null;
  };

  useEffect(() => {
    const savedPages = loadPagesFromLocalStorage();
    if (savedPages) {
        setPages(savedPages);
    }
  }, [testId]); 

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
      try {
        const localStorageKey = `pages-${testId}`;
        
        if (multiplechoiceId != null) {
          const response = await fetch(`https://${URL}/api/multiplechoice/question/${multiplechoiceId}`, {
            method: 'DELETE',
          });
    
          if (!response.ok) {
            router.push(`/author/buatSoal?testId=${testId}`);
          }
          
        }
  
        // 2. Ambil data pages dari localStorage
        const savedPages = localStorage.getItem(localStorageKey);
        console.log('Data sebelum dihapus:', savedPages);
  
        if (savedPages) {
          let pages = JSON.parse(savedPages);
          let deletedNumber = null;
          let deletedPageIndex = -1;
          
          pages.forEach((page, pageIndex) => {
            const questionIndex = page.questions.indexOf(parseInt(number));
            if (questionIndex !== -1) {
              deletedNumber = parseInt(number);
              deletedPageIndex = pageIndex;
              page.questions.splice(questionIndex, 1);
            }
          });
  
          if (deletedNumber !== null) {
            const allNumbers = pages.reduce((acc, page) => [...acc, ...page.questions], []);
        
            // Cek apakah ada soal dengan nomor yang lebih besar
            const hasLaterQuestions = allNumbers.some(num => num > deletedNumber);
            
            if (hasLaterQuestions) {
              const updatePromises = [];
              pages.forEach(page => {
                page.questions.forEach(originalNum => {
                  if (originalNum > deletedNumber) {
                    const newNum = originalNum - 1;
                    updatePromises.push(
                      fetch(`https://${URL}/api/multiplechoice/question/update-number`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          testId: testId,
                          oldNumber: originalNum,
                          newNumber: newNum
                        })
                      })
                    );
                  }
                });
              });
    
              // Tunggu semua update selesai
              await Promise.all(updatePromises);

              pages = pages.map(page => ({
                ...page,
                questions: page.questions.map(num => 
                  num > deletedNumber ? num - 1 : num
                ).sort((a, b) => a - b)
              }));
            }
    
            // Hapus halaman yang kosong
            pages = pages.filter(page => page.questions.length > 0);
            
            // Simpan perubahan ke localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(pages));
          }
        }
  
        router.push(`/author/buatSoal?testId=${testId}`);
        
      } catch (error) {
        console.error('Error saat menghapus soal:', error);
        alert('Terjadi kesalahan saat menghapus soal. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteJawaban = async (index, optionId) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);

    try {
      if (optionId) {
        const response = await fetch(`https://${URL}/api/multiplechoice/option/${optionId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            console.error('Failed to delete option:', response.statusText);
        } else {
          console.log('Opsi berhasil dihapus dari server');
        } 
      }
    } catch (error) {
        console.error('Error deleting option:', error);
    }
  };

  const handleBack = () => {
    console.log("testId:", testId);
    router.push(`/author/buatSoal?testId=${testId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const valid = validateForm();
    setIsValid(valid);

    if (!valid) {
      // Ganti alert dengan SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Semua opsi harus diisi dan satu opsi harus ditandai sebagai benar.',
      });
      return;
    }

    try {
      let uploadedImageUrl = questionPhoto;
      if (questionPhoto instanceof File) {
        const imageRef = ref(storage, `question/${questionPhoto.name + v4()}`);
        const snapshot = await uploadBytes(imageRef, questionPhoto);
        uploadedImageUrl = await getDownloadURL(snapshot.ref); 
      }

      const formattedOptions = options.map(option => ({
        optionDescription: option.optionDescription,
        optionPhoto: option.optionPhoto,
        points: parseFloat(option.points) || 0,
        isCorrect: option.isCorrect,
      }));

      const questionData = {
        pageName,
        question: question,
        number: parseInt(number),
        questionPhoto: uploadedImageUrl,
        weight: parseFloat(weight),
        discussion: discussion,
        options: formattedOptions
      };
  
      let response;
      let result;

      if (multiplechoiceId !== "null") {
        response = await fetch(`https://${URL}/api/multiplechoice/update-question/${multiplechoiceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
  
        if (response.ok) {
          result = await response.json();
          console.log('Update successful:', result);

          const existingPages = JSON.parse(localStorage.getItem(`pages_${testId}`)) || [];
          const updatedPages = existingPages.map(page => 
            page.id === multiplechoiceId 
              ? { ...questionData, id: multiplechoiceId }
              : page
          );
          localStorage.setItem(`pages_${testId}`, JSON.stringify(updatedPages));
        }
      } else {
        response = await fetch('https://${URL}/api/multiplechoice/add-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testId: testId,
            questions: [questionData],
          }),
        });
  
        if (response.ok) {
          result = await response.json();
          console.log('Response dari API:', result);
          const newMultiplechoiceId = result.data[0].id;
          console.log('MultiplechoiceId:', newMultiplechoiceId);

          localStorage.setItem('pageName', pageName);
          const existingPages = JSON.parse(localStorage.getItem(`pages_${testId}`)) || [];
          const newQuestion = { 
            id: newMultiplechoiceId,
            ...questionData,
          };
          existingPages.push(newQuestion);
          localStorage.setItem(`pages_${testId}`, JSON.stringify(existingPages));
        }
      }
  
      if (response.ok) {
        const encodedPageName = encodeURIComponent(pageName);
        router.push(`/author/buatSoal?testId=${testId}&pageName=${encodedPageName}`);
      } else {
        console.error('Failed to process request:', response.statusText);
      }
  
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderOptionContent = (option, index) => {
    if (option.optionPhoto) {
      return (
        <div className="relative">
          <img 
            src={option.optionPhoto} 
            alt={`Option ${index + 1}`} 
            className="max-w-full h-auto"
          />
          <button
            type="button"
            onClick={() => handleOptionChange(index, '', 'text')}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
          >
            <AiOutlineCloseSquare className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <textarea
          value={option.optionDescription}
          onChange={(e) => handleOptionChange(index, e.target.value, 'text')}
          className="w-full p-2 border rounded min-h-[100px]"
          placeholder="Tulis opsi jawaban atau masukkan gambar..."
        />
        <button
          type="button"
          onClick={() => document.getElementById(`optionInput-${index}`).click()}
          className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded"
        >
          <BsImage className="w-5 h-5" />
        </button>
        <input
          id={`optionInput-${index}`}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handleOptionChange(index, e.target.files[0], 'image')}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-0" style={{ maxWidth: '1440px' }}>
      <header className="bg-[#0B61AA] text-white p-4 sm:p-6 font-poppins" style={{ maxWidth: '1440px', height: '108px', marginLeft: '0'}}>
        <div className="container mx-auto flex justify-start items-center" style={{ marginLeft: '-76px' }}>
          <Link href="/author/buatSoal">
            <IoMdArrowRoundBack className="text-white text-2xl sm:text-3xl lg:text-4xl" />
          </Link>
          <Link href="/">
            <img src="/images/etamtest.png" alt="Etamtest" className="h-[50px]" style={{ maxWidth: '179px' }} />
          </Link>
        </div>
      </header>
  
      <nav className="bg-[#FFFF] text-black p-4 sm:p-6">
        <ul className="flex space-x-6 sm:space-x-20">
          <li>
            <button
              className={`w-[120px] sm:w-[220px] h-[48px] rounded-[20px] shadow-md font-bold font-poppins ${activeTab === 'buatTes' ? 'bg-[#78AED6]' : ''}`}
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
  
      <div className="container mx-auto lg: p-2 p-4 w-full" style={{ maxWidth: '1309px' }}>
        <header className='bg-[#0B61AA] font-bold font-poppins text-white p-4'>
          <div className="flex items-center justify-between">
            <span>{pageName}</span>
          </div>
        </header>
  
        <div className="bg-[#FFFFFF] border border-black p-4 rounded-lg shadow-md w-full mb-6 " >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className='mb-4'>
              <label htmlFor="soal">No.      </label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <div className='m'>
              <div className='border border-black bg-[#D9D9D9] p-2 rounded mb-4' style={{ maxWidth: '1309px', height: '250px' }}>
                <div className='p-4 flex justify-between items-center mb-0.5 w-full'>
                  <div className='flex items-center'>
                    <label className="block mb-2">Soal Pilihan Ganda</label>
                  </div>
                  <div className='flex items-center'>
                    <label className="font-medium-bold mr-2">Bobot</label>
                    <input
                      type="number"
                      step="0"
                      min="1"
                      id="weight"
                      value={weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setWeight(value);
                        }
                      }}
                      className="border p-2 w-full"
                      required
                    />
                  </div>
                </div>
                <ReactQuill 
                  value={question} 
                  onChange={setQuestion} 
                  modules={{
                    toolbar: [
                      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['bold', 'italic', 'underline'],
                      ['clean']
                    ],
                  }}
                  formats={[
                    'header',
                    'font',
                    'list',
                    'bullet',
                    'bold',
                    'italic',
                    'underline',
                  ]}
                  className='bg-white shadow-md rounded-md border border-gray-500'
                  style={{ maxWidth: '1220px', height: '150px', overflow: 'hidden' }}
                  placeholder='Buat Soal di sini...'
                  required 
                />
              </div>
            </div>

            <div className="mb-4">
            {typeof questionPhoto === 'string' && questionPhoto ? (
              <div className="mb-2">
                <img 
                  src={questionPhoto} 
                  alt="Question" 
                  className="max-w-md h-auto"
                />
                <button 
                  type="button"
                  onClick={() => setQuestionPhoto(null)}
                  className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  Hapus Gambar
                </button>
              </div>
            ) : (
              <input
                type="file"
                onChange={(event) => setQuestionPhoto(event.target.files[0])}
                className="border p-2 w-full"
                accept="image/*"
              />
            )}
            </div>
  
            <div>
              <h2 className="text-lg font-semi-bold mb-2">Jawaban</h2>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="w-full">
                    {renderOptionContent(option, index)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="flex items-center justify-between text-black font-bold px-4 rounded-[10px] border border-black space-x-2"
                    >
                      <input
                        type="radio"
                        id={`jawaban-${index}`}
                        name="jawabanBenar"
                        value={index}
                        checked={option.isCorrect}
                        onChange={() => handleCorrectOptionChange(index)}
                        className={`w-4 h-4 ${!isValid && !options.some(opt => opt.isCorrect) ? 'border border-red-700' : ''}`}
                      />
                      <span>Benar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteJawaban(index, option.id)}
                      className="ml-4"
                    >
                      <img
                        src="/img/Hapus.png" 
                        alt="Delete"
                        className="w-15 h-15 "
                      />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addOption} className="bg-[#7bb3b4] hover:bg-[#8CC7C8] text-black font-bold py-2 px-4 rounded-[15px] border border-black">
                + Tambah
              </button>
            </div>
  
            <div className="mb-4">
              <label className="block mb-2">Pembahasan</label>
              <ReactQuill 
                value={discussion} 
                onChange={setDiscussion} 
                modules={{
                  toolbar: [
                    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['bold', 'italic', 'underline'],
                    ['clean']
                  ]
                }}
                formats={[
                  'header',
                  'font',
                  'list',
                  'bullet',
                  'bold',
                  'italic',
                  'underline',
                ]}
                placeholder='Tulis kunci jawaban di sini...' />
            </div>
          </form>
          <div className='mt-4 flex justify-end space-x-4 -mr-2'>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDelete}
                className="bg-[#E58A7B] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
              >
                Hapus
              </button>
              </div>
              <div className="flex justify-end space-x-2">
              <button
                onClick={handleSubmit} 
                className="bg-[#E8F4FF] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
              >
                Simpan
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleBack}
                className="bg-[#A6D0F7] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
              >
                Kembali
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  ); 
};

export default MembuatSoal;