import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ClosingBalance, Transaction } from '../types';

interface HoldingsTableProps {
  holdings: ClosingBalance[];
}

type SortField = 'share' | 'closingQty' | 'closingAmt' | 'realizedGain' | 'avgCostPrice';
type SortDirection = 'asc' | 'desc';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const TransactionRow: React.FC<{ transaction: Transaction; avgCost: number }> = ({ transaction, avgCost }) => {
  return (
    <tr className="bg-gray-50 text-sm">
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2 text-gray-600">
        {transaction.openingDate && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 mr-2">
            Opening: {formatDate(transaction.openingDate)}
          </span>
        )}
        {transaction.purchaseDate && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 mr-2">
            Buy: {formatDate(transaction.purchaseDate)}
          </span>
        )}
        {transaction.saleDate && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
            Sell: {formatDate(transaction.saleDate)}
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-gray-600">
        {transaction.openingQty > 0 && <span className="text-purple-600">+{transaction.openingQty}</span>}
        {transaction.purchaseQty > 0 && <span className="text-blue-600 ml-2">+{transaction.purchaseQty}</span>}
        {transaction.saleQty > 0 && <span className="text-orange-600 ml-2">-{transaction.saleQty}</span>}
      </td>
      <td className="px-4 py-2 text-gray-600">
        {transaction.openingAmt > 0 && <span className="text-purple-600">{formatCurrency(transaction.openingAmt)}</span>}
        {transaction.purchaseAmt > 0 && <span className="text-blue-600 ml-2">{formatCurrency(transaction.purchaseAmt)}</span>}
        {transaction.saleAmt > 0 && <span className="text-orange-600 ml-2">{formatCurrency(transaction.saleAmt)}</span>}
      </td>
      <td className="px-4 py-2">
        {transaction.gain !== undefined && (
          <span className={transaction.gain >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(transaction.gain)}
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        {transaction.gainType && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            transaction.gainType === 'LTCG' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {transaction.gainType}
          </span>
        )}
      </td>
    </tr>
  );
};

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
  const [sortField, setSortField] = useState<SortField>('share');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRow = (share: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(share)) {
      newExpanded.delete(share);
    } else {
      newExpanded.add(share);
    }
    setExpandedRows(newExpanded);
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'share':
        comparison = a.share.localeCompare(b.share);
        break;
      case 'closingQty':
        comparison = a.closingQty - b.closingQty;
        break;
      case 'closingAmt':
        comparison = a.closingAmt - b.closingAmt;
        break;
      case 'realizedGain':
        comparison = a.realizedGain - b.realizedGain;
        break;
      case 'avgCostPrice':
        comparison = a.avgCostPrice - b.avgCostPrice;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        ) : (
          <ArrowUpDown className="w-4 h-4 text-gray-300" />
        )}
      </div>
    </th>
  );

  // Calculate totals
  const totals = holdings.reduce(
    (acc, h) => ({
      openingQty: acc.openingQty + h.openingQty,
      openingAmt: acc.openingAmt + h.openingAmt,
      purchaseQty: acc.purchaseQty + h.purchaseQty,
      purchaseAmt: acc.purchaseAmt + h.purchaseAmt,
      saleQty: acc.saleQty + h.saleQty,
      saleAmt: acc.saleAmt + h.saleAmt,
      closingQty: acc.closingQty + h.closingQty,
      closingAmt: acc.closingAmt + h.closingAmt,
      realizedGain: acc.realizedGain + h.realizedGain,
      ltcg: acc.ltcg + h.ltcg,
      stcg: acc.stcg + h.stcg,
    }),
    { openingQty: 0, openingAmt: 0, purchaseQty: 0, purchaseAmt: 0, saleQty: 0, saleAmt: 0, closingQty: 0, closingAmt: 0, realizedGain: 0, ltcg: 0, stcg: 0 }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Holdings & Transactions</h3>
        <span className="text-sm text-gray-500">{holdings.length} stocks</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <SortHeader field="share">Stock</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchases</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
              <SortHeader field="closingQty">Closing Qty</SortHeader>
              <SortHeader field="closingAmt">Closing Value</SortHeader>
              <SortHeader field="avgCostPrice">Avg Cost</SortHeader>
              <SortHeader field="realizedGain">Gain/Loss</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHoldings.map((holding) => (
              <React.Fragment key={holding.share}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(holding.share)}
                >
                  <td className="px-4 py-4">
                    {expandedRows.has(holding.share) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">{holding.share}</td>
                  <td className="px-4 py-4 text-sm">
                    {holding.openingQty > 0 ? (
                      <div>
                        <span className="text-gray-900">{holding.openingQty} qty</span>
                        <br />
                        <span className="text-gray-500">{formatCurrency(holding.openingAmt)}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {holding.purchaseQty > 0 ? (
                      <div>
                        <span className="text-blue-600">+{holding.purchaseQty} qty</span>
                        <br />
                        <span className="text-gray-500">{formatCurrency(holding.purchaseAmt)}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {holding.saleQty > 0 ? (
                      <div>
                        <span className="text-orange-600">-{holding.saleQty} qty</span>
                        <br />
                        <span className="text-gray-500">{formatCurrency(holding.saleAmt)}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">{holding.closingQty}</td>
                  <td className="px-4 py-4 text-sm font-medium">{formatCurrency(holding.closingAmt)}</td>
                  <td className="px-4 py-4 text-sm">{formatCurrency(holding.avgCostPrice)}</td>
                  <td className="px-4 py-4">
                    {holding.realizedGain !== 0 ? (
                      <span className={`flex items-center ${
                        holding.realizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.realizedGain >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {formatCurrency(Math.abs(holding.realizedGain))}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4">
                    {holding.ltcg !== 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 mr-1">
                        LTCG
                      </span>
                    )}
                    {holding.stcg !== 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                        STCG
                      </span>
                    )}
                  </td>
                </tr>
                {expandedRows.has(holding.share) && holding.transactions.map((t, idx) => (
                  <TransactionRow 
                    key={`${holding.share}-${idx}`} 
                    transaction={t} 
                    avgCost={holding.avgCostPrice}
                  />
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-medium">
            <tr>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-gray-900">TOTAL</td>
              <td className="px-4 py-3 text-sm">
                {totals.openingQty} qty<br />
                <span className="text-gray-600">{formatCurrency(totals.openingAmt)}</span>
              </td>
              <td className="px-4 py-3 text-sm text-blue-600">
                +{totals.purchaseQty} qty<br />
                <span className="text-gray-600">{formatCurrency(totals.purchaseAmt)}</span>
              </td>
              <td className="px-4 py-3 text-sm text-orange-600">
                -{totals.saleQty} qty<br />
                <span className="text-gray-600">{formatCurrency(totals.saleAmt)}</span>
              </td>
              <td className="px-4 py-3">{totals.closingQty}</td>
              <td className="px-4 py-3">{formatCurrency(totals.closingAmt)}</td>
              <td className="px-4 py-3">-</td>
              <td className={`px-4 py-3 ${totals.realizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.realizedGain)}
              </td>
              <td className="px-4 py-3">
                <div className="text-xs">
                  {totals.ltcg !== 0 && <div className="text-green-600">LTCG: {formatCurrency(totals.ltcg)}</div>}
                  {totals.stcg !== 0 && <div className="text-yellow-600">STCG: {formatCurrency(totals.stcg)}</div>}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;
