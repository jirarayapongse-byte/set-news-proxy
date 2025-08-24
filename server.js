const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/news', async (req, res) => {
  const { symbol, start, end } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing stock symbol' });
  }

  const url = `https://www.set.or.th/th/market/news-and-alert/news?symbol=${symbol}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const newsItems = [];

    $('.card-news').each((_, el) => {
      const title = $(el).find('.card-news__head .card-news__head__text').text().trim();
      const date = $(el).find('.card-news__date').text().trim();
      const link = $(el).find('a').attr('href');

      newsItems.push({
        title,
        publishedAt: date,
        documentUrl: link ? `https://www.set.or.th${link}` : null
      });
    });

    res.json({
      symbol,
      from: start || null,
      to: end || null,
      news: newsItems
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



