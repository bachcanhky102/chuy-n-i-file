import React, { useState, useEffect } from 'react';
import { Copy, Check, FileText, Download, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ResultViewerProps {
  content: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  // Effect to clean content whenever it changes
  useEffect(() => {
    if (!content) {
      setDisplayContent('');
      return;
    }
    // Remove markdown code fences if they exist (extra safety)
    let clean = content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
    // Trim extra newlines at start
    clean = clean.trim();
    setDisplayContent(clean);
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([displayContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "ket_qua_chuyen_doi.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadWord = () => {
    // Basic HTML wrapper to trick Word into opening it nicely
    // CSS white-space: pre-wrap helps preserve the layout of the markdown text including tables
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Export to Word</title>
        <style>
          body { 
            font-family: 'Calibri', 'Segoe UI', sans-serif; 
            font-size: 11pt; 
            line-height: 1.5;
            white-space: pre-wrap; 
            padding: 20px;
          }
        </style>
      </head>
      <body>${displayContent}</body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = "ket_qua_chuyen_doi.doc";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  if (!displayContent) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 border-dashed group">
        <div className="bg-white p-5 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
          <Sparkles size={32} className="opacity-50 text-primary-400" />
        </div>
        <p className="text-center font-semibold text-gray-500">Kết quả chuyển đổi sẽ hiển thị tại đây</p>
        <p className="text-center text-xs mt-2 text-gray-400 max-w-[220px]">
          Văn bản được định dạng tự động để tương thích tốt nhất khi dán vào Word/Google Docs
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[300px] bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden ring-1 ring-gray-950/5">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50/50 to-white border-b border-gray-100 flex-wrap gap-2">
        <h3 className="font-bold text-gray-700 flex items-center text-sm whitespace-nowrap">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mr-2 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
          Kết quả
        </h3>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button 
            variant="ghost" 
            onClick={handleDownloadMarkdown}
            className="!px-2.5 !py-1.5 text-xs h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent"
            title="Tải xuống file Markdown (.md)"
          >
             <Download size={14} className="mr-1.5" /> .MD
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDownloadWord}
            className="!px-2.5 !py-1.5 text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent"
            title="Tải xuống file Word (.doc)"
          >
             <FileText size={14} className="mr-1.5" /> Word
          </Button>
          <Button 
            variant={copied ? "primary" : "outline"} 
            onClick={handleCopy}
            className={`!px-4 !py-1.5 text-xs h-8 transition-all duration-300 font-bold tracking-wide shadow-sm whitespace-nowrap
              ${copied 
                ? 'bg-primary-600 border-primary-600 hover:bg-primary-700 ring-primary-200' 
                : 'hover:border-primary-300 hover:text-primary-700 text-gray-600'
              }`}
          >
            {copied ? (
              <>
                <Check size={14} className="mr-1.5" /> ĐÃ COPY
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1.5" /> COPY
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="relative flex-1 bg-white">
        <textarea
          readOnly
          value={displayContent}
          className="w-full h-full p-5 font-mono text-sm leading-relaxed text-gray-800 resize-none focus:outline-none selection:bg-primary-100 selection:text-primary-900"
          style={{ minHeight: '300px' }}
          placeholder="Đang chờ kết quả..."
        />
      </div>
    </div>
  );
};
