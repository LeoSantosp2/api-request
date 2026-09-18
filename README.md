# API Request

An API example created with NodeJS and TypeScript for a complete CRUD model of users with authentication.

## Summary
- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Routes](#routes)
- [Installation](#installation)
- [Tests](#tests)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Execute the Project](#execute-the-project)
- [Project Structure](#project-structure)
- [Contribution](#contribution)
- [License](#license)

## About
Api-request created in NodeJS with TypeScript. This is an api model example that makes requests to a database.

Api-request is an example of API REST created with NodeJS and TypeScript. This project demonstrates a complete model how to create requests to the database, including authentication with JWT, data validation and error handling.

**Tech Stack:**
- NodeJS v18.20.2+
- TypeScript
- Express.js
- Prisma ORM (MariaDB driver adapter)
- MySQL / MariaDB
- JWT to authentication
- Zod for validation and OpenAPI generation
- Helmet for security headers

## Features
- ✅ Complete CRUD of users
- ✅ Login system with email and password
- ✅ Authentication with JWT (JSON Web Tokens)
- ✅ Refresh tokens with rotation, revocation and logout
- ✅ Rate limiting on the login, refresh token and user registration endpoints
- ✅ Security headers with Helmet
- ✅ Datas validation with Zod
- ✅ Error handling
- ✅ Swagger/OpenAPI Documentation
- ✅ Automatic database migrations
- ✅ CORS configuration and request body size limit
- ✅ Health check endpoint

## Requirements
- [NodeJS](https://nodejs.org/en) v18.20.2 or higher
- A database in [MySQL](https://www.mysql.com/) 5.7 or higher
- A tool to http request. For example [Insomnia](https://insomnia.rest/download), [Postman](https://www.postman.com/) or the extension to Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Routes
- URL base: `http://localhost:3333`
- Endpoint docs: `http://localhost:3333/api/docs` (not available in production)
- OpenAPI document (JSON): `http://localhost:3333/api/docs.json` (not available in production)

## Installation

### 1. Clone this repository
```bash
git clone https://github.com/LeoSantosp2/api-request.git
cd api-request
```

### 2. Install the packages
```bash
npm install
# or
yarn install
```

### 3. Configure the environment variables
Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

> On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

The `.env` file must follow the same variables from `.env.example`

### Example:
```env
# API CONFIGURATIONS
API_PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# DATABASE CONFIGURATIONS
DATABASE=database
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_URL="mysql://username:password@127.0.0.1:3306/database"

# LOGIN CONFIGURATIONS
TOKEN_SECRET=your_secret_key
TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7
```

### Variables description
| Variables | Description | Example |
|----------|-----------|---------|
| `API_PORT` | API port | `3333` |
| `NODE_ENV` | Runtime environment | `development`, `production` or `test` |
| `CORS_ORIGIN` | Comma-separated list of allowed CORS origins | `http://localhost:3000,http://localhost:3001` |
| `DATABASE` | Database Name | `database` |
| `DATABASE_HOST` | Server host MySQL | `127.0.0.1` or `localhost` |
| `DATABASE_PORT` | MySQL port | `3306` |
| `DATABASE_USERNAME` | MySQL username | `user` |
| `DATABASE_PASSWORD` | MySQL user password | `password` |
| `DATABASE_URL` | URL prisma connection | `mysql://username:password:3306/db_name` |
| `TOKEN_SECRET` | Secret key to JWT | Random safe string |
| `TOKEN_EXPIRATION` | Access token expiration time | `15m`, `24h`, `7d` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token expiration, **in days** | `7` |

### 4. Execute the migrations

The migrations configure database automatically:
```bash
npm run prisma:migrate
```

### 5. Generate prisma client
```bash
npm run prisma:generate
```

## Tests

This project includes **unit tests** for every layer (**use cases**, **repositories**, **controllers**, **middlewares**, **routes**, **schemas**) and utilities. Unit tests mock the layer below with `jest-mock-extended`; route tests use `supertest`.

- Tests location: `tests/`, mirroring the `src/` layers
- Runner: `jest` + `ts-jest`
- Coverage threshold: **80% global** (see `jest.config.js`)

### Run tests
```bash
npm test
```

### Watch mode
```bash
npm run test:watch
```

### Coverage report
```bash
npm run test:coverage
```

> Current coverage (latest local run): **97.58% statements**, **94% branches**, **98.55% functions**, **98.05% lines**.

## Configuration

### Security headers
Responses go through [`helmet`](https://www.npmjs.com/package/helmet), which sets the usual hardening headers — `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: SAMEORIGIN`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, among others.

HSTS is disabled in helmet (`hsts: false`) and sent by a small middleware only when the request actually arrives over HTTPS (`req.secure`), so local HTTP development is not forced onto `https://`:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

> Behind a reverse proxy (Nginx, Heroku, Render, ...), `req.secure` is only true if Express is told to trust the proxy. Without `app.set('trust proxy', 1)` the HSTS header will not be sent in production.

### Request body limit
JSON bodies are limited to **1mb** (`express.json({ limit: '1mb' })`). Oversized payloads are rejected before reaching a route with `413 Payload Too Large`, and malformed JSON with `400 Bad Request` — both normalized by `error.handler.ts`, which answers with the standard error body and never leaks the body-parser internal message.

### CORS
The API only accepts cross-origin requests from allowed origins, configured through the `CORS_ORIGIN` environment variable (see [Configuration](#configuration) table above):

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

To allow a different frontend origin, add it to the comma-separated list in `.env`.

### Environment-restricted routes
The following routes are only registered when `NODE_ENV` is `development` or `test`. In production they are not mounted and respond `404 Not Found`.

| Route | Note |
|-------|------|
| `GET /api/users` | Lists every registered user. Public — it does **not** require a token, which is why it stays out of production |
| `GET /api/docs` | Swagger UI |
| `GET /api/docs.json` | OpenAPI document |

The per-user `GET /api/users/:id` is available in every environment and requires authentication.

### Rate limiting
Three endpoints are protected by `express-rate-limit` through the shared `request.rate.limit.ts` middleware, each limited per IP. Exceeding a limit returns `429 Too Many Requests`.

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/auth/login` | 5 attempts | 15 minutes |
| `POST /api/auth/refresh-token` | 5 attempts | 15 minutes |
| `POST /api/users` | 5 attempts | 15 minutes |

### Database
The project use prisma ORM. The schema of the database is in `prisma/schema.prisma`.

**Created tables:**
- `users` - Users datas
- `refresh_token` - Refresh tokens issued at login (hashed), with expiration and revocation date. Tied to `users` with `onDelete: Cascade`
- `prisma_migrations` - migrations history

### Swagger/Documentation

The API documentation is generated with [`@asteasolutions/zod-to-openapi`](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi), reusing the same Zod schemas used for request validation. The OpenAPI paths and response schemas live in `src/infrastructure/docs/`, not in the route files.

The interactive documentation of the endpoints is available in:
```
http://localhost:3333/api/docs
```

Both `/api/docs` and `/api/docs.json` are only registered when `NODE_ENV` is `development` or `test`. In production the OpenAPI document is never built and both routes respond `404 Not Found`, so the API surface is not exposed.

## Authentication

This API uses **JWT (JSON Web Tokens)** to authentication.

### Authentication flow
1. User logs in with email and password at the `/api/auth/login` endpoint
2. API returns an `accessToken` (JWT, expires after `TOKEN_EXPIRATION`) and a `refreshToken` (expires after `REFRESH_TOKEN_EXPIRATION` days)
3. To access protected endpoints, include the access token on header:
    ```
    Authorization: Bearer <your_access_token_here>
    ```
4. When the access token expires, exchange the refresh token for a new pair at `/api/auth/refresh-token`. The old refresh token is revoked on use (rotation), so each one works only once
5. To end a session, send the refresh token to `/api/auth/logout`, which revokes it

### Example with curl
```bash
# 1. Login and get the tokens
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Response:
# {
#   "id": "eddcdbb6-0294-4f0e-959c-fea84cd687c4",
#   "email": "john@example.com",
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "9f2c1d4b8a7e6f3c..."
# }

# 2. Use the access token to reach protected endpoints
curl http://localhost:3333/api/users/eddcdbb6-0294-4f0e-959c-fea84cd687c4 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Renew the pair once the access token expires
curl -X POST http://localhost:3333/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"9f2c1d4b8a7e6f3c..."}'

# Response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "1a4d7b0e3c6f9a2d..."
# }

# 4. Logout, revoking the refresh token (204 No Content)
curl -X POST http://localhost:3333/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"1a4d7b0e3c6f9a2d..."}'
```

### Error status codes
| Code | Description |
|--------|-----------|
| 400 | Bad request (Missing or invalid data) |
| 401 | Unauthorized (Missing or invalid token) |
| 403 | Forbidden |
| 404 | Not found |
| 413 | Payload too large (JSON body over 1mb) |
| 429 | Too many requests (rate limit exceeded) |
| 500 | Internal server error |

## Execute the Project

### Dev mode

```bash
npm run dev
```

This command uses **Nodemon** to automatically restart when code changes.

**Success:**
![DevSuccess](./assets/dev-success.png)

The API is available in `http://localhost:3333`

### Available scripts
| Script | Description |
|--------|-----------|
| `npm run dev` | Execute in dev mode with Nodemon |
| `npm run build` | Compile TypeScript for JavaScript |
| `npm start` | Execute the compiled version |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run prisma:generate` | Generate the Prisma Client |
| `npm run prisma:migrate` | Create and apply a migration in development |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio |

## Build to production
The project use [Sucrase](https://www.npmjs.com/package/sucrase) to quick compilation.

### 1. Compile the project
```bash
npm run build
```

This generates the compiled files in the `dist/` folder.

### 2. Run in production
```bash
npm start
```

**Success:**
![ProdSuccess](./assets/prod-success.png)

## Project Structure
```
.
├── assets/              # Visual and resource assets
├── prisma/
│   ├── schema.prisma   # Database schema (Users, RefreshToken)
│   └── migrations/     # Migrations history
├── src/
│   ├── app.ts          # Express configuration, routers and Swagger mount
│   ├── server.ts       # Server initiator
│   ├── domain/          # Entities, Zod schemas and repository contracts
│   │   ├── entities/
│   │   │   ├── users.entity.ts          # User types + UserRepository interface
│   │   │   └── refresh.token.entity.ts  # RefreshToken types + RefreshTokenRepository interface
│   │   ├── schemas/
│   │   │   ├── login.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── refresh.token.schema.ts
│   │   └── interfaces/
│   │       └── request.props.ts         # Typed Express request (body, params, userId)
│   ├── application/     # Use cases (business logic), one class per action
│   │   └── use-case/
│   │       ├── auth/
│   │       │   ├── login.useCase.ts
│   │       │   ├── refreshToken.useCase.ts
│   │       │   └── logout.useCase.ts
│   │       └── users/
│   │           ├── create.useCase.ts
│   │           ├── listAll.useCase.ts
│   │           ├── listOne.useCase.ts
│   │           ├── update.useCase.ts
│   │           └── delete.useCase.ts
│   ├── infrastructure/  # Concrete implementations (Prisma, config, docs)
│   │   ├── config/
│   │   │   └── env.ts                   # Environment variables, validated with Zod
│   │   ├── database/
│   │   │   └── prisma.config.ts         # Shared PrismaClient instance (MariaDB adapter)
│   │   ├── repositories/
│   │   │   ├── prisma.users.repository.ts
│   │   │   └── prisma.refresh.token.repository.ts
│   │   └── docs/                        # OpenAPI documentation (zod-to-openapi)
│   │       ├── registry.ts              # OpenAPIRegistry + bearerAuth security scheme
│   │       ├── common.ts                # Shared response schemas (error/success)
│   │       ├── auth.ts                  # /api/auth/* OpenAPI paths
│   │       ├── users.ts                 # /api/users OpenAPI paths
│   │       ├── health.ts                # /api/health OpenAPI path
│   │       └── generate.document.ts     # Builds the final OpenAPI document
│   └── presentation/    # HTTP layer
│       ├── routes/
│       │   ├── auth.router.ts           # /api/auth/login, /refresh-token, /logout
│       │   └── user.router.ts           # /api/users
│       ├── controllers/
│       │   ├── login.ts
│       │   ├── refresh.token.controller.ts
│       │   └── user.controller.ts
│       ├── middleware/
│       │   ├── error.handler.ts
│       │   ├── login.required.ts
│       │   ├── request.rate.limit.ts
│       │   └── validate.body.ts
│       └── utils/
│           ├── tokens.ts                # Access token signing, refresh token generation/hashing
│           ├── hash.password.ts
│           ├── compare.password.ts
│           ├── http.error.ts
│           └── logger.ts
├── tests/              # Jest tests, mirroring the src/ layers
├── tsconfig.json       # TypeScript config
├── nodemon.json        # Nodemon config
├── package.json        # Dependencies and scripts
├── LICENSE             # Project license
└── README.md           # This file
```

### Architectural pattern

The project follows a **Clean Architecture** style, split into four layers by responsibility: `domain` → `application` → `infrastructure` → `presentation`. Dependencies point inward: the presentation layer depends on application/domain, and infrastructure implements the contracts defined in the domain — never the other way around.

- **Domain** (`src/domain/`): Entities, repository interfaces (`UserRepository`, `RefreshTokenRepository`) and Zod validation schemas. Framework-agnostic.
- **Application** (`src/application/use-case/`): Use cases — one class per action (`CreateUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, ...) — holding the business logic, including the ownership checks on `/api/users/:id`. Depends only on domain interfaces, receiving the repositories via constructor injection.
- **Infrastructure** (`src/infrastructure/`): Concrete implementations of the domain contracts (`PrismaUsersRepository`, `PrismaRefreshTokenRepository`), the shared Prisma client, the validated environment config and the OpenAPI document.
- **Presentation** (`src/presentation/`): HTTP layer — `routes/` define the endpoints and wire controllers to their use cases; `controllers/` read `req`, call the corresponding use case and send `res`; `middleware/` holds the cross-cutting functions (authentication, rate limiting, body validation, error handling); `utils/` holds the token, hashing and error helpers.

### File naming

Files are named in dot-case with a layer suffix: `user.controller.ts`, `prisma.users.repository.ts`, `login.useCase.ts`, `auth.router.ts`. Adding a resource means adding its entity/schema in `domain`, its use cases in `application`, its repository in `infrastructure`, and its controller/router in `presentation` — plus the matching tests under `tests/`.

## Contribution

Feel free to fork the project and submit pull requests with improvements!

## License

This project is licensed under the [License MIT](./LICENSE).

---

**Developed by:** [LeoSantosp2](https://github.com/LeoSantosp2)

**Last update:** September 2026
