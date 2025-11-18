// Unit tests for the application
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock database pool
const mockPool = {
    query: sinon.stub()
};

const mockDb = {
    pool: mockPool,
    testConnection: sinon.stub().resolves(true)
};

// Load app with mocked db module
const app = proxyquire('../app', {
    './db': mockDb
});

describe('GET /', () => {
    beforeEach(() => {
        // Reset mock before each test
        mockPool.query.reset();
    });

    it('should respond with a random HTML excuse', (done) => {
        // Mock successful database query
        mockPool.query.resolves({
            rows: [{ text: 'It works on my machine.' }]
        });

        request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                // Kiểm tra xem nội dung có phải là thẻ H1 không
                if (res.text.startsWith('<h1>') && res.text.endsWith('</h1>')) {
                    if (mockPool.query.called) {
                        done();
                    } else {
                        done(new Error('Database query was not called'));
                    }
                } else {
                    done(new Error('Response is not a valid excuse in H1 tag'));
                }
            });
    });

    it('should handle database errors gracefully', (done) => {
        // Mock database error
        mockPool.query.rejects(new Error('Database connection failed'));

        request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                if (res.text.includes('Database connection error')) {
                    done();
                } else {
                    done(new Error('Should return database error message'));
                }
            });
    });

    it('should handle empty database result', (done) => {
        // Mock empty result
        mockPool.query.resolves({ rows: [] });

        request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                if (res.text.includes('No excuses found')) {
                    done();
                } else {
                    done(new Error('Should return no excuses message'));
                }
            });
    });
});

describe('GET /health', () => {
    it('should respond with health status when database is connected', (done) => {
        mockPool.query.resolves({ rows: [{ health: 1 }] });

        request(app)
            .get('/health')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                if (res.body.status === 'healthy') {
                    done();
                } else {
                    done(new Error('Should return healthy status'));
                }
            });
    });

    it('should respond with unhealthy status when database fails', (done) => {
        mockPool.query.rejects(new Error('Database error'));

        request(app)
            .get('/health')
            .expect('Content-Type', /json/)
            .expect(503)
            .end((err, res) => {
                if (err) return done(err);
                if (res.body.status === 'unhealthy') {
                    done();
                } else {
                    done(new Error('Should return unhealthy status'));
                }
            });
    });
});

describe('GET /api/excuses', () => {
    it('should return list of excuses', (done) => {
        mockPool.query.resolves({
            rows: [
                { id: 1, text: 'Excuse 1', created_at: new Date() },
                { id: 2, text: 'Excuse 2', created_at: new Date() }
            ]
        });

        request(app)
            .get('/api/excuses')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                if (res.body.count === 2 && res.body.excuses.length === 2) {
                    done();
                } else {
                    done(new Error('Should return list of excuses'));
                }
            });
    });
});