import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinonChai from "sinon-chai";

const chaiDatetime = require("chai-datetime");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiDatetime);

export const expect = chai.expect;
