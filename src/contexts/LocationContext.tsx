import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationData {
  currency: string;
  symbol: string;
  rate: number;
  country: string;
  city: string;
  addressSuggestion: string;
  loading: boolean;
}

interface LocationContextType extends LocationData {
  formatPrice: (amount: number) => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Static conversion rates (as a fallback/demo)
const EXCHANGE_RATES: Record<string, { symbol: string; rate: number }> = {
  'TZS': { symbol: 'TSh', rate: 2600 }, // 1 USD = 2600 TZS
  'USD': { symbol: '$', rate: 1 },
  'EUR': { symbol: '€', rate: 0.92 },
  'GBP': { symbol: '£', rate: 0.79 },
  'KES': { symbol: 'KSh', rate: 130 },
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LocationData>({
    currency: 'USD',
    symbol: '$',
    rate: 1,
    country: '',
    city: '',
    addressSuggestion: '',
    loading: true,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const result = await response.json();
        
        const currencyCode = result.currency || 'USD';
        const exchangeInfo = EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES['USD'];
        
        setData({
          currency: currencyCode,
          symbol: exchangeInfo.symbol,
          rate: exchangeInfo.rate,
          country: result.country_name || '',
          city: result.city || '',
          addressSuggestion: result.city && result.country_name 
            ? `${result.city}, ${result.country_name}`
            : result.country_name || '',
          loading: false,
        });
      } catch (error) {
        console.error('Location fetch failed:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchLocation();
  }, []);

  const formatPrice = (amount: number) => {
    const converted = amount * data.rate;
    // TZS usually doesn't show decimals
    const decimals = data.currency === 'TZS' ? 0 : 2;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return data.currency === 'TZS' 
      ? `${formatted} ${data.symbol}` 
      : `${data.symbol}${formatted}`;
  };

  return (
    <LocationContext.Provider value={{ ...data, formatPrice }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
