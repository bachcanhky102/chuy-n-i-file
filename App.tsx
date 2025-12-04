import React, { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { ResultViewer } from './components/ResultViewer';
import { Button } from './components/Button';
import { convertFileToWordContent } from './services/geminiService';
import { FileData, ProcessingStatus } from './types';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelected = (selectedFile: FileData | null) => {
    setFile(selectedFile);
    setStatus(ProcessingStatus.IDLE);
    setResult('');
    setErrorMsg('');
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMsg('');
    setResult('');

    try {
      const text = await convertFileToWordContent(file);
      setResult(text);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error) {
      setStatus(ProcessingStatus.ERROR);
      setErrorMsg(error instanceof Error ? error.message : "Đã có lỗi không xác định.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-primary-600 shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Gemini DocuConverter</h1>
          </div>
          <div className="text-primary-100 text-sm font-medium hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
          
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Chuyển đổi PDF & Ảnh sang Văn bản</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sử dụng AI để trích xuất văn bản, bảng biểu từ tài liệu scan, PDF hoặc ảnh chụp màn hình với độ chính xác cao.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[500px]">
            {/* Left Column: Input */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">1. Chọn tài liệu</h3>
                <div className="flex-1 flex flex-col">
                  <Dropzone 
                    onFileSelected={handleFileSelected} 
                    selectedFile={file} 
                    disabled={status === ProcessingStatus.PROCESSING}
                  />
                  
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={handleConvert}
                      disabled={!file || status === ProcessingStatus.PROCESSING}
                      isLoading={status === ProcessingStatus.PROCESSING}
                      className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-primary-500/30 text-lg py-3"
                      icon={<ArrowRight size={20} />}
                    >
                      {status === ProcessingStatus.PROCESSING ? 'Đang phân tích...' : 'Chuyển đổi ngay'}
                    </Button>
                  </div>

                  {status === ProcessingStatus.ERROR && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start text-sm animate-fade-in">
                      <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 px-2">2. Kết quả</h3>
                <div className="flex-1">
                  <ResultViewer content={result} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Gemini DocuConverter. Built with React & Google Gemini API.
        </div>
      </footer>
    </div>
  );
};

export default App;