import db from "../src/db/connection";


describe("db_example", () => {
  test("db_example", () => {
    expect(db.query.cards).not.toBeNull();
  });
});
