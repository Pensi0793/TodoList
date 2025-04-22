const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://todo-list-red-nine-46.vercel.app',
    'https://todolist-h26x.onrender.com'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Cho phép các phương thức HTTP
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Cho phép các headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Cho phép credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Xử lý preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight request trong 24 giờ
    return res.status(204).end();
  }

  next();
};

module.exports = corsMiddleware; 