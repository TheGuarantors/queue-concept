import { queueInstance } from "../src/init";

const FactoryGirl = require("factory-girl");
const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.SequelizeAdapter();

factory.setAdapter(adapter);

factory.define("queue", queueInstance, {
  status: "unprocessed",
  queue: "hubspot"
});

export default factory;
