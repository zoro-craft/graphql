# GraphQL API Setup

## GraphQL Endpoint
```
https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql
```

## GraphQL IDE
```
https://learn.zone01oujda.ma/graphiql
```

## Profile Display

Your profile must display three pieces of information (choose from):
- Basic user identification ✓
- XP amount ✓
- Grades
- Audits ✓
- Skills

### Mandatory Section
A statistics section for generating statistic graphs:
- Audit ratio
- XP earned in a time period (progress over time)

## Authentication

### Step 1: Sign In
Get a JWT from the signin endpoint:
```
POST https://learn.zone01oujda.ma/api/auth/signin
```

Provide credentials using **Basic authentication** (base64 encoded):
- `username:password`
- `email:password`

### Step 2: GraphQL Queries
Supply the JWT using **Bearer authentication** in the Authorization header. This only grants access to the authenticated user's data.

### JWT Inspection
You can inspect the JWT to discover the ID of the authenticated user.
