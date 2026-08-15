const express = require('express');
const app = express();
const PORT = 3000;

// YOUR AMAZON TAG - MONEY GOES TO $$davidingalls1061
const AMAZON_TAG = 'davidingalls1-20';
const DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases';

app.use(express.json());
app.use(express.static('public'));

// 1. HOME / FIND PAGE with Amazon Banner
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>Swarm Find - AI Product Search</title></head>
    <body>
      <div style="background:yellow;padding:10px;text-align:center">${DISCLOSURE}</div>
      <div style="background:#FF9900;padding:20px;text-align:center">
        <h2>Shop Amazon Deals Today - Up to 70% Off</h2>
        <a href="https://www.amazon.com/s?k=deals&tag=${AMAZON_TAG}" style="background:black;color:white;padding:15px 30px;text-decoration:none;font-weight:bold">SHOP AMAZON - ${AMAZON_TAG}</a>
      </div>
      <h1>Swarm Find - Find Anything</h1>
      <input id="q" placeholder="e.g. quiet dishwasher for small apartments" style="width:80%;padding:15px" />
      <button onclick="location.href='/page/'+document.getElementById('q').value.replace(/ /g,'-')+'-'+Date.now()">Find</button>
      <p>Your Store ID: ${AMAZON_TAG} | CashApp: $$davidingalls1061</p>
    </body>
    </html>
  `);
});

app.get('/find', (req, res) => res.redirect('/'));

// 2. DYNAMIC LANDING PAGES /page/:slug - Amazon Product Cards + Banners
app.get('/page/:slug', (req, res) => {
  const slug = req.params.slug;
  const query = slug.replace(/-/g, ' ');
  res.send(`
    <html>
    <head><title>${query} - Swarm Find</title></head>
    <body>
      <div style="background:yellow;padding:5px;text-align:center;font-size:12px">${DISCLOSURE}</div>
      <!-- TOP AMAZON BANNER -->
      <div style="background:#232F3E;color:white;padding:15px;text-align:center">
        <h3>Best ${query} on Amazon - Your Tag: ${AMAZON_TAG}</h3>
        <a href="https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}" style="background:#FF9900;color:black;padding:10px 20px;text-decoration:none;font-weight:bold">View on Amazon - Shop Now</a>
      </div>

      <h1>Top 3 ${query}</h1>
      
      <!-- Product 1 with Amazon Link -->
      <div style="border:1px solid #ddd;padding:15px;margin:10px">
        <h3>1. Best Overall ${query}</h3>
        <p>Top rated, quiet, efficient</p>
        <a href="/redirect?to=https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}" style="background:#FF9900;padding:10px 20px;text-decoration:none">Buy on Amazon - ${AMAZON_TAG}</a>
        <a href="/redirect?to=https://www.walmart.com/search?q=${encodeURIComponent(query)}" style="background:blue;color:white;padding:10px 20px;text-decoration:none;margin-left:10px">Check Walmart</a>
      </div>

      <div style="border:1px solid #ddd;padding:15px;margin:10px">
        <h3>2. Best Value ${query}</h3>
        <p>Great performance under $500</p>
        <a href="/redirect?to=https://www.amazon.com/s?k=${encodeURIComponent(query)}+best+value&tag=${AMAZON_TAG}" style="background:#FF9900;padding:10px 20px;text-decoration:none">Buy on Amazon</a>
      </div>

      <div style="border:1px solid #ddd;padding:15px;margin:10px">
        <h3>3. Premium Pick ${query}</h3>
        <p>High-end features</p>
        <a href="/redirect?to=https://www.amazon.com/s?k=${encodeURIComponent(query)}+premium&tag=${AMAZON_TAG}" style="background:#FF9900;padding:10px 20px;text-decoration:none">Buy on Amazon</a>
      </div>

      <!-- BOTTOM AMAZON BANNER -->
      <div style="background:#232F3E;color:white;padding:20px;text-align:center;margin-top:30px">
        <h3>Don't Miss Amazon's Deal on ${query}</h3>
        <a href="https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}" style="background:#FF9900;color:black;padding:15px 30px;text-decoration:none;font-weight:bold;font-size:18px">SHOP AMAZON NOW - ${AMAZON_TAG}</a>
        <p style="font-size:11px;margin-top:10px">${DISCLOSURE}</p>
      </div>

      <p>Slug: ${slug} | Tag: ${AMAZON_TAG} | $$davidingalls1061</p>
    </body>
    </html>
  `);
});

// 3. WIDGET - Embeddable Amazon Banner for other sites
app.get('/widget', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    (function(){
      var tag = '${AMAZON_TAG}';
      var div = document.createElement('div');
      div.innerHTML = '<div style="background:#232F3E;color:white;padding:10px;text-align:center;border:2px solid #FF9900"><div style="font-size:10px;background:yellow;color:black">${'${DISCLOSURE}'}</div><h4 style="margin:5px">Shop Amazon - Tag: '+tag+'</h4><a href="https://www.amazon.com/s?k=deals&tag='+tag+'" target="_blank" style="background:#FF9900;color:black;padding:8px 15px;text-decoration:none;font-weight:bold">Shop Amazon Deals</a></div>';
      document.currentScript.parentNode.insertBefore(div, document.currentScript);
      console.log('Swarm Widget loaded with tag: '+tag+' for $$davidingalls1061');
    })();
  `);
});

// 4. REDIRECT - Amazon Interstitial with banner
app.get('/redirect', (req, res) => {
  const to = req.query.to || `https://www.amazon.com/s?k=deals&tag=${AMAZON_TAG}`;
  const finalUrl = to.includes('amazon.com') && !to.includes('tag=') ? to + '&tag=' + AMAZON_TAG : to;
  res.send(`
    <html>
    <head><meta http-equiv="refresh" content="2;url=${finalUrl}"></head>
    <body style="text-align:center;padding-top:50px;font-family:sans-serif">
      <div style="background:yellow;padding:5px">${DISCLOSURE}</div>
      <h2>Going to Amazon...</h2>
      <div style="background:#232F3E;color:white;padding:20px;margin:20px">
        <p>Your Amazon Associate Tag: <b>${AMAZON_TAG}</b></p>
        <p>CashApp: $$davidingalls1061</p>
        <a href="${finalUrl}" style="background:#FF9900;color:black;padding:15px 30px;text-decoration:none;font-weight:bold">Continue to Amazon - Shop ${AMAZON_TAG}</a>
      </div>
      <p>Redirecting in 2 seconds...</p>
      <p style="font-size:11px">If not redirected, <a href="${finalUrl}">click here</a></p>
    </body>
    </html>
  `);
});

// 5. EXTENSION endpoint
app.get('/extension', (req, res) => {
  res.json({ tag: AMAZON_TAG, disclosure: DISCLOSURE, cashapp: '$$davidingalls1061', bannerUrl: `https://www.amazon.com/s?k=deals&tag=${AMAZON_TAG}` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Swarm running on http://0.0.0.0:${PORT} with Amazon Tag: ${AMAZON_TAG} for $$davidingalls1061`);
});
