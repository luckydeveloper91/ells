import React, { useState, useEffect } from 'react';
import { Prize, Settings } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import PrizeList from './PrizeList';
import PrizeForm from './PrizeForm';
import SettingsForm from './SettingsForm';
import CodeGenerator from './CodeGenerator';
import PrizeCodes from './PrizeCodes';
import { Gift, Settings as SettingsIcon, BarChart, Key } from 'lucide-react';
import { usePrizes, useSettings } from '../../services/apiService';
import DrawStatistics from './DrawStatistics';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prizes');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  
  const { 
    prizes,
    loading: prizesLoading,
    fetchPrizes,
    savePrize,
    deletePrize,
    generateCodes
  } = usePrizes();
  
  const {
    settings,
    loading: settingsLoading,
    saveSettings
  } = useSettings();
  
  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);
  
  const handleEditPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowPrizeForm(true);
  };
  
  const handleAddPrize = () => {
    setSelectedPrize(null);
    setShowPrizeForm(true);
  };
  
  const handleGenerateCodes = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowCodeGenerator(true);
  };
  
  const handleSavePrize = async (prizeData: Partial<Prize>) => {
    await savePrize(prizeData);
    setShowPrizeForm(false);
    fetchPrizes();
  };
  
  const handleDeletePrize = async (id: number) => {
    await deletePrize(id);
    setShowPrizeForm(false);
    fetchPrizes();
  };
  
  const handleGenerateCodesSubmit = async (prizeId: number, count: number) => {
    return await generateCodes(prizeId, count);
  };
  
  const handleSaveSettings = async (newSettings: Settings) => {
    await saveSettings(newSettings);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Lucky Draw Admin</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 border-b border-gray-200">
          <TabsTrigger value="prizes" className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Prizes
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center">
            <Key className="w-4 h-4 mr-2" />
            Prize Codes
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prizes">
          {prizesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading prizes...</p>
            </div>
          ) : (
            <>
              {showPrizeForm ? (
                <PrizeForm
                  prize={selectedPrize || undefined}
                  onSave={handleSavePrize}
                  onCancel={() => setShowPrizeForm(false)}
                  onDelete={handleDeletePrize}
                />
              ) : showCodeGenerator && selectedPrize ? (
                <CodeGenerator
                  prize={selectedPrize}
                  onGenerate={handleGenerateCodesSubmit}
                />
              ) : (
                <PrizeList
                  prizes={prizes}
                  onEdit={handleEditPrize}
                  onAdd={handleAddPrize}
                  onGenerateCodes={handleGenerateCodes}
                />
              )}
              
              {(showPrizeForm || showCodeGenerator) && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowPrizeForm(false);
                      setShowCodeGenerator(false);
                    }}
                    className="text-amber-600 hover:text-amber-800 text-sm"
                  >
                    ← Back to prize list
                  </button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="codes">
          <PrizeCodes prizes={prizes} />
        </TabsContent>
        
        <TabsContent value="settings">
          {settingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading settings...</p>
            </div>
          ) : (
            <SettingsForm
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}
        </TabsContent>
        
        <TabsContent value="statistics">
          <DrawStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;