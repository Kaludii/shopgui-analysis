export const parseLogFile = (file, pluginType) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split('\n');

      let totalTransactions = 0;
      let totalEarners = 0;
      let totalSpenders = 0;
      const itemCounts = new Map();
      const itemPrices = new Map();
      const transactionsByDay = new Map();
      const playerTransactions = new Map();
      const playerSpending = new Map();
      const playerEarning = new Map();

      const regexShopGUI = /(\d{4}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2}) (.+?) (bought|sold)(?: all)? (\d+) x (.+?) (?:command )?for \$([\d,.]+)(?: (?:from|to) (.+) shop)?/;
      const regexEconomyShopGUI = /\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\] - (.+?) (bought|sold) (\d+) x (.+?) for \$([\d,.]+)/;

      lines.forEach(line => {
        let match;
        if (pluginType === 'ShopGUI+') {
          match = line.match(regexShopGUI);
        } else {
          match = line.match(regexEconomyShopGUI);
        }

        if (match) {
          const [, date, time, player, action, quantity, item, price] = match;
          const formattedDate = pluginType === 'ShopGUI+' ? date.replace(/\//g, '-') : date;

          totalTransactions++;
          action === 'sold' ? totalEarners++ : totalSpenders++;

          const parsedQuantity = parseInt(quantity);
          const parsedPrice = parseFloat(price.replace(',', ''));
          const trimmedItem = item.trim().replace(/§[0-9a-fklmnor]/g, '');

          const transaction = {
            player,
            action,
            quantity: parsedQuantity,
            item: trimmedItem,
            price: parsedPrice,
          };

          if (!transactionsByDay.has(formattedDate)) {
            transactionsByDay.set(formattedDate, []);
          }
          transactionsByDay.get(formattedDate).push(transaction);

          if (!itemCounts.has(trimmedItem)) {
            itemCounts.set(trimmedItem, { bought: 0, sold: 0 });
          }
          itemCounts.get(trimmedItem)[action === 'bought' ? 'bought' : 'sold'] += parsedQuantity;

          if (!itemPrices.has(trimmedItem)) {
            itemPrices.set(trimmedItem, { buy: [], sell: [] });
          }
          itemPrices.get(trimmedItem)[action === 'bought' ? 'buy' : 'sell'].push(parsedPrice / parsedQuantity);

          if (!playerTransactions.has(player)) {
            playerTransactions.set(player, { bought: 0, sold: 0, totalSpent: 0, totalEarned: 0 });
          }
          const playerData = playerTransactions.get(player);
          playerData[action === 'bought' ? 'bought' : 'sold'] += parsedQuantity;
          if (action === 'bought') {
            playerData.totalSpent += parsedPrice;
            playerSpending.set(player, (playerSpending.get(player) || 0) + parsedPrice);
          } else {
            playerData.totalEarned += parsedPrice;
            playerEarning.set(player, (playerEarning.get(player) || 0) + parsedPrice);
          }
        }
      });

      const sortedItems = [...itemCounts.entries()].sort((a, b) => (b[1].bought + b[1].sold) - (a[1].bought + a[1].sold));
      const popularItems = sortedItems.slice(0, 5).map(([item, counts]) => ({
        name: item,
        count: counts.bought + counts.sold,
        avgBuyPrice: itemPrices.get(item).buy.length > 0 ? itemPrices.get(item).buy.reduce((a, b) => a + b) / itemPrices.get(item).buy.length : 0,
        avgSellPrice: itemPrices.get(item).sell.length > 0 ? itemPrices.get(item).sell.reduce((a, b) => a + b) / itemPrices.get(item).sell.length : 0,
      }));
      const leastPopularItems = sortedItems.slice(-5).reverse().map(([item, counts]) => ({
        name: item,
        count: counts.bought + counts.sold,
        avgBuyPrice: itemPrices.get(item).buy.length > 0 ? itemPrices.get(item).buy.reduce((a, b) => a + b) / itemPrices.get(item).buy.length : 0,
        avgSellPrice: itemPrices.get(item).sell.length > 0 ? itemPrices.get(item).sell.reduce((a, b) => a + b) / itemPrices.get(item).sell.length : 0,
      }));

      const averagePrices = Object.fromEntries(
        [...itemPrices.entries()].map(([item, prices]) => [
          item,
          {
            buy: prices.buy.length > 0 ? prices.buy.reduce((a, b) => a + b) / prices.buy.length : 0,
            sell: prices.sell.length > 0 ? prices.sell.reduce((a, b) => a + b) / prices.sell.length : 0,
          }
        ])
      );

      const topSpenders = [...playerSpending.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([player, amount]) => ({ player, amount }));

      const topEarners = [...playerEarning.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([player, amount]) => ({ player, amount }));

      const mostActiveTraders = [...playerTransactions.entries()]
        .sort((a, b) => (b[1].bought + b[1].sold) - (a[1].bought + a[1].sold))
        .slice(0, 5)
        .map(([player, transactions]) => ({ player, ...transactions }));

      resolve({
        totalTransactions,
        totalEarners,
        totalSpenders,
        popularItems,
        leastPopularItems,
        averagePrices,
        transactionsByDay: Object.fromEntries(transactionsByDay),
        topSpenders,
        topEarners,
        mostActiveTraders,
        playerTransactions: Object.fromEntries(playerTransactions),
      });
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};