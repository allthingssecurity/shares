import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Info } from 'lucide-react';
import { TaxConfig } from '../types';

interface SettingsProps {
  taxConfig: TaxConfig;
  onUpdate: (config: Partial<TaxConfig>) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ taxConfig, onUpdate }) => {
  const [config, setConfig] = useState(taxConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setConfig(taxConfig);
  }, [taxConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onUpdate(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(taxConfig);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Configuration</h3>
        </div>
        <span className="text-sm text-gray-500">FY {config.financialYear}</span>
      </div>
      
      <div className="p-6">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Tax Rates as per Budget 2024-25</p>
            <p className="mt-1">These rates are configurable and can be updated as per latest budget announcements. Changes will recalculate tax liability.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LTCG Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Long Term Capital Gains (LTCG)
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.ltcg?.rate || 12.5}
                onChange={(e) => setConfig({
                  ...config,
                  ltcg: { ...config.ltcg, rate: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Current: 12.5% (as per Budget 2024-25)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exemption Limit (Rs.)
              </label>
              <input
                type="number"
                step="10000"
                value={config.ltcg?.exemptionLimit || 125000}
                onChange={(e) => setConfig({
                  ...config,
                  ltcg: { ...config.ltcg, exemptionLimit: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Current: Rs. 1,25,000 per year</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holding Period (months)
              </label>
              <input
                type="number"
                value={config.ltcg?.holdingPeriod || 12}
                onChange={(e) => setConfig({
                  ...config,
                  ltcg: { ...config.ltcg, holdingPeriod: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum holding for LTCG classification</p>
            </div>
          </div>

          {/* STCG Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Short Term Capital Gains (STCG)
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.stcg?.rate || 20}
                onChange={(e) => setConfig({
                  ...config,
                  stcg: { ...config.stcg, rate: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Current: 20% (as per Budget 2024-25)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health & Education Cess (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.stcg?.cess || 4}
                onChange={(e) => {
                  const cessValue = parseFloat(e.target.value);
                  setConfig({
                    ...config,
                    stcg: { ...config.stcg, cess: cessValue },
                    ltcg: { ...config.ltcg, cess: cessValue }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Applied on both LTCG and STCG</p>
            </div>
          </div>
        </div>

        {/* Tax Computation Formula Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Tax Computation Formula</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700">LTCG Tax:</p>
              <p>Tax = (LTCG - {config.ltcg?.exemptionLimit?.toLocaleString('en-IN') || '1,25,000'}) x {config.ltcg?.rate || 12.5}%</p>
              <p>+ 4% Cess on Tax</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">STCG Tax:</p>
              <p>Tax = STCG x {config.stcg?.rate || 20}%</p>
              <p>+ 4% Cess on Tax</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Changes
          </button>
          
          <div className="flex items-center space-x-4">
            {saveStatus === 'success' && (
              <span className="text-green-600 text-sm">Settings saved successfully!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 text-sm">Failed to save settings</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center px-6 py-2 rounded-lg font-medium transition-all
                ${isSaving 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
