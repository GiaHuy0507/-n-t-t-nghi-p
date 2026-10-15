const test = require("node:test");
const assert = require("node:assert/strict");
const {
  matchCVToJob,
  suggestCVImprovement,
  generateJobDescription,
} = require("../src/services/aiService");

test("matchCVToJob returns a normalized score and missing skills", () => {
  const cvAnalysis = {
    summary: "Frontend developer with React and JavaScript experience",
    skills: ["React", "JavaScript", "CSS", "REST API"],
    experienceYears: 3,
  };

  const job = {
    title: "Frontend Developer",
    description: "Build web interfaces with React, JavaScript and CSS",
    skills: ["React", "JavaScript", "TypeScript", "Node.js"],
  };

  const result = matchCVToJob(cvAnalysis, job);

  assert.ok(
    result.score >= 50 && result.score <= 100,
    "score should be between 50 and 100",
  );
  assert.equal(result.matchedSkills.includes("React"), true);
  assert.equal(result.matchedSkills.includes("JavaScript"), true);
  assert.ok(Array.isArray(result.missingSkills));
  assert.ok(
    result.summary.includes("React") || result.summary.includes("JavaScript"),
  );
});

test("suggestCVImprovement prioritizes critical missing skills", () => {
  const cvAnalysis = {
    summary: "Frontend developer with React and JavaScript experience.",
    skills: ["React", "JavaScript", "CSS"],
    experienceYears: 2,
  };

  const job = {
    title: "Frontend Developer",
    description: "Build UI with React, TypeScript and REST API integration",
    skills: ["React", "TypeScript", "REST API"],
  };

  const result = suggestCVImprovement(cvAnalysis, job);

  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 2);
  assert.ok(result.some((item) => item.includes("TypeScript")));
  assert.ok(result.some((item) => item.includes("REST API")));
});

test("matchCVToJob recognizes skills evidenced in work experience", () => {
  const result = matchCVToJob(
    {
      summary: "Backend developer",
      skills: ["Node.js"],
      experienceYears: 1,
      workExperience: [
        {
          position: "Backend Developer",
          highlights: ["Built data services with SQL and PostgreSQL"],
        },
      ],
    },
    {
      title: "Backend Developer",
      description: "Requires at least 3 years of experience",
      skills: ["Node.js", "SQL", "Java"],
    },
  );

  assert.deepEqual(result.matchedSkills, ["Node.js", "SQL"]);
  assert.deepEqual(result.missingSkills, ["Java"]);
  assert.equal(result.breakdown.skills, 67);
  assert.equal(result.breakdown.role, 100);
  assert.equal(result.breakdown.experience, 33);
  assert.equal(result.score, 67);
});

test("suggestCVImprovement does not call evidenced skills missing", () => {
  const suggestions = suggestCVImprovement(
    {
      skills: ["React"],
      workExperience: [
        { highlights: ["Built accessible interfaces with TypeScript"] },
      ],
    },
    { title: "Frontend Developer", skills: ["React", "TypeScript"] },
  );

  assert.equal(
    suggestions.some((suggestion) => suggestion.includes("TypeScript")),
    false,
  );
});

test("generateJobDescription creates a readable job brief from requirements", () => {
  const result = generateJobDescription({
    title: "Frontend Developer",
    company: "TechHub",
    location: "Hà Nội",
    skills: ["React", "TypeScript", "REST API"],
    experience: "2 năm",
  });

  assert.ok(result.title.includes("Frontend Developer"));
  assert.ok(result.description.toLowerCase().includes("react"));
  assert.ok(result.requirements.some((item) => item.includes("TypeScript")));
  assert.ok(result.skills.includes("React"));
});
