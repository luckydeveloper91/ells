import React, { useState } from 'react';
import { Prize } from '../../types';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface CodeGeneratorProps {
  prize: Prize;
  onGenerate: (prizeId: number, count: number) => Promise<string[]>;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ prize, onGenerate }) => {
  const [count, setCount] = useState(10);
  const [codes, setCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newCodes = await onGenerate(prize.id, count);
      setCodes(newCodes);
    } catch (error) {
      console.error('Error generating codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };
  
  const handleDownload = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prize.name.replace(/\s+/g, '-').toLowerCase()}-codes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Generate Codes for "{prize.name}"
      </h3>
      
      <div className="mb-6">
        <label htmlFor="codeCount" className="block text-sm font-medium text-gray-700 mb-2">
          Number of Codes to Generate
        </label>
        <div className="flex items-center">
          <input
            type="number"
            id="codeCount"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value))))}
            min="1"
            max="10000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ml-2 px-4 py-2 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-1" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
      
      {codes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-700">Generated Codes</h4>
            <div className="space-x-2">
              <button
                onClick={handleCopy}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy all codes"
              >
                <Copy className="w-5 h-5" />
                {copied && <span className="text-xs text-green-500 ml-1">Copied!</span>}
              </button>
              <button
                onClick={handleDownload}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Download as text file"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
            <ul className="space-y-1">
              {codes.map((code, i) => (
                <li key={i} className="font-mono text-sm border-b border-gray-100 pb-1">
                  {code}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeGenerator;