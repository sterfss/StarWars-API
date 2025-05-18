const http = require('http');
const state = require('./state');
const fetchAndDisplayStarWarsData = require('./main');


const PORT = process.env.PORT || 3000;

function getHtmlPage() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Star Wars API Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #FFE81F; background-color: #000; padding: 10px; }
          button { background-color: #FFE81F; border: none; padding: 10px 20px; cursor: pointer; }
          .footer { margin-top: 50px; font-size: 12px; color: #666; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Star Wars API Demo</h1>
        <p>This page demonstrates fetching data from the Star Wars API.</p>
        <p>Check your console for the API results.</p>
        <button onclick="fetchData()">Fetch Star Wars Data</button>
        <div id="results"></div>
        <script>
          function fetchData() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Loading data...</p>';
            fetch('/api')
              .then(res => res.text())
              .then(() => {
                alert('API request made! Check server console.');
                results.innerHTML = '<p>Data fetched! Check server console.</p>';
              })
              .catch(err => {
                results.innerHTML = '<p>Error: ' + err.message + '</p>';
              });
          }
        </script>
        <div class="footer">
          <p>API calls: ${state.apiCallCount} | Cache entries: ${Object.keys(state.cache).length} | Errors: ${state.errorCount}</p>
          <pre>Debug mode: ${state.debugMode ? 'ON' : 'OFF'} | Timeout: ${state.timeout}ms</pre>
        </div>
      </body>
    </html>
  `;
}

function handleRootRequest(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getHtmlPage());
}

async function handleApiRequest(res) {
  try {
    state.apiCallCount++;
    await fetchAndDisplayStarWarsData();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Check server console for results');
  } catch (error) {
    state.errorCount++;
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${error.message}`);
  }
}

function handleStatsRequest(res) {
  const stats = {
    api_calls: state.apiCallCount,
    cache_size: Object.keys(state.cache).length,
    data_size: state.totalDataSize,
    errors: state.errorCount,
    debug: state.debugMode,
    timeout: state.timeout,
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(stats));
}

function handleNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Wrapper para usar async/await no createServer
function requestListener(req, res) {
  const url = req.url;

  if (url === '/' || url === '/index.html') {
    handleRootRequest(res);
  } else if (url === '/api') {
    handleApiRequest(res);
  } else if (url === '/stats') {
    handleStatsRequest(res);
  } else {
    handleNotFound(res);
  }
}

const server = http.createServer((req, res) => {
  // Como handleApiRequest é async, precisamos lidar com promise rejeitada
  Promise.resolve(requestListener(req, res)).catch(err => {
    console.error('Unexpected server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Open the URL in your browser and click the button to fetch Star Wars data');
  if (state.debugMode) {
    console.log('Debug mode: ON');
    console.log('Timeout:', state.timeout, 'ms');
  }
});
