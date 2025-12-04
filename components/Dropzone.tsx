import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FileData } from '../types';
import { Upload, FileText, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';

interface DropzoneProps {
  onFileSelected: (file: FileData | null) => void;
  selectedFile: FileData | null;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, selectedFile, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    
    // Check types
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ file PDF và file ảnh (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part
      const base64Data = result.split(',')[1];
      
      onFileSelected({
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled) return;
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            // Rename pasted file
            const renamedFile = new File([file], `screenshot_${new Date().toISOString().slice(0,19).replace(/[:]/g,'-')}.png`, { type: file.type });
            processFile(renamedFile);
            break; 
          }
        }
      }
    }
  }, [disabled, processFile]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlInput = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = prompt("Nhập đường dẫn ảnh (URL) trực tiếp:\nLưu ý: Một số link có thể bị chặn do chính sách bảo mật của trang web đó.");
    if (!url) return;

    setIsLoadingUrl(true);
    try {
      // Try to fetch the image
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải ảnh từ đường dẫn này.");
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error("URL này không phải là file ảnh hợp lệ.");
      }

      // Create a file from the blob
      const fileName = url.split('/').pop()?.split('?')[0] || "image_from_url.jpg";
      const file = new File([blob], fileName, { type: blob.type });
      processFile(file);
    } catch (error) {
      console.error(error);
      alert("Không thể tải ảnh từ link này (có thể do chặn quyền truy cập/CORS).\n\nMẹo: Hãy mở ảnh đó ra, chuột phải chọn 'Sao chép hình ảnh' (Copy Image) rồi quay lại đây nhấn Ctrl+V.");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preview logic
  const isImage = selectedFile?.mimeType.startsWith('image/');

  if (selectedFile) {
    return (
      <div className="relative w-full h-full min-h-[300px] bg-primary-50/30 border-2 border-primary-200 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner group transition-all">
         <button 
          onClick={clearFile}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 ring-1 ring-gray-200"
          title="Xóa file"
        >
          <X size={20} />
        </button>

        {isImage ? (
          <div className="relative w-full flex justify-center">
            <img 
              src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} 
              alt="Preview" 
              className="max-h-[250px] object-contain rounded-lg shadow-sm mb-4 bg-white ring-1 ring-gray-100"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-primary-600 mb-4 bg-white p-6 rounded-full shadow-sm ring-4 ring-primary-50">
            <FileText size={48} />
          </div>
        )}
        
        <div className="text-center">
          <p className="font-semibold text-primary-900 truncate max-w-[250px]">{selectedFile.name}</p>
          <p className="text-xs text-primary-600 uppercase font-bold mt-1 inline-block bg-primary-100 px-2.5 py-1 rounded-full">
            {selectedFile.mimeType.split('/')[1].toUpperCase()} &bull; {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group select-none
        ${isDragging ? 'border-primary-500 bg-primary-50 scale-[1.01]' : 'border-primary-200 bg-white hover:border-primary-400 hover:bg-primary-50/30'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />
      
      <div className={`p-5 rounded-full bg-primary-50 text-primary-500 mb-5 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300 ${isDragging ? 'scale-110' : ''} shadow-sm ring-1 ring-primary-100`}>
        {isLoadingUrl ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        ) : (
          <Upload size={32} />
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">Tải tài liệu lên</h3>
      <p className="text-sm text-gray-500 text-center max-w-xs mb-6 leading-relaxed">
        Kéo thả file, click để chọn hoặc nhấn <br/>
        <span className="font-bold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200 shadow-sm mx-1">Ctrl + V</span> 
        để dán ảnh chụp màn hình
      </p>

      <div className="flex gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={handleUrlInput}
          className="flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700 bg-white hover:bg-primary-50 rounded-full border border-primary-200 shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <LinkIcon size={14} className="mr-2"/> Nhập Link Ảnh
        </button>
      </div>
      
      <div className="flex gap-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <span className="flex items-center hover:text-primary-600 transition-colors"><ImageIcon size={14} className="mr-1.5"/> Ảnh (PNG, JPG)</span>
        <span className="flex items-center hover:text-primary-600 transition-colors"><FileText size={14} className="mr-1.5"/> PDF</span>
      </div>
    </div>
  );
};