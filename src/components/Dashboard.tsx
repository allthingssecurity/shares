import React from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, ShoppingCart, 
  DollarSign, PieChart, Calculator, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Summary, CapitalGains, TaxConfig } from '../types';

interface DashboardProps {
  summary: Summary;
  capitalGains: CapitalGains;
  taxConfig: TaxConfig;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}> = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className={`mt-1 text-sm flex items-center ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ summary, capitalGains, taxConfig }) => {
  const portfolioReturn = typeof summary.portfolioReturn === 'string' 
    ? parseFloat(summary.portfolioReturn) 
    : summary.portfolioReturn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h2>
          <p className="text-gray-500">Financial Year {taxConfig?.financialYear || '2025-2026'}</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          portfolioReturn >= 0 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          Portfolio Return: {formatPercentage(portfolioReturn)}
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Holdings"
          value={formatCurrency(summary.totalClosingValue || 0)}
          subtitle={`${summary.totalShares || 0} stocks`}
          icon={<Wallet className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Opening Value"
          value={formatCurrency(summary.totalOpeningValue || 0)}
          subtitle="Brought forward"
          icon={<PieChart className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Purchases"
          value={formatCurrency(summary.totalPurchaseValue || 0)}
          subtitle="This year"
          icon={<ShoppingCart className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(summary.totalSaleValue || 0)}
          subtitle="Proceeds received"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Capital Gains Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Realized Gains */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {summary.totalRealizedGain >= 0 ? (
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
              )}
              Capital Gains Summary
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Total Realized Gain/Loss</span>
              <span className={`text-xl font-bold ${
                summary.totalRealizedGain >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.totalRealizedGain || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-600">Long Term Capital Gains</span>
                <p className="text-xs text-gray-400">Holding &gt; 12 months</p>
              </div>
              <span className={`font-semibold ${
                (capitalGains.totalLTCG || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(capitalGains.totalLTCG || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <span className="text-gray-600">Short Term Capital Gains</span>
                <p className="text-xs text-gray-400">Holding &lt; 12 months</p>
              </div>
              <span className={`font-semibold ${
                (capitalGains.totalSTCG || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(capitalGains.totalSTCG || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Calculation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-primary-500" />
              Tax Calculation
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {/* LTCG Tax */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-800">LTCG Tax</span>
                <span className="text-sm text-blue-600">@ {taxConfig?.ltcg?.rate || 12.5}%</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-blue-700">
                  <span>Gross LTCG</span>
                  <span>{formatCurrency(capitalGains.totalLTCG || 0)}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Exemption (Sec 112A)</span>
                  <span>- {formatCurrency(capitalGains.ltcgExemption || 125000)}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-800 pt-1 border-t border-blue-200">
                  <span>Tax Payable</span>
                  <span>{formatCurrency(capitalGains.ltcgTax?.totalTax || 0)}</span>
                </div>
              </div>
            </div>

            {/* STCG Tax */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-orange-800">STCG Tax</span>
                <span className="text-sm text-orange-600">@ {taxConfig?.stcg?.rate || 20}%</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-orange-700">
                  <span>Gross STCG</span>
                  <span>{formatCurrency(capitalGains.totalSTCG || 0)}</span>
                </div>
                <div className="flex justify-between font-medium text-orange-800 pt-1 border-t border-orange-200">
                  <span>Tax Payable</span>
                  <span>{formatCurrency(capitalGains.stcgTax?.totalTax || 0)}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-gray-900 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Tax Liability</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(capitalGains.totalTax || 0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>Net Gain After Tax</span>
                <span className={capitalGains.netGain >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatCurrency(capitalGains.netGain || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
