const test = require("node:test");
const assert = require("node:assert/strict");

const Job = require("../src/models/Job");
const Application = require("../src/models/Application");
const jobService = require("../src/services/jobService");

test("deleteJob removes associated applications before deleting the job", async () => {
  const originalFindOne = Job.findOne;
  const originalDeleteMany = Application.deleteMany;

  try {
    const deletedJob = {
      _id: "job-123",
      createdBy: "hr-123",
      deleteOne: async () => {
        deletedJob.deleted = true;
      },
    };

    Job.findOne = async ({ _id, createdBy }) => {
      assert.equal(_id, "job-123");
      assert.equal(createdBy, "hr-123");
      return deletedJob;
    };

    Application.deleteMany = async ({ job }) => {
      assert.equal(job, "job-123");
      return { deletedCount: 1 };
    };

    await jobService.deleteJob("job-123", "hr-123");

    assert.equal(deletedJob.deleted, true);
  } finally {
    Job.findOne = originalFindOne;
    Application.deleteMany = originalDeleteMany;
  }
});
