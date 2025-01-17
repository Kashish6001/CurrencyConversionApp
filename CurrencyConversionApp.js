import express from 'express';
import path from 'path';
import fetch from 'node-fetch';

// Initialize the app
const app = express();
const apiKey = 'fca_live_ntIp7jPrAER4Aa2ybCEkRGHy0r51nE5U6gprBwFy';

// Resolve directory path
const __dirname = path.resolve();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to fetch currencies
app.get('/api/currencies', async (req, res) => {
    try {
        const apiUrl = `https://api.freecurrencyapi.com/v1/currencies?apikey=${apiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || !data.data) {
            return res.status(500).json({ error: 'Failed to fetch currency codes' });
        }

        const supportedCodes = Object.entries(data.data).map(([code, name]) => [code, name]);
        res.json({ supported_codes: supportedCodes });
    } catch (error) {
        console.error('Error fetching currency codes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for currency conversion
app.get('/api/convert', async (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.query;

    if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${fromCurrency}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || !data.data || !data.data[toCurrency]) {
            return res.status(500).json({ error: 'Failed to fetch conversion rate' });
        }

        const conversionRate = data.data[toCurrency];
        const conversionResult = (amount * conversionRate).toFixed(2);

        res.json({ conversion_result: conversionResult });
    } catch (error) {
        console.error('Error during conversion:', error);
        res.status(500).json({ error: 'Failed to perform currency conversion' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
