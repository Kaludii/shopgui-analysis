import React, { useState, useEffect, useMemo } from 'react';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

const DataTable = ({ data, onSort, onExportCSV }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { header: 'Item Name', key: 'name' },
    { header: 'Average Buy', key: 'avgBuy' },
    { header: 'Average Sell', key: 'avgSell' },
    { header: 'Highest Price', key: 'highestPrice' },
    { header: 'Lowest Price', key: 'lowestPrice' },
    { header: 'Buy/Sell %', key: 'percentage' }
  ];

  const formatNumber = (num) => {
    return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.00";
  };

  const calculatePercentage = (buy, sell) => {
    if (buy && sell) {
      const percentage = ((sell - buy) / buy) * 100;
      return percentage.toFixed(2);
    }
    return null;
  };

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'percentage') {
          const aPercentage = calculatePercentage(a.avgBuy, a.avgSell);
          const bPercentage = calculatePercentage(b.avgBuy, b.avgSell);
          if (aPercentage === null && bPercentage === null) return 0;
          if (aPercentage === null) return sortConfig.direction === 'ascending' ? 1 : -1;
          if (bPercentage === null) return sortConfig.direction === 'ascending' ? -1 : 1;
          return sortConfig.direction === 'ascending' ? aPercentage - bPercentage : bPercentage - aPercentage;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded p-2 bg-white text-gray-700"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded p-2 bg-white text-gray-700"
          />
          <Search size={20} className="text-gray-500" />
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          title="Download as CSV"
        >
          <Download size={20} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-blue-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-300 p-2 text-left cursor-pointer hover:bg-blue-200"
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
                <td className="border border-gray-300 p-2">${formatNumber(item.avgBuy)}</td>
                <td className="border border-gray-300 p-2">${formatNumber(item.avgSell)}</td>
                <td className="border border-gray-300 p-2">${formatNumber(item.highestPrice)}</td>
                <td className="border border-gray-300 p-2">${formatNumber(item.lowestPrice)}</td>
                <td className="border border-gray-300 p-2">
                  {calculatePercentage(item.avgBuy, item.avgSell) !== null
                    ? `${calculatePercentage(item.avgBuy, item.avgSell)}%`
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 bg-white text-blue-700 hover:bg-blue-50"
          >
            <ChevronsLeft size={20} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50 bg-white text-blue-700 hover:bg-blue-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 bg-white text-blue-700 hover:bg-blue-50"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50 bg-white text-blue-700 hover:bg-blue-50"
          >
            <ChevronsRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;