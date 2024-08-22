import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ItemPriceAnalysis = ({ data }) => {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = Object.entries(data).map(([item, prices]) => ({
    name: item,
    avgBuy: prices.buy,
    avgSell: prices.sell,
    highestPrice: Math.max(prices.buy, prices.sell),
    lowestPrice: Math.min(prices.buy, prices.sell),
    percentageDifference: ((prices.sell - prices.buy) / prices.buy * 100).toFixed(2)
  })).sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const columns = [
    { header: 'Item Name', key: 'name' },
    { header: 'Avg Buy Price', key: 'avgBuy' },
    { header: 'Avg Sell Price', key: 'avgSell' },
    { header: 'Highest Price', key: 'highestPrice' },
    { header: 'Lowest Price', key: 'lowestPrice' },
    { header: 'Percentage Difference', key: 'percentageDifference' }
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-green-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-300 p-2 text-left cursor-pointer hover:bg-green-200"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    <ArrowUpDown size={16} className="ml-1" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{item.name}</td>
                <td className="border border-gray-300 p-2">${item.avgBuy.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">${item.avgSell.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">${item.highestPrice.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">${item.lowestPrice.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{item.percentageDifference}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 bg-white text-green-700 hover:bg-green-50"
          >
            <ChevronsLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 bg-white text-green-700 hover:bg-green-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 bg-white text-green-700 hover:bg-green-50"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 bg-white text-green-700 hover:bg-green-50"
          >
            <ChevronsRight size={20} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border rounded p-2 bg-white text-gray-700"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ItemPriceAnalysis;