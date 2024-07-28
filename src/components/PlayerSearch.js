import React, { useState } from 'react';

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const PlayerSearch = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = () => {
    if (searchTerm && data[searchTerm]) {
      setSearchResult({
        player: searchTerm,
        ...data[searchTerm]
      });
    } else {
      setSearchResult({ notFound: true });
    }
  };

  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Player Search</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter player name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </div>
      {searchResult && (
        <div className="mt-4">
          {searchResult.notFound ? (
            <p>No player found with that name.</p>
          ) : (
            <>
              <h3 className="font-semibold">{searchResult.player}</h3>
              <p>Bought: {formatNumber(searchResult.bought)} items</p>
              <p>Sold: {formatNumber(searchResult.sold)} items</p>
              <p>Total spent: ${formatNumber(searchResult.totalSpent.toFixed(2))}</p>
              <p>Total earned: ${formatNumber(searchResult.totalEarned.toFixed(2))}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerSearch;