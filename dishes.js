const http = require('http');
const mysql = require('mysql2');
const url = require('url');

const db = mysql.createConnection({
  host: '192.168.1.139',
  user: 'botewifi',
  password: 'botewifi',
  database: 'crud'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  
  if (path === '/dishes' && method === 'GET') {
    if (query.dish_id) {

      db.query('SELECT * FROM dishes WHERE dish_id = ?', [query.dish_id], (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result[0] || {}));
      });
    } else {
      db.query('SELECT * FROM dishes', (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
      });
    }
  }

  else if (path === '/dishes' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { dish_name, main_ingredient, cooking_method, cuisine_type, price } = JSON.parse(body);
      db.query(
        'INSERT INTO dishes (dish_name, main_ingredient, cooking_method, cuisine_type, price) VALUES (?, ?, ?, ?, ?)',
        [dish_name, main_ingredient, cooking_method, cuisine_type, price],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ dish_id: result.insertId, dish_name, main_ingredient, cooking_method, cuisine_type, price }));
        }
      );
    });
  }

  else if (path === '/dishes' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { dish_name, main_ingredient, cooking_method, cuisine_type, price } = JSON.parse(body);
      db.query(
        'UPDATE dishes SET dish_name=?, main_ingredient=?, cooking_method=?, cuisine_type=?, price=? WHERE dish_id=?',
        [dish_name, main_ingredient, cooking_method, cuisine_type, price, query.dish_id],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ dish_id: query.dish_id, dish_name, main_ingredient, cooking_method, cuisine_type, price }));
        }
      );
    });
  }

  else if (path === '/dishes' && method === 'DELETE') {
    db.query('DELETE FROM dishes WHERE dish_id=?', [query.dish_id], (err, result) => {
      if (err) throw err;
      res.end(JSON.stringify({ message: 'Dish deleted' }));
    });
  }

  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://192.168.1.139:${port}`);
});

