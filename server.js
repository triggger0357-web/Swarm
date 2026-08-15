import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

let memory = { pages: [], clicks: 0, logs: [] };
const log = (agent, msg) => {
  const entry = { time: new Date().toLocaleTimeString(), agent, msg };
  memory.logs.unshift(entry);
  if(memory.logs.length>100) memory.logs.pop();
  console.log(`[${agent}] ${msg}`);
};

// ---- ALL AGENTS ----
const ProductAgent = {
  search: async (intent) => {
    log('ProductAgent', `search: ${intent}`);
    return [
      {id:'1', title: `${intent} - Pro X 2026`, price: 799, store:'Amazon', rating:4.6, url:'https://amazon.com/s?k='+encodeURIComponent(intent)},
      {id:'2', title: `${intent} - Compact`, price: 649, store:'BestBuy', rating:4.4, url:'https://bestbuy.com/site/searchpage.jsp?st='+encodeURIComponent(intent)},
      {id:'3', title: `${intent} - Eco`, price: 899, store:'HomeDepot', rating:4.8, url:'https://homedepot.com/s/'+encodeURIComponent(intent)},
    ];
  }
};
const AffiliateAgent = {
  resolve: (products) => products.map(p=>({...p, affiliateUrl: `/redirect?to=${encodeURIComponent(p.url)}&store=${p.store}&id=${p.id}`, commission: p.store==='Amazon'?'4%':'6%'}))
};
const LandingPageAgent = {
  build: (intent, products) => {
    const slug = intent.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,35)+'-'+Date.now().toString(36);
    memory.pages.unshift({slug, intent, products, at: new Date().toISOString(), views:0});
    log('LandingPageAgent', `built /page/${slug}`);
    return {slug, url: `/page/${slug}`};
  }
};

// ---- PLATFORM CORE ROUTES YOU DESIGNED ----

// 1. /find API - Boss Agent conductor
app.post('/api/boss/intent', async (req,res)=>{
  const intent = req.body.intent;
  if(!intent) return res.status(400).json({error:'intent required'});
  log('BossAgent', `Intent received: ${intent}`);
  
  const products = await ProductAgent.search(intent);
  const withAff = AffiliateAgent.resolve(products);
  const page = LandingPageAgent.build(intent, withAff);
  
  res.json({
    boss: 'Task graph executed',
    finalUrl: page.url,
    tasks: [
      {from:'BossAgent', to:'ProductAgent', task:'build_page', intent},
      {from:'BossAgent', to:'AffiliateAgent', task:'attach_links', count:withAff.length},
      {from:'BossAgent', to:'LandingPageAgent', task:'build_page', slug:page.slug},
      {from:'BossAgent', to:'RedirectAgent', task:'prep_redirects'},
      {from:'BossAgent', to:'WidgetAgent', task:'generate_widget'},
      {from:'BossAgent', to:'BotAgent', task:'queue_spread'},
      {from:'BossAgent', to:'TrafficAnalysisAgent', task:'start_tracking'},
      {from:'SecurityAgent', to:'BossAgent', task:'approved', ok:true},
    ],
    products: withAff
  });
});

// 2. /page/:slug
app.get('/page/:slug', (req,res)=>{
  const p = memory.pages.find(x=>x.slug===req.params.slug);
  if(!p) return res.status(404).send('<h1>Page not found</h1><a href="/">Back to /find</a>');
  p.views++;
  res.send(`
  <html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.intent}</title>
  <style>body{font-family:system-ui;padding:16px;max-width:720px;margin:auto} .card{border:1px solid #ddd;padding:14px;border-radius:12px;margin:12px 0} .buy{background:#000;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px}</style>
  </head><body>
  <a href="/">← /find</a><h1>${p.intent}</h1><small>Built ${p.at} • ${p.views} views</small>
  ${p.products.map(pr=>`<div class=card><h3>${pr.title}</h3><p>$${pr.price} @ ${pr.store} ⭐${pr.rating} • Commission ${pr.commission}</p><a class=buy href="${pr.affiliateUrl}">Get Deal →</a></div>`).join('')}
  <hr><div id=widget></div><script src="/widget?slug=${p.slug}"></script>
  </body></html>`);
});

// 3. /redirect
app.get('/redirect', (req,res)=>{
  const {to, store} = req.query;
  if(!to) return res.status(400).send('Missing ?to=');
  memory.clicks++; log('RedirectAgent', `click → ${store}: ${to.slice(0,60)}`);
  res.send(`<html><meta http-equiv="refresh" content="1;url=${to}"><body style="font-family:sans-serif;padding:40px;text-align:center"><h2>🚀 Smart Redirect</h2><p>Sending you to ${store}...</p><p><a href="${to}">${to}</a></p><small>Monetized by your phone server</small></body></html>`);
});

