const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { expect } = chai;
const app = require("../src/app");
const pool = require("../src/db");

describe("Time-Travel CRUD API", function () {
  // Increase timeout if necessary for DB
  this.timeout(5000);

  // Initialize database before all tests
  before(async () => {
    // Use a different database or ensure tests are isolated
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          record_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          version INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
          valid_to TIMESTAMP(3) NULL,
          is_deleted BOOLEAN DEFAULT FALSE,
          INDEX idx_record_id (record_id),
          INDEX idx_valid_to (valid_to)
      );
    `);
  });

  // Clean up after each test to ensure isolation
  afterEach(async () => {
    await pool.query("DELETE FROM records");
  });

  after(async () => {
    await pool.end();
  });

  it("should create a new record and set version to 1", async () => {
    const res = await chai
      .request(app)
      .post("/api/records")
      .send({ title: "First Post", content: "Hello World" });

    expect(res.statusCode).to.equal(201);
    expect(res.body.title).to.equal("First Post");
    expect(res.body.version).to.equal(1);
    expect(res.body).to.have.property("record_id");
  });

  it("should update a record and increment version", async () => {
    // 1. Create
    const createRes = await chai
      .request(app)
      .post("/api/records")
      .send({ title: "Original", content: "V1" });

    const recordId = createRes.body.record_id;

    // 2. Update
    const updateRes = await chai
      .request(app)
      .put(`/api/records/${recordId}`)
      .send({ title: "Updated", content: "V2" });

    expect(updateRes.statusCode).to.equal(200);
    expect(updateRes.body.version).to.equal(2);
    expect(updateRes.body.title).to.equal("Updated");

    // 3. Verify history has 2 items
    const historyRes = await chai
      .request(app)
      .get(`/api/records/${recordId}/history`);
    expect(historyRes.body).to.be.an("array").with.lengthOf(2);
    expect(historyRes.body[0].version).to.equal(2); // descending order
    expect(historyRes.body[1].version).to.equal(1);
  });

  it("should soft-delete a record, closing its valid_to and adding a deleted version", async () => {
    // 1. Create
    const createRes = await chai
      .request(app)
      .post("/api/records")
      .send({ title: "To Delete", content: "V1" });

    const recordId = createRes.body.record_id;

    // 2. Delete
    const delRes = await chai.request(app).delete(`/api/records/${recordId}`);
    expect(delRes.statusCode).to.equal(200);

    // 3. Ensure it DOES NOT appear in active records
    const activeRes = await chai.request(app).get("/api/records");
    expect(activeRes.body).to.have.lengthOf(0); // Assuming isolated test DB

    // 4. Ensure it DOES appear in history as version 2 with is_deleted true
    const historyRes = await chai
      .request(app)
      .get(`/api/records/${recordId}/history`);
    expect(historyRes.body[0].version).to.equal(2);
    expect(historyRes.body[0].is_deleted).to.equal(1);
  });

  it("should properly rollback to a previous version", async () => {
    // 1. Create V1
    const createRes = await chai
      .request(app)
      .post("/api/records")
      .send({ title: "RollbackTarget", content: "V1 Content" });
    const recordId = createRes.body.record_id;

    // 2. Update to V2
    await chai
      .request(app)
      .put(`/api/records/${recordId}`)
      .send({ title: "Bad Update", content: "V2 Content" });

    // 3. Update to V3
    await chai
      .request(app)
      .put(`/api/records/${recordId}`)
      .send({ title: "Worse Update", content: "V3 Content" });

    // 4. Rollback to V1
    const rollbackRes = await chai
      .request(app)
      .post(`/api/records/${recordId}/rollback/1`);

    expect(rollbackRes.statusCode).to.equal(200);
    expect(rollbackRes.body.new_version).to.equal(4); // the new state is version 4!
    expect(rollbackRes.body.record.title).to.equal("RollbackTarget");
    expect(rollbackRes.body.record.content).to.equal("V1 Content");
  });
});
