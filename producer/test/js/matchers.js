"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const chaiDatetime = require("chai-datetime");
chai.use(chaiAsPromised);
chai.use(chaiDatetime);
exports.expect = chai.expect;
//# sourceMappingURL=matchers.js.map