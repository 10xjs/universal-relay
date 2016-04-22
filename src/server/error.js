export const DEFAULT_STATUS = 500;
export const MIN_STATUS = 400;

function getStatusCode(err) {
  const status = err.status || err.statusCode;
  return !isNaN(parseInt(status, 10)) && status >= MIN_STATUS
    ? status
    : DEFAULT_STATUS;
}

export default function error(app) {
  return {
    ...app,
    error(err, req, res) {
      const status = getStatusCode(err);
      const stack = `<pre>${err.stack}</pre>`;
      const message = `<code>${err.message}</code>`;
      const body = `<!DOCTYPE html>
<html>
<head>
<title>Error ${status}</title>
<style>
body{font-family: sans-serif; color: #333}
</style>
</head>
<body>
<h1>Error ${status}</h1>
${message}
${stack}
</body>
</html>`;

      res.statusCode = status;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(body);
    },
  };
}
