import React, { useState, useEffect } from 'react';
import { getDrawStats, getNewDrawStats } from '../../services/apiService';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface DrawStats {
  totalDraws: number;
  winCount: number;
  lossCount: number;
  prizeDistribution: {
    prizeId: number;
    prizeName: string;
    count: number;
    percentage: number;
  }[];
  dailyStats: {
    date: string;
    draws: number;
    wins: number;
  }[];
}

const DrawStatistics: React.FC = () => {
  const [stats, setStats] = useState<DrawStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getNewDrawStats();
        setStats(data);
        console.log(data);
        setError(null);
      } catch (err) {
        setError('Failed to load statistics. Please try again later.');
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading statistics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p>No statistics available yet.</p>
      </div>
    );
  }
  
  const winRate = stats.totalDraws > 0 
    ? ((stats.winCount / stats.totalDraws) * 100).toFixed(1) 
    : '0.0';
  
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Codes</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalCodes}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Used</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalDraws}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Rate</h3>
          <p className="text-3xl font-bold text-amber-600">{winRate}%</p>
        </div>
      </div>
      
      {/* Prize distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <PieChartIcon className="w-5 h-5 mr-2 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-800">Prize Distribution</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prize
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.prizeDistribution.map((prize) => (
                <tr key={prize.prizeId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prize.prizeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prize.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prize.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-600 h-2.5 rounded-full" 
                        style={{ width: `${prize.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Daily statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <BarChartIcon className="w-5 h-5 mr-2 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-800">Daily Activity</h3>
        </div>
        
        <div className="h-64">
          {stats.dailyStats && stats.dailyStats.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No daily data available yet</p>
            </div>
          ) : (
            <div className="flex items-end h-full space-x-2">
              {stats.dailyStats.map((day) => {
                const maxValue = Math.max(
                  ...stats.dailyStats.map(d => Math.max(d.draws, d.wins))
                );
                const drawsHeight = (day.draws / maxValue) * 100;
                const winsHeight = (day.wins / maxValue) * 100;
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    {/* Draw bar */}
                    <div className="w-full flex flex-col items-center space-y-1">
                      <div 
                        className="w-full bg-blue-200 rounded-t"
                        style={{ height: `${drawsHeight}%` }}
                        title={`${day.draws} draws`}
                      ></div>
                      <div 
                        className="w-full bg-green-300 rounded-t"
                        style={{ height: `${winsHeight}%` }}
                        title={`${day.wins} wins`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-200 rounded mr-1"></div>
            <span className="text-xs text-gray-600">Draws</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-300 rounded mr-1"></div>
            <span className="text-xs text-gray-600">Wins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawStatistics;