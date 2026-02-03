import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, LayoutDashboard, TableProperties, PieChart, Settings as SettingsIcon,
  Download, FileSpreadsheet, ChevronRight, Menu, X, RefreshCw
} from 'lucide-react';

import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import HoldingsTable from './components/HoldingsTable';
import Charts from './components/Charts';
import Settings from './components/Settings';

import { 
  uploadFile, getLedgerData, getTaxConfig, updateTaxConfig,
  exportNextYear, exportCurrentReport 
} from './services/api';

import { LedgerData, TaxConfig } from './types';

type TabType = 'upload' | 'dashboard' | 'holdings' | 'charts' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
  const [taxConfig, setTaxConfig] = useState<TaxConfig | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tax config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getTaxConfig();
        setTaxConfig(config);
      } catch (err) {
        console.error('Failed to load tax config:', err);
      }
    };
    loadConfig();
  }, []);

  // Try to load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const data = await getLedgerData();
        if (data && data.closingBalances && data.closingBalances.length > 0) {
          setLedgerData(data);
          setActiveTab('dashboard');
        }
      } catch (err) {
        // No existing data, that's fine
      }
    };
    loadExistingData();
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadFile(file);
      if (result && (result as any).sessionId) {
        try { localStorage.setItem('sid', (result as any).sessionId as string); } catch(e) {}
      }
      setLedgerData(result);
      if (result.taxConfig) {
        setTaxConfig(result.taxConfig);
      }
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfigUpdate = useCallback(async (config: Partial<TaxConfig>) => {
    try {
      const result = await updateTaxConfig(config);
      setTaxConfig(result.config);
      // Recalculate if we have data
      if (ledgerData) {
        const newData = await getLedgerData();
        setLedgerData(newData);
      }
    } catch (err: any) {
      throw err;
    }
  }, [ledgerData]);

  const handleRefresh = useCallback(async () => {
    if (!ledgerData) return;
    setIsLoading(true);
    try {
      const data = await getLedgerData();
      setLedgerData(data);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ledgerData]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; requiresData?: boolean }[] = [
    { id: 'upload', label: 'Upload Ledger', icon: <Upload className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, requiresData: true },
    { id: 'holdings', label: 'Holdings', icon: <TableProperties className="w-5 h-5" />, requiresData: true },
    { id: 'charts', label: 'Analytics', icon: <PieChart className="w-5 h-5" />, requiresData: true },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 
        ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} 
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div className="flex items-center">
              <FileSpreadsheet className="w-8 h-8 text-primary-600" />
              <span className="ml-2 font-bold text-gray-900">Shares Ledger</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {tabs.map((tab) => {
            const isDisabled = tab.requiresData && !ledgerData;
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center px-4 py-3 text-left transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' 
                    : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className={`${isSidebarOpen ? '' : 'mx-auto'}`}>{tab.icon}</span>
                {isSidebarOpen && (
                  <>
                    <span className="ml-3 font-medium">{tab.label}</span>
                    {tab.requiresData && !ledgerData && (
                      <span className="ml-auto text-xs text-gray-400">Upload first</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Export Buttons */}
        {ledgerData && isSidebarOpen && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <a
              href={exportCurrentReport()}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </a>
            <a
              href={exportNextYear()}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Next Year Opening
            </a>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {ledgerData && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            <div className="text-sm text-gray-500">
              FY {taxConfig?.financialYear || '2025-2026'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Your Shares Ledger
                </h2>
                <p className="text-gray-600">
                  Upload an Excel file with your share transactions to compute balances and capital gains tax
                </p>
              </div>
              <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
              
              {/* Expected Format */}
              <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Expected Excel Format</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Shares</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Op Dt</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Op Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Op Amt</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Pur Dt</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Pur Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Pur Amt</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sale Dt</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sale Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sale Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-3 py-2 text-gray-600">TCS</td>
                        <td className="px-3 py-2 text-gray-600">15-May-2023</td>
                        <td className="px-3 py-2 text-gray-600">50</td>
                        <td className="px-3 py-2 text-gray-600">165000</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">20-Aug-2025</td>
                        <td className="px-3 py-2 text-gray-600">20</td>
                        <td className="px-3 py-2 text-gray-600">84000</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-gray-600">TCS</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">10-Jun-2025</td>
                        <td className="px-3 py-2 text-gray-600">30</td>
                        <td className="px-3 py-2 text-gray-600">102000</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Multiple rows can be used for the same stock to record different transactions.
                  Opening balance is from previous year, purchases and sales are in current year.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && ledgerData && taxConfig && (
            <Dashboard 
              summary={ledgerData.summary} 
              capitalGains={ledgerData.capitalGains}
              taxConfig={taxConfig}
            />
          )}

          {activeTab === 'holdings' && ledgerData && (
            <HoldingsTable holdings={ledgerData.closingBalances} />
          )}

          {activeTab === 'charts' && ledgerData && (
            <Charts 
              holdings={ledgerData.closingBalances} 
              capitalGains={ledgerData.capitalGains}
            />
          )}

          {activeTab === 'settings' && taxConfig && (
            <Settings taxConfig={taxConfig} onUpdate={handleConfigUpdate} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
