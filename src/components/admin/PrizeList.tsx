import React from 'react';
import { Prize } from '../../types';
import { Edit, PlusCircle, Key } from 'lucide-react';

interface PrizeListProps {
  prizes: Prize[];
  onEdit: (prize: Prize) => void;
  onAdd: () => void;
  onGenerateCodes: (prize: Prize) => void;
}

const PrizeList: React.FC<PrizeListProps> = ({ 
  prizes, 
  onEdit, 
  onAdd,
  onGenerateCodes
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Prizes</h2>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Prize
        </button>
      </div>
      
      {prizes.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">No prizes added yet. Click "Add Prize" to create your first prize.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prizes.map((prize) => (
                <tr key={prize.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {prize.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prize.name}</div>
                    {prize.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {prize.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prize.probability}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prize.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prize.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prize.image ? (
                      <img 
                        src={prize.image} 
                        alt={prize.name} 
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/100x100?text=?';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                        <span className="text-gray-400">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onGenerateCodes(prize)}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Codes
                    </button>
                    <button
                      onClick={() => onEdit(prize)}
                      className="text-amber-600 hover:text-amber-900 inline-flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrizeList;