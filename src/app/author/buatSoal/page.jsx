'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";
import { AiOutlineMore } from 'react-icons/ai';
import axios from 'axios'
import dotenv from 'dotenv';
import { Suspense } from 'react';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const KotakNomorInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testId, setTestId] = useState('');
  const [category, setCategory] = useState('');
  const [pages, setPages] = useState([]);
  const [multiplechoiceId, setMultiplechoiceId] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [activeTab, setActiveTab] = useState('KotakNomor');
  const [usedPageNames, setUsedPageNames] = useState(new Set());
  const [pagesWithContent, setPagesWithContent] = useState(new Set());
  const [options, setOptions] = useState(
      Array(5).fill({ 
        optionDescription: '', 
        optionPhoto: null, 
        points: '', 
        isCorrect: false 
      })
    );  

  const [pageNameOptions] = useState([
    'Tes Wawasan Kebangsaan',
    'Tes Karakteristik Pribadi',
    'Tes Intelegensi Umum'
  ]);

  useEffect(() => {
    const savedPages = localStorage.getItem(`pages-${testId}`);
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    } else {
      const initialPages = [{
        pageNumber: 1,
        questions: [1],
        pageName: category === 'CPNS' ? 'Tes Wawasan Kebangsaan' : 'Beri Nama Tes',
        isCPNSPage: category === 'CPNS'
      }];
      setPages(initialPages);
      localStorage.setItem(`pages-${testId}`, JSON.stringify(initialPages));
    }
  }, [testId]);

  useEffect(() => {
    const testIdFromUrl = searchParams.get("testId");
    const categoryFromUrl = searchParams.get("category");
    const multiplechoiceIdFromUrl = searchParams.get("multiplechoiceId");
    const pageNameFromUrl = searchParams.get("pageName");
    const numberFromUrl = searchParams.get("nomor");
  

    if (testIdFromUrl) {
      setTestId(testIdFromUrl);
      if (categoryFromUrl) {
        setCategory(categoryFromUrl);
        localStorage.setItem(`category-${testIdFromUrl}`, categoryFromUrl);
      } else {
        const savedCategory = localStorage.getItem(`category-${testIdFromUrl}`);
        if (savedCategory) {
          setCategory(savedCategory);
        }
      }
      fetchPagesFromDB(testIdFromUrl);
    }
  
    if (multiplechoiceIdFromUrl) {
      setMultiplechoiceId(multiplechoiceIdFromUrl);
    }
  
    if (pageNameFromUrl) {
      setPages((prevPages) => prevPages.map((page) => ({
        ...page,
        pageName: decodeURIComponent(pageNameFromUrl),
      })));
    }
  }, []);

  const getAllUsedNumbers = (pages) => pages.flatMap(page => page.questions);

  const getNextAvailableNumber = (pages) => {
    const usedNumbers = getAllUsedNumbers(pages);
    let nextNumber = 1;

    while (usedNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    return nextNumber;
  };

  const reorderAllPages = (pages) => {
    let nextNumber = 1;
    return pages.map(page => ({
      ...page,
      questions: page.questions.map(() => nextNumber++)
    }));
  };

  const getMaxQuestionNumberInPage = (page) => {
    if (Array.isArray(page.questions)) {
      return Math.max(...page.questions);
    }
    return 0;
  };

  const addQuestion = async (pageIndex) => {
    try {
      const maxQuestionNumber = getMaxQuestionNumberInPage(pages[pageIndex]);
      const multiplechoiceId = await fetchMultipleChoiceId(testId, maxQuestionNumber);

      if (!multiplechoiceId) {
        alert(`Silakan isi nomor soal ${maxQuestionNumber} terlebih dahulu.`);
        return;
      }
      const hasNextPages = pageIndex < pages.length - 1;
      
      if (hasNextPages) {
        const numbersToUpdate = pages.slice(pageIndex + 1).reduce((acc, page) => {
          return [...acc, ...(page.questions || [])];
        }, []);
        numbersToUpdate.sort((a, b) => b - a);

        for (const number of numbersToUpdate) {
          try {
            const questionId = await fetchMultipleChoiceId(testId, number);

            if (questionId) {
              await updateQuestionNumberInDB(testId, number, number + 1);
            }
          } catch (err) {
            console.warn(`Gagal update nomor soal ${number}:`, err);
            continue;
          }
        }
      }

      setPages(prevPages => {
        const updatedPages = [...prevPages];
        const currentPage = { ...updatedPages[pageIndex] };
        currentPage.questions = [...(currentPage.questions || []), maxQuestionNumber + 1];
        currentPage.questions.sort((a, b) => a - b);
        updatedPages[pageIndex] = currentPage;
        if (hasNextPages) {
          for (let i = pageIndex + 1; i < updatedPages.length; i++) {
            const nextPage = { ...updatedPages[i] };
            nextPage.questions = (nextPage.questions || []).map(num => num + 1);
            updatedPages[i] = nextPage;
          }
        }
  
        const finalPages = reorderAllPages(updatedPages);
        localStorage.setItem(`pages-${testId}`, JSON.stringify(finalPages));
        return finalPages;
      });
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const updateQuestionNumberInDB = async (testId, oldNumber, newNumber) => {
    try {
      await axios.put(`https://${URL}/api/multiplechoice/${testId}/questions/${oldNumber}`, {
        newQuestionNumber: newNumber
      });
    } catch (error) {
      console.error('Error updating question number:', error);
      throw error;
    }
  };

  const addPage = async () => {
    try {
      const nextNumber = getNextAvailableNumber(pages);
      const multiplechoiceId = await fetchMultipleChoiceId(testId, nextNumber - 1);
  
      if (!multiplechoiceId && nextNumber > 1) {
        alert(`Silakan isi nomor soal ${nextNumber - 1} terlebih dahulu.`);
        return;
      }

  
      setPages(prevPages => {
        if (category === 'CPNS') {
          const usedPageNames = new Set(prevPages.map(page => page.pageName));
          const availablePageNames = pageNameOptions.filter(name => !usedPageNames.has(name));
        

        
        if (availablePageNames.length === 0) {
          alert('Semua jenis tes sudah digunakan!');
          return prevPages;
        }
  
        const newPage = {
          pageNumber: prevPages.length + 1,
          questions: [nextNumber],
          pageName: availablePageNames[0],
          isCPNSPage: true
        };
  

  
        const updatedPages = [...prevPages, newPage];
        localStorage.setItem(`pages-${testId}`, JSON.stringify(updatedPages));
        return updatedPages;
      } else {
        const newPage = {
          pageNumber: prevPages.length + 1,
          questions: [nextNumber],
          pageName: 'Beri Nama Tes',
          isCPNSPage: false
        };
        
        const updatedPages = [...prevPages, newPage];
        localStorage.setItem(`pages-${testId}`, JSON.stringify(updatedPages));
        return updatedPages;
      }
    });
  } catch (error) {
    console.error('Error adding page:', error);
  }
  };

  const toggleDropdown = (pageIndex) => {
    setPages(prevPages => 
      prevPages.map((page, index) => ({
        ...page,
        isDropdownOpen: index === pageIndex ? !page.isDropdownOpen : false
      }))
    );
  };

  const closeDropdown = (pageIndex) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].isDropdownOpen = false;
    setPages(updatedPages);
  };  

  const checkPageContent = async (pageIndex) => {
    const page = pages[pageIndex];
    if (!page || !page.questions) return false;

    try {
      for (const questionNumber of page.questions) {
        const multiplechoiceId = await fetchMultipleChoiceId(testId, questionNumber);
        if (multiplechoiceId) {
          return true;
        }
      }
      return false; 
    } catch (error) {
      console.error('Error checking page content:', error);
      return false;
    }
  };

  useEffect(() => {
    const updatePagesWithContent = async () => {
      const newPagesWithContent = new Set();
      
      for (let i = 0; i < pages.length; i++) {
        const hasContent = await checkPageContent(i);
        if (hasContent) {
          newPagesWithContent.add(i);
        }
      }
      
      setPagesWithContent(newPagesWithContent);
    };

    updatePagesWithContent();
  }, [pages, testId]);

  const handleRename = async (pageIndex) => {
    const hasContent = await checkPageContent(pageIndex);

    if (hasContent) {
      alert('Halaman ini sudah memiliki soal. Nama halaman tidak dapat diubah.');
      return;
    }

    if (category === 'CPNS') {
      setIsRenaming(pageIndex);
      setRenameValue(pages[pageIndex].pageName);
    } else {
      setIsRenaming(pageIndex);
      setRenameValue(pages[pageIndex].pageName);
    }
  };

  const saveRename = async (pageIndex) => {
    try {
      if (!pages || !pages[pageIndex]) {
        console.error("Invalid page or pageIndex");
        return;
      }
  
      const currentPage = pages[pageIndex];
      const currentPageName = currentPage?.pageName;
  
      if (!currentPageName) {
        console.error("Current page name is missing");
        return;
      }
  
      if (!renameValue) {
        console.error("New page name is missing");
        return;
      }

      await fetch(`https://${URL}/api/multiplechoice/update-pageName`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: testId,
          pageIndex: pageIndex,
          // pageName: renameValue,
          currentPageName: currentPageName, 
          newPageName: renameValue, 
        }),
      });

      if (!currentPage || !currentPage.questions) {
        console.error("No questions found for the specified page number.");
        return;
      }

      const questionUpdates = currentPage.questions.map((questionNumber) => {
        return fetch(`https://${URL}/api/multiplechoice/update-question`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionNumber: questionNumber,
            pageName: renameValue,
          }),
        });
      });

      await Promise.all(questionUpdates);

      setPages((prevPages) => {
        const updatedPages = prevPages.map((page, index) => {
          if (index === pageIndex) {
            return { ...page, pageName: renameValue };
          }
          return page;
        });
        localStorage.setItem(`pages-${testId}`, JSON.stringify(updatedPages));
        return updatedPages;
      });
      setIsRenaming(null);
    } catch (error) {
      console.error("Error updating pageName:", error);
    }
  };

  const deletePage = async (pageIndex) => {
    if (confirm("Apakah Anda yakin ingin menghapus tes ini?")) {
      try {
        const pageToDelete = pages[pageIndex];
        const deleteResponse = await fetch(`https://${URL}/api/multiplechoice/delete-page`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testId: testId,
            pageName: pageToDelete.pageName
          })
        });
  
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete page');
        }
        const remainingPages = pages.slice(pageIndex + 1);
        const questionsToUpdate = remainingPages.flatMap(page => page.questions);
        for (const question of questionsToUpdate) {
          try {
            const newNumber = question - pageToDelete.questions.length;
            
            await fetch(`https://${URL}/api/multiplechoice/update-number`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                testId: testId,
                oldNumber: question,
                newNumber: newNumber
              })
            });
          } catch (error) {
            console.error(`Error updating question number ${question}:`, error);
          }
        }
        setPages(prevPages => {
          const updatedPages = prevPages
            .filter((_, index) => index !== pageIndex)
            .map((page, index) => {
              if (index >= pageIndex) {
                return {
                  ...page,
                  questions: page.questions.map(num => num - pageToDelete.questions.length)
                };
              }
              return page;
            });
          
          localStorage.setItem(`pages-${testId}`, JSON.stringify(updatedPages));
          return updatedPages;
        });
  
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('Terjadi kesalahan saat menghapus halaman.');
      }
    }
  };

  const fetchPagesFromDB = async (testId) => {
    try {
        const response = await fetch(`https://${URL}/api/multiplechoice/get-pages/${testId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch pages');
        }
        const data = await response.json();

        const savedCategory = localStorage.getItem(`category-${testId}`);
        const localPages = JSON.parse(localStorage.getItem(`pages-${testId}`) || '[]');
        
        if (data.pages && Array.isArray(data.pages)) {
            const mergedPages = localPages.map((localPage, index) => {
                const dbPageName = data.pages[index] || 'Beri Nama Tes';
                return {
                    ...localPage,
                    isCPNSPage: savedCategory === 'CPNS',
                    pageName: savedCategory === 'CPNS' && index === 0 ? 
                        'Tes Wawasan Kebangsaan' : dbPageName
                };
            });
            
            // Jika ada halaman baru dari DB yang belum ada di local storage
            while (mergedPages.length < data.pages.length) {
                const newPageIndex = mergedPages.length;
                mergedPages.push({
                    pageNumber: newPageIndex + 1,
                    pageName: data.pages[newPageIndex],
                    isCPNSPage: savedCategory === 'CPNS',
                });
            }

            setPages(mergedPages);
            localStorage.setItem(`pages-${testId}`, JSON.stringify(mergedPages));

          if (savedCategory === 'CPNS') {
            fetch(`https://${URL}/api/multiplechoice/update-pageName`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                testId: testId,
                pageIndex: 0,
                pageName: 'Tes Wawasan Kebangsaan',
              }),
            }).catch(error => {
              console.error("Error updating initial pageName:", error);
            });
          }
        } else {
          if (localPages.length > 0) {
            setPages(localPages);
          } else {
            const initialPages = [{
              pageNumber: 1,
              questions: [1],
              pageName: savedCategory === 'CPNS' ? 'Tes Wawasan Kebangsaan' : 'Beri Nama Tes',
              isCPNSPage: savedCategory === 'CPNS'
            }];
            setPages(initialPages);
            localStorage.setItem(`pages-${testId}`, JSON.stringify(initialPages));
          }
        }
    
    } catch (error) {
      console.error("Failed to fetch pages from DB:", error);
      const localPages = JSON.parse(localStorage.getItem(`pages-${testId}`) || '[]');
      if (localPages.length > 0) {
        setPages(localPages);
      } else {
        const savedCategory = localStorage.getItem(`category-${testId}`);
        const initialPages = [{
          pageNumber: 1,
          questions: [1],
          pageName: savedCategory === 'CPNS' ? 'Tes Wawasan Kebangsaan' : 'Beri Nama Tes',
          isCPNSPage: savedCategory === 'CPNS'
        }];
        setPages(initialPages);
        localStorage.setItem(`pages-${testId}`, JSON.stringify(initialPages));
      }
    }
  };

  const fetchMultipleChoiceId = async (testId, number) => {
    try {
      const response = await fetch(`https://${URL}/api/multiplechoice/${testId}/${number}`);
  
      if (response.status === 404) {
        console.warn(`Nomor soal ${number} belum dibuat.`);
        return null; 
      }
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return data.id; 
    } catch (error) {
      console.error('Error fetching multiplechoiceId:', error);
      return null; 
    }
  }; 

  const handleQuestionSelect = async (questionNumber, pageIndex) => {
    if (!testId) {
      console.error("testId is null. Cannot navigate.");
      return;  
    }
    
    const pageName = pages[pageIndex]?.pageName || '';

    const baseUrl = pageName === 'Tes Karakteristik Pribadi' 
      ? '/author/buatSoal/page2'
      : '/author/buatSoal/page1';
  
    let multiplechoiceId = await fetchMultipleChoiceId(testId, questionNumber);

    const formattedOptions = options.map(option => ({
      optionDescription: option.optionDescription,
      optionPhoto: option.optionPhoto,
      points: parseFloat(option.points),
      isCorrect: null,
    }));
  
    if (multiplechoiceId === "null" || !multiplechoiceId) {
      // Jika multiplechoiceId tidak ditemukan, buat yang baru
      const questionData = {
        pageName,
        number: questionNumber,
        question: '',  // Isi dengan nilai default atau kosong
        weight: 1,     // Isi dengan nilai default
        options: formattedOptions,
      };
  
      try {
        const response = await fetch(`https://${URL}/api/multiplechoice/add-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testId: testId,
            questions: [questionData],
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to create new question');
        }
  
        const result = await response.json();
        multiplechoiceId = result.data[0].id;  // Mengambil ID dari respons

      } catch (error) {
        console.error("Error creating new question:", error);
        // Handle error (misalnya, tampilkan pesan error ke pengguna)
        return;
      }
    }
  
    setSelectedNumber(questionNumber);
    
    // Gunakan multiplechoiceId yang baru dibuat atau yang sudah ada
    router.push(`${baseUrl}?testId=${testId}&category=${category}&multiplechoiceId=${multiplechoiceId}&nomor=${questionNumber}&pageName=${encodeURIComponent(pageName)}`);
  };
  
  const handleSave = () => {
    if (!testId) {
      console.error("testId is null. Cannot navigate.");
      return; 
    }

    router.push(`/author/buattes/publik/syarat?testId=${testId}`);
  };

  const renderPageNameInput = (pageIndex, page) => {

    const hasContent = pagesWithContent.has(pageIndex);

    if (category === 'CPNS') {
      const usedPageNames = new Set(
        pages
          .filter((p, idx) => idx !== pageIndex)
          .map(p => p.pageName)
      );

      const availableOptions = pageNameOptions.filter(
        option => !usedPageNames.has(option) || option === page.pageName
      );

      return (
        <div className="flex items-center">
          <select
            value={page.pageName}
            onChange={(e) => {
              if (hasContent) {
                alert('Halaman ini sudah memiliki soal. Nama halaman tidak dapat diubah.');
                return;
              }
              
              const newPageName = e.target.value;
              setPages(prevPages => {
                const updatedPages = prevPages.map((p, idx) => {
                  if (idx === pageIndex) {
                    return { ...p, pageName: newPageName };
                  }
                  return p;
                });
                localStorage.setItem(`pages-${testId}`, JSON.stringify(updatedPages));
                return updatedPages;
              });

              fetch(`https://${URL}/api/multiplechoice/update-pageName`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  testId: testId,
                  pageIndex: pageIndex,
                  pageName: newPageName,
                }),
              }).catch(error => {
                console.error("Error updating pageName:", error);
              });
            }}
            className={`text-black bg-white border rounded-md p-2 ${
              hasContent ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={hasContent}
          >
            {availableOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      if (isRenaming === pageIndex) {
        return (
          <div className="flex items-center">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className={`text-black p-1 border border-gray-300 rounded-md ${
                hasContent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={hasContent}
            />
            <button
              onClick={() => saveRename(pageIndex)}
              className={`ml-2 bg-white text-black px-2 py-1 rounded-md ${
                hasContent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={hasContent}
            >
              Save
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center">
            <h2 className="text-lg">{page.pageName}</h2>
            {!hasContent && (
              <button
                onClick={() => handleRename(pageIndex)}
                className="ml-2 text-sm text-gray-400 hover:text-gray-300"
              >
                ✏️
              </button>
            )}
          </div>
        );
      }
    }
  };  

  return (
    <div className="container mx-auto p-0" style={{ maxWidth: '1978px' }}>
      <header className="bg-[#0B61AA] text-white p-4 sm:p-6 font-poppins w-full"
        style={{ height: 'auto' }}>
        <div className="flex items-center max-w-[1978px] w-full px-2 sm:px-4 mx-auto">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-4">
            <IoMdArrowRoundBack className="text-white text-2xl sm:text-3xl lg:text-4xl" />
            <img src="/images/etamtest.png" alt="Etamtest" className="h-[40px] sm:h-[50px]" />
          </Link>
        </div>
      </header>

      <div className="w-full p-2">
        <nav className="bg-[#FFFF] text-black p-4">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:justify-around sm:gap-10">
            <li>
              <button
                className={`w-[100px] sm:w-[140px] md:w-[180px] px-2 sm:px-4 md:px-8 py-1 sm:py-2 md:py-4 rounded-full shadow-xl font-bold font-poppins text-xs sm:text-sm md:text-base ${
                  activeTab === 'KotakNomor' ? 'bg-[#78AED6]' : ''
                }`}
                onClick={() => setActiveTab('KotakNomor')}
              >
                Buat Soal
              </button>
            </li>
            <li>
              <button
                className={`w-[100px] sm:w-[140px] md:w-[180px] px-2 sm:px-4 md:px-8 py-1 sm:py-2 md:py-4 rounded-full shadow-xl font-bold font-poppins text-xs sm:text-sm md:text-base ${
                  activeTab === 'publikasi' ? 'bg-[#78AED6]' : ''
                }`}
              >
                Publikasi
              </button>
            </li>
          </ul>
        </nav>

        {Array.isArray(pages) && pages.map((page, pageIndex) => (
          <div key={page.pageNumber} className="my-4">
            <div className="flex justify-between items-center bg-[#0B61AA] text-white p-2" style={{ maxWidth: '100%', height: '61px' }}>
              {renderPageNameInput(pageIndex, page)}
  
              <div className="relative">
                <button 
                  className="text-white font-bold text-3xl sm:text-4xl md:text-4xl lg:text-4xl mr-1 p-2 sm:p-3"
                  onClick={() => toggleDropdown(pageIndex)}
                >
                  <AiOutlineMore />
                </button>
  
                {page.isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg z-10 p-1
                    before:content-[''] before:absolute before:-top-4 before:right-5 before:border-8
                    before:border-transparent before:border-b-white"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {category === 'CPNS' ? (
                      <button
                        onClick={() => {
                          deletePage(pageIndex);
                          closeDropdown(pageIndex);
                        }}
                        className="block px-4 py-2 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md"
                      >
                        Delete page
                      </button>
                    ) : (
                      <>
                        {/* <button
                          onClick={() => {
                            handleRename(pageIndex);
                            closeDropdown(pageIndex);
                          }}
                          className={`block px-4 py-2 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md ${
                            pagesWithContent.has(pageIndex) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={pagesWithContent.has(pageIndex)}
                        >
                          Rename
                        </button> */}
                        <button
                          onClick={() => {
                            deletePage(pageIndex);
                            closeDropdown(pageIndex); 
                          }}
                          className="block px-4 py-2 text-deepBlue text-sm text-gray-700 hover:bg-deepBlue hover:text-white rounded-md"
                        >
                          Delete page
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          <div className="mt-0"></div>
            <div className="flex flex-wrap p-4 gap-3 justify-start border border-gray-300" style={{ maxWidth: '100%', padding: '0 3%' }}>
              {Array.isArray(page.questions) && page.questions.map((question, questionIndex) => (
                <div
                  key={`${pageIndex}-${question}`}
                  className="flex flex-col items-center border border-gray-300 p-2 mb-5 mt-4 bg-white rounded-lg shadow-md cursor-pointer w-[50px] sm:w-[80px] md:w-[80px] h-[50px] sm:h-[80px] md:h-[80px] transition-all"
                  onClick={() => handleQuestionSelect(question, pageIndex)} 
                >
                  <span className="bg-white border rounded-full w-8 h-8 flex items-center justify-center mb-2 rounded-[15px] text-xs sm:text-sm md:text-base p-1">
                    {question}
                  </span>
                </div>
              ))}

              <div className="flex items-center mt-1 sm:mt-2">
                <button
                  onClick={() => addQuestion(pageIndex)}
                  className="bg-[#78AED6] hover:bg-[#C1DBF5] border border-black text-black px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base rounded-[10px] shadow-lg font-bold"
                >
                  + Soal
                </button>
              </div>
            </div>
          </div>
        ))}

      <div className="flex justify-between mt-4">
        <button
          onClick={addPage}
          className="bg-[#0B61AA] hover:bg-[#5A96C3] border border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base font-poppins rounded-[10px] text-white font-bold"
        >
          + Tambah Page
        </button>
        
        <div className="flex justify-end space-x-2 mr-4">
          <button
            onClick={handleSave} 
            className="bg-[#78AED6] hover:bg-[#C1DBF5] border border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base font-poppins rounded-[10px] text-black font-bold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default function KotakNomor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KotakNomorInner />
    </Suspense>
  );
}