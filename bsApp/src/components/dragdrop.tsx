import React, { useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import LoadingSpinner from './loadingspinner';
import type { ParsedData } from '../types/results';

interface DropZoneProps {
    parsedData: ParsedData | null;
  setParsedData: Dispatch<SetStateAction<ParsedData | null  >>;
}

function DropZone({ parsedData, setParsedData }: DropZoneProps  ) {
const [isLoading, setIsLoading] = useState<boolean>(false);
const [base64Image, setBase64Image] = useState<string | ArrayBuffer | null>(null);
const fileInputRef = useRef<HTMLInputElement | null>(null);


  const fileToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result); // This includes the data: URI prefix
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    if (!selectedFile) return;
    setIsLoading(true);

    fileToBase64(selectedFile)
  }

const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  
  // Drag handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const selectedFile = e.dataTransfer.files[0];
      setIsLoading(true);
      fileToBase64(selectedFile)
      e.dataTransfer.clearData();
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        const selectedFile = e.clipboardData.files[0];
        setIsLoading(true);
      fileToBase64(selectedFile)
      e.preventDefault();
    }
  };

useEffect(() => {
    if (!base64Image) return;

    const sendToServer = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/parsereceipt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await res.json();
        setParsedData(data);
      } catch (error) {

        console.error('Upload error:', error);
      }
    setIsLoading(false);

    };

    sendToServer();
  }, [base64Image]);
  

  return (
    <>
     
    <div
      onClick={handleContainerClick}
    onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
      aria-disabled={isLoading}
      id='file-upload-container'
      className={`${isLoading || parsedData ? "cursor-none w-50 h-15 text-xs" : "cursor-pointer w-[80vw] h-[40vh]"} transition-all duration-700 ease-in-out hover:text-gray-500 border-1 border-white border-dashed rounded-xl bg-transparent p-4 flex items-center justify-center align-center font-stylescript text-xl font-light `}
      tabIndex={0} // needed to focus and receive paste events
    >
    <div>
        {isLoading ? <LoadingSpinner/> : "click / drag / paste receipt"}
    </div>
    <input
        type="file"
        onChange={handleUpload}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />
    </div>
  </>)
}

export default DropZone
