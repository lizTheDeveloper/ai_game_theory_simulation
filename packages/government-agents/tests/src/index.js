"use strict";
/**
 * @political-science/government-agents
 *
 * Government modeling framework for political science research.
 *
 * Research Foundation:
 * - V-Dem v14 (Varieties of Democracy): 531 indicators, 202 countries
 * - WGI 2024 (Worldwide Governance Indicators): State capacity metrics
 * - Laver (2020): Agent-based modeling in political decision making
 * - Manifesto Project Database: Party policy positions
 *
 * @module @political-science/government-agents
 * @version 0.1.0
 * @license MIT
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESEARCH_CITATIONS = exports.VERSION = void 0;
// Core exports (will be implemented in Phase 1)
__exportStar(require("./core"), exports);
// Coalition exports (will be implemented in Phase 2)
__exportStar(require("./coalition"), exports);
// Policy exports (will be implemented in Phase 3)
__exportStar(require("./policy"), exports);
// Election exports (will be implemented in Phase 4)
__exportStar(require("./elections"), exports);
// Data exports
__exportStar(require("./data"), exports);
/**
 * Package version
 */
exports.VERSION = '0.1.0';
/**
 * Research citations used throughout this package
 */
exports.RESEARCH_CITATIONS = {
    vdem: 'V-Dem [Country-Year/Country-Date] Dataset v14, Coppedge et al. 2024',
    wgi: 'Worldwide Governance Indicators 2024, World Bank',
    laver: 'Laver, M. (2020). Agent-based Modeling in Political Decision Making, Oxford Handbook',
    manifesto: 'Manifesto Project Database, Lehmann et al. 2024',
    ipu: 'IPU Parline Database, Inter-Parliamentary Union 2024'
};
