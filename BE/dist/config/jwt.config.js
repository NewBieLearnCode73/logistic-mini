"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtConfig = void 0;
const getJwtConfig = () => ({
    secret: process.env.JWT_SECRET || 'super-secret-key-12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
});
exports.getJwtConfig = getJwtConfig;
//# sourceMappingURL=jwt.config.js.map