"use strict";
/**
 * Phase 0: Verify package structure
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const index_js_1 = require("../src/index.js");
(0, node_test_1.test)('Package exports version', () => {
    node_assert_1.default.strictEqual(index_js_1.VERSION, '0.1.0');
});
(0, node_test_1.test)('Package exports research citations', () => {
    node_assert_1.default.ok(index_js_1.RESEARCH_CITATIONS.vdem);
    node_assert_1.default.ok(index_js_1.RESEARCH_CITATIONS.wgi);
    node_assert_1.default.ok(index_js_1.RESEARCH_CITATIONS.laver);
    node_assert_1.default.ok(index_js_1.RESEARCH_CITATIONS.manifesto);
    node_assert_1.default.ok(index_js_1.RESEARCH_CITATIONS.ipu);
});
(0, node_test_1.test)('Package structure is clean', () => {
    // This test verifies the package can be imported without errors
    node_assert_1.default.ok(true);
});
