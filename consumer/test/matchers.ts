import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

const chaiDatetime = require("chai-datetime");

chai.use(chaiAsPromised);
chai.use(chaiDatetime);

export const expect = chai.expect;
