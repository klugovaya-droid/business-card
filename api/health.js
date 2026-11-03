let handler;

try {
  const { createHandler } = require('../dist/serverless');

  handler = createHandler('/health');
} catch (error) {
  console.error('[business-card] failed to load serverless bundle', error);
  const message = error instanceof Error ? error.message : String(error);
  const safeMessage = message.replace(
    /(?:prisma\+postgres|postgres(?:ql)?):\/\/[^\s]+/gi,
    '[redacted]',
  );

  handler = (req, res) => {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'BUNDLE_LOAD_FAILED', message: safeMessage }));
  };
}

module.exports = handler;
