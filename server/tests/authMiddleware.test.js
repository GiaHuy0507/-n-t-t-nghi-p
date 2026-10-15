const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { protect } = require("../src/middlewares/authMiddleware");

const runProtect = (token) => {
  const req = { headers: { authorization: `Bearer ${token}` } };
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  protect(req, response, () => {
    nextCalled = true;
  });

  return { req, response, nextCalled };
};

test("protect accepts a valid JWT", () => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret";

  try {
    const token = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET);
    const { req, response, nextCalled } = runProtect(token);

    assert.equal(nextCalled, true);
    assert.equal(req.user.userId, "user-1");
    assert.equal(response.statusCode, 200);
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
});

test("protect reports expired tokens distinctly", () => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret";

  try {
    const token = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET, {
      expiresIn: -1,
    });
    const { response } = runProtect(token);

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.code, "TOKEN_EXPIRED");
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
});

test("protect reports missing JWT configuration as a server error", () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    const { response } = runProtect("any-token");

    assert.equal(response.statusCode, 500);
    assert.equal(response.body.code, "AUTH_CONFIG_MISSING");
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});