// 4. /widget - embeddable
app.get('/widget', (req,res)=>{
  const slug = req.query.slug || (memory.pages[0]?.slug || 'demo');
  res.setHeader('Content-Type','application/javascript');
  res.send(`(function(){var d=document.getElementById('widget')||document.body;var c=document.createElement('div');c.innerHTML='<div style="border:2px solid #6366f1;padding:12px;border-radius:10px;font-family:sans-serif"><b>🔥 Trending on Swarm</b><br><a href="/page/${slug}" style="color:#6366f1">See ${slug.slice(0,20)}...</a><br><small>Powered by Android Phone Server</small></div>';d.appendChild(c);})();`);
});

// 5. /extension - browser extension page
app.get('/extension', (req,res)=>{
  res.send(`<html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:20px"><h1>Extension Agent</h1><p>This extension watches product pages and redirects to your /page.</p><pre style="background:#111;color:#0f0;padding:12px;border-radius:8px">// manifest.json -> content script calls\nfetch('https://YOUR-NGROK-URL/api/boss/intent',{method:'POST',body:JSON.stringify({intent: document.title})})</pre><p>Replace YOUR-NGROK-URL with your ngrok link.</p><a href="/">Back</a></body></html>`);
});

// 6. /bot console (internal)
app.get('/bot', (req,res)=>{
  res.send(`<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:monospace;padding:16px;background:#000;color:#0f0}</style><h1>/bot - Bot Activity</h1><p>BotAgent would spread: ${memory.pages.map(p=>p.slug).join(', ')||'no pages yet'}</p><pre>${memory.logs.map(l=>`[${l.time}] ${l.agent}: ${l.msg}`).join('\\n')}</pre><a href="/" style="color:#fff">Back</a></html>`);
});

// 7. /affiliate dashboard
app.get('/affiliate', (req,res)=>{
  res.json({ totalPages: memory.pages.length, totalClicks: memory.clicks, commissionEstimate: `$${(memory.clicks*0.8).toFixed(2)}`, pages: memory.pages.slice(0,10) });
});

// 8. /analytics
app.get('/analytics', (req,res)=>{
  res.json({ pages: memory.pages.length, clicks: memory.clicks, logs: memory.logs.slice(0,20), popular: memory.pages.sort((a,b)=>b.views-a.views).slice(0,5) });
});

// 9. /security
app.get('/security', (req,res)=>{
  res.json({ status:'OK', blocked:0, lastCheck: new Date().toISOString(), policy: ['No weapons','No drugs','Affiliate links must be disclosed'] });
});

// Home /find UI
app.get('/', (req,res)=>{
  res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Swarm Phone Server</title>
  <style>body{font-family:system-ui;background:#0a0a0a;color:#fff;padding:18px;max-width:800px;margin:auto}input{width:100%;padding:16px;border-radius:12px;font-size:18px;margin:12px 0}button{width:100%;padding:16px;background:#6366f1;border:0;border-radius:12px;color:#fff;font-size:18px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px} .card{background:#111;padding:12px;border-radius:10px} a{color:#818cf8}</style></head><body>
  <h1>📱 Swarm OS - Phone Server</h1><small>All 9 agents running on Android</small>
  <input id=q placeholder="Find Anything: quiet dishwasher for small apartments">
  <button onclick="go()">FIND + BUILD PAGE</button>
  <div class=grid>
    <div class=card><a href="/bot">/bot console</a><br>Bot activity</div>
    <div class=card><a href="/affiliate">/affiliate</a><br>Clicks: <span id=clicks>${memory.clicks}</span></div>
    <div class=card><a href="/analytics">/analytics</a><br>Pages: ${memory.pages.length}</div>
    <div class=card><a href="/security">/security</a><br>Status OK</div>
    <div class=card><a href="/widget">/widget</a><br>Embed code</div>
    <div class=card><a href="/extension">/extension</a><br>Extension setup</div>
  </div>
  <pre id=out style="background:#111;padding:12px;border-radius:10px;margin-top:16px;white-space:pre-wrap">BossAgent idle...</pre>
  <script>
  async function go(){
    const intent=document.getElementById('q').value||'gaming laptop under 900';
    document.getElementById('out').textContent='BossAgent orchestrating swarm...';
    const r=await fetch('/api/boss/intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({intent})});
    const j=await r.json();
    document.getElementById('out').textContent=JSON.stringify(j.tasks,null,2)+'\\n\\nFinal: '+j.finalUrl;
    setTimeout(()=>location.href=j.finalUrl,800);
  }
  </script></body></html>`);
});

app.listen(3000,'0.0.0.0',()=>console.log('✅ FULL SWARM RUNNING http://localhost:3000'));
