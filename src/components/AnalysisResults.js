import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  const chartData = Object.entries(transactionsByDay || {}).map(([date, transactions]) => ({
    date,
    count: transactions.length,
  }));

  const lineChartData = chartData.map((entry, index, array) => ({
    ...entry,
    movingAverage: index < 6 ? null : 
      array.slice(index - 6, index + 1).reduce((sum, item) => sum + item.count, 0) / 7
  }));

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
          <h3 className="text-lg font-semibold mb-2">Average Prices</h3>
          <div className="h-48 overflow-y-auto">
            <ul className="list-disc list-inside">
              {Object.entries(averagePrices || {}).map(([item, prices], index) => (
                <li key={index}>
                  {cleanItemName(item)}: Buy: ${formatNumber(prices.buy)}, Sell: ${formatNumber(prices.sell)}
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
    </div>
  );
});

export default AnalysisResults;