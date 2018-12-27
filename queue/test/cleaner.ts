import { sequelize } from "../src/init";

const Sequelize = require("sequelize");

export function withRollback(f: () => void) {
  // `_clsRun` is internal, undocumented functionality of Sequelize
  // We're using it here for testing purposes only.
  // This should not be used in production code.
  return Sequelize._clsRun(function() {
    const transaction = new Sequelize.Transaction(sequelize);
    return transaction
      .prepareEnvironment()
      .then(function() {
        return f();
      })
      .finally(function() {
        return transaction.rollback();
      });
  });
}
