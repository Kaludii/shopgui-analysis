# ShopGUI Analysis

ShopGUI Analysis is a React-based web application designed to analyze and visualize transaction data from Minecraft servers using EconomyShopGUI and ShopGUI+ plugins. This tool provides valuable insights into server economy, player behavior, and item popularity.

## Web App

Click [Here](https://shopgui-analysis.vercel.app/ "Here") To View This Dashboard Online!

<p align="center"> <img src="https://github.com/user-attachments/assets/1de0a661-a1b6-4d04-825c-42ff6b18d564" width="44%" alt="EconomyShopGUI" /> &nbsp; &nbsp; &nbsp; &nbsp; <img src="https://github.com/user-attachments/assets/a7dfcfbf-9b94-49ee-afc2-d653515f3189" width="44%" alt="ShopGUI+" /> </p>

## Features

-   Support for both EconomyShopGUI and ShopGUI+ log file formats
-   Comprehensive transaction analysis including total transactions, earners, and spenders
-   Identification of most and least popular items
-   Average price analysis with buy/sell price difference highlighting
-   Top spenders and earners identification
-   Most active traders list
-   Daily transaction visualization with 7-day moving average trend
-   Date range selection for focused analysis
-   Player search functionality
-   Detailed price analysis table with search and sort capabilities
-   CSV export for further data analysis

## Usage

Users can upload their EconomyShopGUI or ShopGUI+ log files and interact with the dashboard in the following ways:

### Data Analysis and Visualization

-   **Select Plugin Type**: Choose between EconomyShopGUI and ShopGUI+ formats.
-   **Upload Log File**: Upload the server's shop transaction log file.
-   **View Overall Statistics**: See total transactions, earners, and spenders.
-   **Analyze Item Popularity**: View most and least popular items with their average buy/sell prices.
-   **Price Analysis**: Examine average prices sorted by buy/sell price difference to identify potential exploits.
-   **Player Analysis**: View top spenders, earners, and most active traders.
-   **Transaction Trends**: Interact with charts showing daily transactions and 7-day moving averages.

### Data Filtering

-   **Date Range Selection**: Filter data by selecting specific date ranges.
-   **Player Search**: Search for specific player's transaction history.
-   **Detailed Price Analysis**: Use the interactive table to search, sort, and analyze item prices.
-   **CSV Export**: Download the detailed price analysis data for offline analysis.

## Requirements

-   Node.js 14.0 or higher
-   npm 6.0 or higher

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kaludii/shopgui-analysis.git
   ```

2. Navigate to the project directory:
   ```
   cd shopgui-analysis
   ```

3. Install the required packages:
   ```
   npm install
   ```

4. Run the app in development mode:
   ```
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

5. To create a production build:
   ```
   npm run build
