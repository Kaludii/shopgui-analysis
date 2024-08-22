import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';
import DataTable from './DataTable';

const formatNumber = (num) => {
  return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";
};

const formatInteger = (num) => {
  return num ? Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
};

const cleanItemName = (name) => {
  return name ? name.split('(')[0].trim() : "";
};

const AnalysisResults = React.memo(({ data }) => {
  const { totalTransactions, totalEarners, totalSpenders, popularItems, leastPopularItems, averagePrices, transactionsByDay, topSpenders, topEarners, mostActiveTraders } = data;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const chartData = Object.entries(transactionsByDay || {}).map(([date, transactions]) => ({
    date,
    count: transactions.length,
  }));

  const lineChartData = chartData.map((entry, index, array) => ({
    ...entry,
    movingAverage: index < 6 ? null : 
      array.slice(index - 6, index + 1).reduce((sum, item) => sum + item.count, 0) / 7
  }));

  const tableData = useMemo(() => {
    return Object.entries(averagePrices || {}).map(([item, prices]) => ({
      name: cleanItemName(item),
      avgBuy: prices.buy,
      avgSell: prices.sell,
      highestPrice: Math.max(prices.buy, prices.sell),
      lowestPrice: Math.min(prices.buy, prices.sell),
    }));
  }, [averagePrices]);

  const mostImpactfulItems = useMemo(() => {
    return Object.entries(averagePrices || {})
      .map(([item, prices]) => {
        // Only consider items that are sellable (have a sell price)
        if (prices.sell === 0) {
          return null;
        }
        const profitMargin = prices.sell - prices.buy;
        const profitPercentage = ((prices.sell - prices.buy) / Math.abs(prices.buy)) * 100;
        return {
          name: cleanItemName(item),
          profitMargin,
          profitPercentage
        };
      })
      .filter(item => item !== null && item.profitPercentage < 0) // Remove null items and keep only negative percentages
      .sort((a, b) => b.profitPercentage - a.profitPercentage) // Sort from least negative to most negative
      .slice(0, 5);
  }, [averagePrices]);

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Item Name", "Average Buy Price", "Average Sell Price", "Highest Price", "Lowest Price"],
      ...tableData.map(item => [
        item.name,
        item.avgBuy,
        item.avgSell,
        item.highestPrice,
        item.lowestPrice
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "price_analysis.csv");
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">{formatInteger(totalTransactions)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Earners</h3>
          <p className="text-3xl font-bold">{formatInteger(totalEarners)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Spenders</h3>
          <p className="text-3xl font-bold">{formatInteger(totalSpenders)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Most Popular Items</h3>
          <ul className="list-disc list-inside">
            {(popularItems || []).map((item, index) => (
              <li key={index}>{cleanItemName(item.name)}: {formatInteger(item.count)} (Buy: ${formatNumber(item.avgBuyPrice)}, Sell: ${formatNumber(item.avgSellPrice)})</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Least Popular Items</h3>
          <ul className="list-disc list-inside">
            {(leastPopularItems || []).map((item, index) => (
              <li key={index}>{cleanItemName(item.name)}: {formatInteger(item.count)} (Buy: ${formatNumber(item.avgBuyPrice)}, Sell: ${formatNumber(item.avgSellPrice)})</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Most Impactful Items</h3>
          <div className="h-48 overflow-y-auto">
            <ul className="list-disc list-inside">
              {mostImpactfulItems.map((item, index) => (
                <li key={index}>
                  {item.name}: ${formatNumber(item.profitMargin)} margin ({formatNumber(item.profitPercentage)}% change)
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Top Spenders</h3>
          <ul className="list-disc list-inside">
            {(topSpenders || []).map(({ player, amount }, index) => (
              <li key={index}>{player}: ${formatNumber(amount)}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Top Earners</h3>
          <ul className="list-disc list-inside">
            {(topEarners || []).map(({ player, amount }, index) => (
              <li key={index}>{player}: ${formatNumber(amount)}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Most Active Traders</h3>
          <ul className="list-disc list-inside">
            {(mostActiveTraders || []).map(({ player, bought, sold }, index) => (
              <li key={index}>{player}: {formatInteger(bought + sold)} transactions</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Transactions by Day</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64">
            <h4 className="text-md font-semibold mb-2">Daily Transactions</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Total Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <h4 className="text-md font-semibold mb-2">Transaction Trend (7-day Moving Average)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="movingAverage" stroke="#82ca9d" name="7-day Moving Average" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Detailed Price Analysis</h3>
        <DataTable 
          data={tableData} 
          onSort={handleSort} 
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  );
});

export default AnalysisResults;