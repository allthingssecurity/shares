import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ClosingBalance, CapitalGains } from '../types';

interface ChartsProps {
  holdings: ClosingBalance[];
  capitalGains: CapitalGains;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#22c55e', '#eab308', '#64748b'
];

const formatCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};

const formatFullCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-gray-600">{formatFullCurrency(payload[0].value)}</p>
        <p className="text-gray-500 text-sm">{`${payload[0].payload.percentage?.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const Charts: React.FC<ChartsProps> = ({ holdings, capitalGains }) => {
  // Prepare portfolio composition data
  const totalValue = holdings.reduce((sum, h) => sum + h.closingAmt, 0);
  const portfolioData = holdings
    .filter(h => h.closingAmt > 0)
    .map(h => ({
      name: h.share,
      value: h.closingAmt,
      percentage: (h.closingAmt / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Prepare gains/loss data
  const gainsData = holdings
    .filter(h => h.realizedGain !== 0)
    .map(h => ({
      name: h.share,
      gain: h.realizedGain,
      isProfit: h.realizedGain >= 0
    }))
    .sort((a, b) => b.gain - a.gain);

  // Capital gains breakdown
  const cgBreakdown = [
    { name: 'LTCG', value: Math.max(0, capitalGains.totalLTCG || 0), color: '#10b981' },
    { name: 'STCG', value: Math.max(0, capitalGains.totalSTCG || 0), color: '#f59e0b' },
    { name: 'LTCG Loss', value: Math.abs(Math.min(0, capitalGains.totalLTCG || 0)), color: '#ef4444' },
    { name: 'STCG Loss', value: Math.abs(Math.min(0, capitalGains.totalSTCG || 0)), color: '#f97316' },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Composition */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Composition</h3>
        {portfolioData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value: string) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No holdings to display
          </div>
        )}
      </div>

      {/* Realized Gains/Losses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Realized Gains/Losses by Stock</h3>
        {gainsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gainsData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(value: any) => [formatFullCurrency(value), 'Gain/Loss']} />
              <Bar dataKey="gain" radius={[0, 4, 4, 0]}>
                {gainsData.map((entry, index) => (
                  <Cell 
                    key={`bar-${index}`} 
                    fill={entry.isProfit ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No realized gains/losses
          </div>
        )}
      </div>

      {/* Capital Gains Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Capital Gains Breakdown</h3>
        {cgBreakdown.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={cgBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {cgBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatFullCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No capital gains data
          </div>
        )}
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-900">LTCG Tax</p>
              <p className="text-sm text-blue-600">On gains above exemption</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {formatFullCurrency(capitalGains.ltcgTax?.totalTax || 0)}
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <p className="font-medium text-orange-900">STCG Tax</p>
              <p className="text-sm text-orange-600">On short term gains</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {formatFullCurrency(capitalGains.stcgTax?.totalTax || 0)}
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg text-white">
            <div>
              <p className="font-medium">Total Tax</p>
              <p className="text-sm text-gray-400">Including 4% cess</p>
            </div>
            <p className="text-2xl font-bold">
              {formatFullCurrency(capitalGains.totalTax || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
