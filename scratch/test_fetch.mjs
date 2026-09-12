import http from 'http';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, len: data.length, snippet: data.slice(0, 200) }));
    }).on('error', reject);
  });
}

try {
  console.log('Fetching 3000:', await fetchUrl('http://127.0.0.1:3000/'));
} catch (e) {
  console.log('Error 3000:', e.message);
}

try {
  console.log('Fetching localhost 5173:', await fetchUrl('http://localhost:5173/'));
} catch (e) {
  console.log('Error 5173:', e.message);
}
