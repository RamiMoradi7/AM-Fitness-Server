import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  headers: true, 
});

export default rateLimiter;
