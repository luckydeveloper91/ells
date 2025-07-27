import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Prize, Settings, DrawResult } from '../types';

const supabase = createClient(
  'https://efwrsetknwndtizetoxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmd3JzZXRrbnduZHRpemV0b3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4NzkzMCwiZXhwIjoyMDY4MjYzOTMwfQ._d39ziiETuG8s6gjsWNlXezxtzN3wfDpyFAiQUrASyg'
);

export const usePrizes = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPrizes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true)
        .order('position');
      
      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error fetching prizes:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const savePrize = useCallback(async (prizeData: Partial<Prize>) => {
    try {
      if (prizeData.id) {
        const { error } = await supabase
          .from('prizes')
          .update({
            name: prizeData.name,
            description: prizeData.description,
            image: prizeData.image,
            probability: prizeData.probability,
            position: prizeData.position,
            is_active: prizeData.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', prizeData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prizes')
          .insert({
            name: prizeData.name,
            description: prizeData.description,
            image: prizeData.image,
            probability: prizeData.probability,
            position: prizeData.position,
            is_active: prizeData.isActive
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving prize:', error);
      throw error;
    }
  }, []);
  
  const deletePrize = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting prize:', error);
      throw error;
    }
  }, []);
  
  const generateCodes = useCallback(async (prizeId: number, count: number): Promise<string[]> => {
    try {
      const codes = Array(count).fill(0).map(() => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `${result.substring(0, 10)}`;
      });
      
      const { error } = await supabase
        .from('prize_codes')
        .insert(
          codes.map(code => ({
            prize_id: prizeId,
            code: code
          }))
        );
      
      if (error) throw error;
      return codes;
    } catch (error) {
      console.error('Error generating codes:', error);
      throw error;
    }
  }, []);
  
  return {
    prizes,
    loading,
    fetchPrizes,
    savePrize,
    deletePrize,
    generateCodes
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    title: 'Lucky Prize Draw',
    buttonText: 'SPIN',
    theme: 'default'
  });
  const [loading, setLoading] = useState(true);
  
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings({
          title: data.title,
          description: data.description,
          buttonText: data.button_text,
          backgroundImage: data.background_image,
          backgroundMusic: data.background_music,
          searchButton: data.search_button,
          backgroundInner: data.inner_background,
          spinButton: data.spin_button,
          theme: data.theme
        });

      console.log(data.inner_background);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const saveSettings = useCallback(async (newSettings: Settings) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          title: newSettings.title,
          description: newSettings.description,
          button_text: newSettings.buttonText,
          background_image: newSettings.backgroundImage,
          background_music: newSettings.backgroundMusic,
          theme: newSettings.theme,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  return {
    settings,
    loading,
    fetchSettings,
    saveSettings
  };
};

