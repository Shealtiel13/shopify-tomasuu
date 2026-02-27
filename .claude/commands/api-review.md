Review backend code for security, performance, and adherence to NexusHub patterns.

## Review the following

**Target:** $ARGUMENTS

## Review Checklist

### Security
- SQL injection (raw queries, unsanitized input in Sequelize)
- Authentication bypasses (missing auth middleware, token validation gaps)
- Authorization issues (users accessing other users' data)
- Input validation (missing or insufficient)
- Sensitive data exposure in responses (passwords, tokens)
- Mass assignment vulnerabilities (passing req.body directly to create/update)

### Performance
- N+1 query problems (missing eager loading/includes)
- Missing database indexes for frequently queried columns
- Unnecessary data fetching (SELECT * when only specific fields needed)
- Missing pagination on list endpoints

### Project Patterns
- Consistent error handling with try/catch
- Proper HTTP status codes
- Response format consistency (`{ message, data }`)
- Auth middleware applied correctly
- CommonJS module format

Provide specific file:line references and concrete fix suggestions for each issue found.
