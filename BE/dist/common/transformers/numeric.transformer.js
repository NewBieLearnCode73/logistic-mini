"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericTransformer = void 0;
exports.numericTransformer = {
    to: (value) => value,
    from: (value) => {
        if (value === null || value === undefined) {
            return null;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    },
};
//# sourceMappingURL=numeric.transformer.js.map