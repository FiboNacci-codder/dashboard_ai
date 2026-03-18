import { useState, useEffect, useMemo, useRef } from 'react';
import { parseISO, isWithinInterval, subDays } from 'date-fns';
import { fetchSheetData } from '../services/sheetService';
import { ContactData, Configuration } from '../types';
import { calculateDashboardStats, calculateSedeStats, calculateIntentStats, getArenaHighlights } from '../utils/dataProcessing';

export function useDashboardData() {
  const [data, setData] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Configuration State
  const [config, setConfig] = useState<Configuration>(() => {
    const saved = localStorage.getItem('dashboard_config');
    const defaultSedeImages = {
      'Trujillo': 'https://picsum.photos/seed/trujillo/200',
      'Arequipa': 'https://picsum.photos/seed/arequipa/200',
      'Puno': 'https://picsum.photos/seed/puno/200',
      'Cusco': 'https://picsum.photos/seed/cusco/200',
      'Lima': 'https://picsum.photos/seed/lima/200'
    };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        sedeImages: parsed.sedeImages || defaultSedeImages
      };
    }
    
    return {
      commercials: [
        { id: '1', name: 'Carlos Ruiz', photoUrl: 'https://picsum.photos/seed/carlos/200', sede: 'Madrid' },
        { id: '2', name: 'Elena Sanz', photoUrl: 'https://picsum.photos/seed/elena/200', sede: 'Barcelona' },
        { id: '3', name: 'Marcos Gil', photoUrl: 'https://picsum.photos/seed/marcos/200', sede: 'Valencia' },
        { id: '4', name: 'Lucia Rey', photoUrl: 'https://picsum.photos/seed/lucia/200', sede: 'Sevilla' },
      ],
      sedeImages: defaultSedeImages
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_config', JSON.stringify(config));
  }, [config]);

  // Filters State
  const [selectedSede, setSelectedSede] = useState<string>('All');
  const [selectedIntent, setSelectedIntent] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Notifications State
  const [alerts, setAlerts] = useState<{ id: string; contactId: string; sede: string }[]>([]);
  const previousDataIds = useRef<Set<string>>(new Set());

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const sheetData = await fetchSheetData();
        setData(sheetData);
        setError(null);
      } catch (err) {
        setError('Failed to load data from Google Sheets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshKey]);

  useEffect(() => {
    if (data.length > 0) {
      if (previousDataIds.current.size === 0) {
        data.forEach(item => previousDataIds.current.add(item.ID_contacto));
        return;
      }

      const newItems = data.filter(item => !previousDataIds.current.has(item.ID_contacto));
      
      newItems.forEach(item => {
        if (item.Mensaje_incorrecto === 1) {
          setAlerts(prev => [...prev, { 
            id: Math.random().toString(36).substring(2, 9), 
            contactId: item.ID_contacto, 
            sede: item.Sede 
          }]);
        }
        previousDataIds.current.add(item.ID_contacto);
      });
    }
  }, [data]);

  // Derived filter options
  const sedes = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.Sede)))], [data]);
  const intents = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.Intent_detectado)))], [data]);

  // Derived Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSede = selectedSede === 'All' || item.Sede === selectedSede;
      const matchesIntent = selectedIntent === 'All' || item.Intent_detectado === selectedIntent;
      
      let matchesDate = true;
      if (dateRange !== 'All') {
        const date = parseISO(item.Fecha_registro);
        const now = new Date();
        if (dateRange === 'Last 7 Days') {
          matchesDate = isWithinInterval(date, { start: subDays(now, 7), end: now });
        } else if (dateRange === 'Last 30 Days') {
          matchesDate = isWithinInterval(date, { start: subDays(now, 30), end: now });
        } else if (dateRange === 'Custom' && customStartDate && customEndDate) {
          matchesDate = isWithinInterval(date, { 
            start: parseISO(customStartDate), 
            end: parseISO(customEndDate) 
          });
        }
      }
      
      return matchesSede && matchesIntent && matchesDate;
    });
  }, [data, selectedSede, selectedIntent, dateRange, customStartDate, customEndDate]);

  const stats = useMemo(() => calculateDashboardStats(filteredData), [filteredData]);
  const sedeStats = useMemo(() => calculateSedeStats(filteredData), [filteredData]);
  const intentStats = useMemo(() => calculateIntentStats(filteredData), [filteredData]);
  const arenaHighlights = useMemo(() => getArenaHighlights(sedeStats), [sedeStats]);

  return {
    data,
    loading,
    error,
    config,
    setConfig,
    alerts,
    removeAlert,
    triggerRefresh,
    
    // Filters state & setters
    selectedSede, setSelectedSede,
    selectedIntent, setSelectedIntent,
    dateRange, setDateRange,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    
    // Derived outputs
    sedes,
    intents,
    filteredData,
    stats,
    sedeStats,
    intentStats,
    arenaHighlights
  };
}