export const performLuckyDraw = async (code?: string): Promise<DrawResult> => {
  try {
    let selectedPrize: Prize | null = null;
    
    if (code) {
      // Check if code exists and is unused
      const { data: codeData, error: codeError } = await supabase
        .from('prize_codes')
        .select('*, prize:prizes(*)')
        .eq('code', code)
        .eq('is_used', false)
        .single();
      
      if (codeError) throw codeError;

      console.log("api::", codeData);
      if (codeData) {
        selectedPrize = codeData.prize;
        
        // Mark code as used
        await supabase
          .from('prize_codes')
          .update({
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('code', code);
      }
    } else {
      // Random draw based on probability
      const { data: prizes, error: prizesError } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true);
      
      if (prizesError) throw prizesError;
      if (!prizes?.length) throw new Error('No active prizes available');
      
      const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
      const rand = Math.random() * totalProbability;
      
      let cumulativeProbability = 0;
      for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (rand <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      // Fallback to first prize if somehow none was selected
      if (!selectedPrize && prizes.length > 0) {
        selectedPrize = prizes[0];
      }
    }
    
    const isWinner = !!selectedPrize;
    
    return isWinner
      ? {
          prizeId: selectedPrize.id,
          prizeName: selectedPrize.name,
          prizeImage: selectedPrize.image,
          isWinner: true,
          message: `Congratulations! You've won ${selectedPrize.name}!`,
          code: code
        }
      : {
          prizeId: 0,
          prizeName: "No Prize",
          isWinner: false,
          message: "Sorry, better luck next time!"
        };
  } catch (error) {
    console.error('Error performing lucky draw:', error);
    throw error;
  }
};

export const verifyPrizeCode = async (code: string): Promise<DrawResult> => {
  try {
    const { data, error } = await supabase
      .from('prize_codes')
      .select(`
        code,
        is_used,
        used_at,
        prize:prizes (
          id,
          name,
          image
        )
      `)
      .eq('code', code)
      .single();
    
    if (error) throw error;
    
    if (!data.is_used) {
      throw new Error('Code has not been used yet');
    }
    
    return {
      prizeId: data.prize.id,
      prizeName: data.prize.name,
      prizeImage: data.prize.image,
      isWinner: true,
      message: `This code was redeemed for ${data.prize.name} on ${new Date(data.used_at).toLocaleDateString()}`,
      code: data.code
    };
  } catch (error) {
    console.error('Error verifying prize code:', error);
    throw error;
  }
};

export const getDrawStats = async () => {
  try {
    // Fetch used prize codes with joined prize info
    const [prizesStats, dailyStats] = await Promise.all([
      supabase
        .from('prize_codes')
        .select(`
          prize:prizes (
            id,
            name
          )
        `)
        .eq('is_used', true),

      supabase.rpc('get_daily_stats', {
        days_back: 7
      })
    ]);

    if (prizesStats.error) throw prizesStats.error;
    if (dailyStats.error) throw dailyStats.error;

    console.log("first:", prizesStats);
    console.log("second:", dailyStats);

    const totalDraws = (dailyStats.data || []).reduce((sum, day) => sum + day.draws, 0);
    const totalWins = (dailyStats.data || []).reduce((sum, day) => sum + day.wins, 0);

    // Group used prize codes by prize.id
    const prizeMap = {};

    (prizesStats.data || []).forEach(entry => {
      const prize = entry.prize;
      if (!prize) return; // Skip if no prize info
      if (!prizeMap[prize.id]) {
        prizeMap[prize.id] = {
          prizeId: prize.id,
          prizeName: prize.name,
          count: 0
        };
      }
      prizeMap[prize.id].count += 1;
    });

    const prizeDistribution = Object.values(prizeMap).map(prize => ({
      ...prize,
      percentage: totalDraws ? (prize.count / totalDraws) * 100 : 0
    }));

    return {
      totalDraws,
      winCount: totalWins,
      lossCount: totalDraws - totalWins,
      prizeDistribution,
      dailyStats: dailyStats.data || []
    };

  } catch (error) {
    console.error('Error fetching draw stats:', error);
    throw error;
  }
};

export const getNewDrawStats = async () => {
  try {
    const { data: prizeCodes, error } = await supabase
      .from('prize_codes')
      .select(`
        id,
        is_used,
        prize_id,
        created_at,
        prizes (
          id,
          name
        )
      `);

    if (error) throw error;

    const totalCodes = prizeCodes.length;

    // Filter only used codes
    const usedCodes = prizeCodes.filter(code => code.is_used);

    // ✅ Filter wins: prize_id exists AND prize.name !== "Thank You"
    const validWins = usedCodes.filter(code =>
      code.prize_id !== null &&
      code.prizes?.name?.toLowerCase() !== 'thank you'
    );

    const totalDraws = usedCodes.length;
    const totalWins = validWins.length;

    // Group prize counts (excluding "Thank You")
    const prizeMap: Record<string, { prizeId: number; prizeName: string; count: number }> = {};
    validWins.forEach(code => {
      const prize = code.prizes;
      if (prize && prize.id) {
        if (!prizeMap[prize.id]) {
          prizeMap[prize.id] = {
            prizeId: prize.id,
            prizeName: prize.name,
            count: 0
          };
        }
        prizeMap[prize.id].count += 1;
      }
    });

    const prizeDistribution = Object.values(prizeMap).map(prize => ({
      ...prize,
      percentage: totalDraws ? (prize.count / totalDraws) * 100 : 0
    }));

    // Build daily stats
    const dailyMap: Record<string, { draws: number; wins: number }> = {};
    usedCodes.forEach(code => {
      const date = new Date(code.created_at).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { draws: 0, wins: 0 };
      }
      dailyMap[date].draws += 1;

      if (
        code.prize_id !== null &&
        code.prizes?.name?.toLowerCase() !== 'thank you'
      ) {
        dailyMap[date].wins += 1;
      }
    });

    const dailyStats = Object.entries(dailyMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, stats]) => ({
        date,
        draws: stats.draws,
        wins: stats.wins
      }));

    return {
      totalCodes,
      totalDraws,
      totalWins,
      winCount: totalWins,
      lossCount: totalDraws - totalWins,
      winRate: totalDraws ? (totalWins / totalDraws) * 100 : 0,
      prizeDistribution,
      dailyStats
    };

  } catch (err) {
    console.error("Error fetching draw stats:", err);
    throw err;
  }
};




export { supabase }