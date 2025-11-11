// Cần tạo thư mục 'test' và đặt file này vào trong
const request = require('supertest');
const app = require('../app'); // Import server

describe('GET /', () => {
  it('should respond with a random HTML excuse', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
          if (err) return done(err);
          // Kiểm tra xem nội dung có phải là thẻ H1 không
          if (res.text.startsWith('<h1>') && res.text.endsWith('</h1>')) {
              done();
          } else {
              done(new Error('Response is not a valid excuse in H1 tag'));
          }
      });
  });
});