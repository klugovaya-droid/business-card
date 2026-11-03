let handler;

try {
  const { createHandler } = require('../dist/serverless');

  handler = createHandler('/graphql');
} catch (error) {
  console.error('[business-card] failed to load serverless bundle', error);
  handler = (req, res) => {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'BUNDLE_LOAD_FAILED' }));
  };
}

module.exports = handler;
