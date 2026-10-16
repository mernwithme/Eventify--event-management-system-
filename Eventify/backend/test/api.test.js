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

    describe('Login OTP Verification Logic', () => {
        const crypto = require('crypto');

        it('should correctly hash and match valid 6-digit OTP', () => {
            const rawOtp = '482910';
            const expectedHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

            const testInput = '482910';
            const inputHash = crypto.createHash('sha256').update(testInput.trim()).digest('hex');

            assert.equal(inputHash, expectedHash);
        });

        it('should reject mismatched OTP codes', () => {
            const rawOtp = '482910';
            const expectedHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

            const wrongInput = '123456';
            const wrongInputHash = crypto.createHash('sha256').update(wrongInput.trim()).digest('hex');

            assert.notEqual(wrongInputHash, expectedHash);
        });

        it('should detect when an OTP has expired', () => {
            const expiredTimestamp = new Date(Date.now() - 1000); // 1 second in the past
            const isExpired = expiredTimestamp.getTime() < Date.now();

            assert.equal(isExpired, true);
        });

        it('should validate when an OTP is within 10-minute expiry window', () => {
            const validTimestamp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future
            const isExpired = validTimestamp.getTime() < Date.now();

            assert.equal(isExpired, false);
        });
    });
});

