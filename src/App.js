import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import PlayerSearch from './components/PlayerSearch';
import DateRangeSelector from './components/DateRangeSelector';
import { parseLogFile } from './utils/logParser';

const App = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pluginType, setPluginType] = useState('EconomyShopGUI');
  const [fileName, setFileName] = useState(null);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isValidFileType(file, pluginType)) {
        throw new Error("Invalid file type. Please upload the correct file format.");
      }
      const data = await parseLogFile(file, pluginType);
      setAnalysisData(data);
      setFilteredData(processData(data));
      setFileName(file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setAnalysisData(null);
    setFilteredData(null);
    setFileName(null);
    setError(null);
  };

  const isValidFileType = (file, pluginType) => {
    if (pluginType === 'ShopGUI+' && !file.name.endsWith('.log')) {
      return false;
    }
    if (pluginType === 'EconomyShopGUI' && !file.name.endsWith('.txt')) {
      return false;
    }
    return true;
  };

  const processData = (data) => {
    const { averagePrices, ...rest } = data;

    // Calculate most impactful items
    const mostImpactfulItems = Object.entries(averagePrices)
      .map(([item, prices]) => {
        // Only consider items that are sellable (have a sell price)
        if (prices.sell === 0) {
          return null;
        }
        const profitMargin = prices.sell - prices.buy;
        const profitPercentage = ((prices.sell - prices.buy) / Math.abs(prices.buy)) * 100;
        return {
          name: item,
          profitMargin,
          profitPercentage
        };
      })
      .filter(item => item !== null) // Remove null items
      .sort((a, b) => a.profitPercentage - b.profitPercentage) // Sort by lowest percentage first
      .slice(0, 5);

    return {
      ...rest,
      averagePrices,
      mostImpactfulItems
    };
  };

  const handleDateRangeChange = useCallback((startDate, endDate) => {
    if (analysisData) {
      const filteredTransactions = {};
      let totalTransactions = 0;
      let totalEarners = 0;
      let totalSpenders = 0;
      const itemCounts = {};
      const itemPrices = {};
      const playerTransactions = {};
      const playerSpending = {};
      const playerEarning = {};

      Object.entries(analysisData.transactionsByDay).forEach(([date, transactions]) => {
        if (date >= startDate && date <= endDate) {
          filteredTransactions[date] = transactions;
          totalTransactions += transactions.length;

          transactions.forEach(transaction => {
            const { player, action, quantity, item, price } = transaction;

            if (action === 'sold') {
              totalEarners++;
            } else {
              totalSpenders++;
            }

            // Update item statistics
            if (!itemCounts[item]) {
              itemCounts[item] = { bought: 0, sold: 0 };
            }
            itemCounts[item][action === 'bought' ? 'bought' : 'sold'] += quantity;

            if (!itemPrices[item]) {
              itemPrices[item] = { buy: [], sell: [] };
            }
            itemPrices[item][action === 'bought' ? 'buy' : 'sell'].push(price / quantity);

            // Update player statistics
            if (!playerTransactions[player]) {
              playerTransactions[player] = { bought: 0, sold: 0, totalSpent: 0, totalEarned: 0 };
            }
            playerTransactions[player][action === 'bought' ? 'bought' : 'sold'] += quantity;
            if (action === 'bought') {
              playerTransactions[player].totalSpent += price;
              playerSpending[player] = (playerSpending[player] || 0) + price;
            } else {
              playerTransactions[player].totalEarned += price;
              playerEarning[player] = (playerEarning[player] || 0) + price;
            }
          });
        }
      });

      // Calculate popular and least popular items
      const sortedItems = Object.entries(itemCounts).sort((a, b) => (b[1].bought + b[1].sold) - (a[1].bought + a[1].sold));
      const popularItems = sortedItems.slice(0, 5).map(([item, counts]) => ({
        name: item,
        count: counts.bought + counts.sold,
        avgBuyPrice: itemPrices[item].buy.length > 0 ? itemPrices[item].buy.reduce((a, b) => a + b) / itemPrices[item].buy.length : 0,
        avgSellPrice: itemPrices[item].sell.length > 0 ? itemPrices[item].sell.reduce((a, b) => a + b) / itemPrices[item].sell.length : 0,
      }));
      const leastPopularItems = sortedItems.slice(-5).reverse().map(([item, counts]) => ({
        name: item,
        count: counts.bought + counts.sold,
        avgBuyPrice: itemPrices[item].buy.length > 0 ? itemPrices[item].buy.reduce((a, b) => a + b) / itemPrices[item].buy.length : 0,
        avgSellPrice: itemPrices[item].sell.length > 0 ? itemPrices[item].sell.reduce((a, b) => a + b) / itemPrices[item].sell.length : 0,
      }));

      // Calculate average prices
      const averagePrices = Object.fromEntries(
        Object.entries(itemPrices).map(([item, prices]) => [
          item,
          {
            buy: prices.buy.length > 0 ? prices.buy.reduce((a, b) => a + b) / prices.buy.length : 0,
            sell: prices.sell.length > 0 ? prices.sell.reduce((a, b) => a + b) / prices.sell.length : 0,
          }
        ])
      );

      // Calculate top spenders and earners
      const topSpenders = Object.entries(playerSpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([player, amount]) => ({ player, amount }));

      const topEarners = Object.entries(playerEarning)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([player, amount]) => ({ player, amount }));

      // Calculate most active traders
      const mostActiveTraders = Object.entries(playerTransactions)
        .sort((a, b) => (b[1].bought + b[1].sold) - (a[1].bought + a[1].sold))
        .slice(0, 5)
        .map(([player, transactions]) => ({ player, ...transactions }));

      const filtered = {
        totalTransactions,
        totalEarners,
        totalSpenders,
        popularItems,
        leastPopularItems,
        averagePrices,
        transactionsByDay: filteredTransactions,
        topSpenders,
        topEarners,
        mostActiveTraders,
        playerTransactions,
      };

      setFilteredData(processData(filtered));
    }
  }, [analysisData]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2461f1] to-[#8044f6] px-6 py-8 sm:px-12 sm:py-12 text-center">
            <h1 className="text-4xl font-bold text-white">ShopGUI Analysis</h1>
          </div>
          <div className="px-6 py-8 sm:px-12">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Plugin Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="pluginType"
                    value="EconomyShopGUI"
                    checked={pluginType === 'EconomyShopGUI'}
                    onChange={(e) => setPluginType(e.target.value)}
                  />
                  <span className="ml-2">EconomyShopGUI</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="pluginType"
                    value="ShopGUI+"
                    checked={pluginType === 'ShopGUI+'}
                    onChange={(e) => setPluginType(e.target.value)}
                  />
                  <span className="ml-2">ShopGUI+</span>
                </label>
              </div>
            </div>
            {!fileName ? (
              <FileUpload onFileUpload={handleFileUpload} pluginType={pluginType} />
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Uploaded file: {fileName}</p>
                <button
                  onClick={handleRemoveFile}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remove File
                </button>
              </div>
            )}
            {isLoading && (
              <div className="mt-4 text-center">
                <p className="text-lg">Analyzing data...</p>
              </div>
            )}
            {error && (
              <div className="mt-4 text-center text-red-600">
                <p>{error}</p>
              </div>
            )}
            {filteredData && (
              <>
                <DateRangeSelector
                  data={analysisData.transactionsByDay}
                  onDateRangeChange={handleDateRangeChange}
                />
                <AnalysisResults key={JSON.stringify(filteredData)} data={filteredData} />
                <PlayerSearch data={filteredData.playerTransactions} />
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>
          Developed by{' '}
          <a
            href="https://github.com/Kaludii"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
            title="Visit Kaludi's GitHub profile"
          >
            Kaludi
          </a>{' '}
          | Made for EconomyShopGUI and ShopGUI+ Analytics
        </p>
      </footer>
    </div>
  );
};

export default App;