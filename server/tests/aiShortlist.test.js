const test = require("node:test");
const assert = require("node:assert/strict");

const applicationService = require("../src/services/applicationService");
const Application = require("../src/models/Application");
const Job = require("../src/models/Job");

test("getAIShortlistForHR sorts candidates by match score", async () => {
  const originalJobFindOne = Job.findOne;
  const originalApplicationFind = Application.find;

  const hrId = "64f1b8f8f8f8f8f8f8f8f8f";
  const jobId = "64f1b8f8f8f8f8f8f8f8f90";

  Job.findOne = async ({ _id, createdBy }) => {
    assert.equal(_id, jobId);
    assert.equal(createdBy, hrId);

    return {
      _id: jobId,
      title: "Frontend Developer",
      description: "Build React app with TypeScript and API integration",
      skills: ["React", "TypeScript", "REST API"],
      createdBy: hrId,
    };
  };

  Application.find = (conditions) => {
    assert.equal(conditions.job, jobId);

    const data = [
      {
        _id: "64f1b8f8f8f8f8f8f8f8f91",
        status: "PENDING",
        candidate: { name: "Alice", email: "alice@test.com" },
        cv: {
          aiAnalysis: {
            skills: ["React", "JavaScript"],
            summary: "React developer",
            experienceYears: 2,
          },
        },
        job: jobId,
      },
      {
        _id: "64f1b8f8f8f8f8f8f8f8f92",
        status: "PENDING",
        candidate: { name: "Bob", email: "bob@test.com" },
        cv: {
          aiAnalysis: {
            skills: ["React", "TypeScript", "REST API", "Node.js"],
            summary: "Fullstack developer",
            experienceYears: 4,
          },
        },
        job: jobId,
      },
    ];

    return {
      populate: () => ({
        populate: () => ({
          lean: async () => data,
        }),
      }),
    };
  };

  try {
    const result = await applicationService.getAIShortlistForHR(hrId, jobId);

    assert.equal(result.jobTitle, "Frontend Developer");
    assert.equal(result.shortlist.length, 2);
    assert.ok(result.shortlist[0].score >= result.shortlist[1].score);
    assert.ok(result.shortlist[0].matchedSkills.includes("React"));
  } finally {
    Job.findOne = originalJobFindOne;
    Application.find = originalApplicationFind;
  }
});
