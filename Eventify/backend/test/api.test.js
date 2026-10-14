const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

describe('Security & API Protection Validation', () => {
    const JWT_SECRET = 'test_secret_key_12345';
    process.env.JWT_SECRET = JWT_SECRET;

    // Test authMiddleware with missing token
    it('should reject unauthenticated requests with 401 when no token is provided', async () => {
        const { protect } = require('../middleware/authMiddleware');
        const req = { headers: {} };
        let statusSent = null;
        let responseJson = null;

        const res = {
            status: (s) => {
                statusSent = s;
                return {
                    json: (j) => {
                        responseJson = j;
                    }
                };
            }
        };

        let nextCalled = false;
        await protect(req, res, () => { nextCalled = true; });

        assert.equal(statusSent, 401);
        assert.equal(nextCalled, false);
        assert.equal(responseJson.message, 'Not authorized, no token');
    });

    // Test authMiddleware with invalid token
    it('should reject requests with invalid JWT token with 401', async () => {
        const { protect } = require('../middleware/authMiddleware');
        const req = { headers: { authorization: 'Bearer invalid.token.value' } };
        let statusSent = null;
        let responseJson = null;

        const res = {
            status: (s) => {
                statusSent = s;
                return {
                    json: (j) => {
                        responseJson = j;
                    }
                };
            }
        };

        let nextCalled = false;
        await protect(req, res, () => { nextCalled = true; });

        assert.equal(statusSent, 401);
        assert.equal(nextCalled, false);
        assert.equal(responseJson.message, 'Not authorized, token failed');
    });
});
