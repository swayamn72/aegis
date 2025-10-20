import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU5MTI4ZDE0OTlkYzI4ZTAyNGFiOCIsImlhdCI6MTc2MDYzODg0OSwiZXhwIjoxNzYxMjQzNjQ5fQ.UM1OLrEwbIBKGetginThgybejej9eVcs7gsuBwuQKBk';
const secret = 'f3d1a8b7c6e2f4a9b1d3c5e7f8a0b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0';

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token is valid:', decoded);
} catch (err) {
  console.log('Token verification failed:', err.message);
}
