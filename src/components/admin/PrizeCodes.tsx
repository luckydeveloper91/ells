import React, { useState, useEffect } from 'react';
import { PrizeCode, Prize } from '../../types';
import { Download, Search, Calendar, FileCode2  } from 'lucide-react';
import { supabase } from '../../services/apiService';

interface PrizeCodesProps {
  prizes: Prize[];
}

const PrizeCodes: React.FC<PrizeCodesProps> = ({ prizes }) => {
  const [codes, setCodes] = useState<PrizeCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  
  const fetchCodes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('prize_codes')
        .select(`
          *,
          prize:prizes (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (selectedPrize !== 'all') {
        query = query.eq('prize_id', selectedPrize);
      }
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      
      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end + ' 23:59:59');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCodes();
  }, [selectedPrize, dateRange]);
  
  const handleExport = () => {
    const csvContent = [
      ['Code', 'Prize', 'Status', 'Created Date', 'Used Date'].join(','),
      ...codes.map(code => [
        code.code,
        code.prize?.name || '',
        code.is_used ? 'Used' : 'Available',
        new Date(code.created_at).toLocaleDateString(),
        code.used_at ? new Date(code.used_at).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prize-codes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAvailableCodes = () => {
    const csvContent = [
      ['Code', 'Prize', 'Status', 'Created Date', 'Used Date'].join(','),
      ...codes
        .filter(code => !code.is_used) // Filter only unused codes
        .map(code => [
          code.code,
          code.prize?.name || '',
          'Available',
          new Date(code.created_at).toLocaleDateString(),
          '' // used_at will be empty since is_used is false
        ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unused-prize-codes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Prize Codes</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <select
              value={selectedPrize}
              onChange={(e) => setSelectedPrize(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Prizes</option>
              {prizes.map((prize) => (
                <option key={prize.id} value={prize.id}>
                  {prize.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>

          <button
            onClick={handleExportAvailableCodes}
            className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors text-sm"
          >
            <FileCode2 className="w-4 h-4 mr-1" />
            Export Available
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading codes...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prize
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {code.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{code.prize?.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      code.is_used 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {code.is_used ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code.used_at ? new Date(code.used_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {codes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No codes found matching the selected criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrizeCodes;