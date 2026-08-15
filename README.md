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
- [Contribuition](#contribuition)
- [License](#license)

## About
Api-request created in NodeJS with TypeScript. This is an api model example that makes requests to a database.

Api-request is an example of API REST created with NodeJS and TypeScript. This project demonstrates a complete model how to create requests to the database, including authentication with JWT, data validation and error handling.

**Tech Stack:**
- NodeJS v18.20.2+
- TypeScript
- Express.js
- Prisma ORM
- MySQL
- JWT to authentication

## Features
- ✅ Complete CRUD of users
- ✅ Login system with email and password
- ✅ Authentication with JWT (JSON Web Tokens)
- ✅ Datas validation
- ✅ Error handling
- ✅ Swagger/OpenAPI Documentation
- ✅ Automatic database migrations
- ✅ CORS configuration

## Requirements
- [NodeJS](https://nodejs.org/en) v18.20.2 or higher
- A database in [MySQL](https://www.mysql.com/) 5.7 or higher
- A tool to http request. For example [Insomnia](https://insomnia.rest/download), [Postman](https://www.postman.com/) or the extension to Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Routes
- URL base: `http://localhost:3333`
- Users route: `http://localhost:3333/api/users`
- Login route: `http://localhost:3333/api/login`
- Endpoint docs: `http://localhost:3333/api/docs`

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
TOKEN_EXPIRATION=7d
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
| `TOKEN_EXPIRATION` | Token expiration time | `7d`, `24h`, `30d` |

### 4. Execute the migrations

The migrations configure database automatically:
```bash
npm run prisma:migrate
```

## Tests

This project includes **unit tests** for the main layers (**repositories**, **services**, **controllers**, **middlewares**, **routes**) and utilities.

- Tests location: `tests/`
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

> Current coverage (latest local run): **95.81% statements**, **88% branches**, **96.22% functions**, **96.75% lines**.

## Configuration

### CORS
The API only accepts cross-origin requests from allowed origins, configured through the `CORS_ORIGIN` environment variable (see [Configuration](#configuration) table above):

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

To allow a different frontend origin, add it to the comma-separated list in `.env`.

### Database
The project use prisma ORM. The schema of the database is in `prisma/schema.prisma`.

**Created tables:**
- `users` - Users datas
- `prisma_migrations` - migrations history

### Swagger/Documentation

The API documentation is generated with [`@asteasolutions/zod-to-openapi`](https://www.npmjs.com/package/@asteasolutions/zod-to-openapi), reusing the same Zod schemas used for request validation. The OpenAPI paths and response schemas live in `src/docs/`, not in the route files.

The interactive documentation of the endpoints is available in:
```
http://localhost:3333/api/docs
```

## Authentication

This API uses **JWT (JSON Web Tokens)** to authentication.

### Authentication flow
1. User logs in with email and password at the `/api/login` endpoint
2. API returns a valid JWT token for a determined time period (default: 7 days)
3. To access protected endpoints, include the token on header:
    ```
    Authorization: Bearer <your_token_here>
    ```

### Example with curl
```bash
# 1. Login and get token
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
# }

# 2. Use token to access protected endpoints
curl http://localhost:3333/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error status codes
| Code | Description |
|--------|-----------|
| 400 | Bad request (Missing or invalid data) |
| 401 | Unauthorized (Missing or invalid token) |
| 403 | Forbidden |
| 404 | Not found |
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
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Migrations history
├── src/
│   ├── app.ts          # Express Configuration
│   ├── server.ts       # Server initiator
│   ├── config/         # General configurations
│   │   └── env.ts      # Environment variables
│   ├── docs/           # OpenAPI documentation (zod-to-openapi)
│   │   ├── registry.ts             # OpenAPIRegistry + bearerAuth security scheme
│   │   ├── common.ts               # Shared response schemas (error/success)
│   │   ├── login.ts                # /api/login OpenAPI paths
│   │   ├── users.ts                # /api/users OpenAPI paths
│   │   └── generate-document.ts    # Builds the final OpenAPI document
│   ├── domain/          # Entities, Zod schemas and repository contracts (interfaces)
│   │   ├── login/
│   │   │   ├── login.ts            # Login domain types
│   │   │   └── login.schema.ts     # Zod validation schema
│   │   └── users/
│   │       ├── users.ts            # User entity + UserRepository interface
│   │       └── user.schema.ts      # Zod validation schema
│   ├── application/     # Use cases (business logic), one class per action
│   │   ├── login/
│   │   │   └── login.useCase.ts
│   │   └── users/
│   │       ├── create.useCase.ts
│   │       ├── listAll.useCase.ts
│   │       ├── listOne.useCase.ts
│   │       ├── update.useCase.ts
│   │       └── delete.useCase.ts
│   ├── infraestructure/ # Concrete implementations (Prisma, DB)
│   │   └── database/
│   │       ├── prisma.config.ts            # Shared PrismaClient instance
│   │       └── prisma.users.repository.ts  # UserRepository implementation
│   ├── presentation/    # HTTP layer: routes wire controllers to use cases
│   │   ├── routes/
│   │   │   ├── login.ts
│   │   │   └── users.ts
│   │   └── controllers/
│   │       ├── login.ts
│   │       └── users.ts
│   ├── middleware/     # Middlewares
│   │   ├── error-handler.ts
│   │   ├── login-required.ts
│   │   ├── login-rate-limit.ts
│   │   └── validate-body.ts
│   ├── interfaces/     # TypeScript Interfaces
│   ├── types/          # TypeScript Types
│   └── utils/          # Utilitaries functions
├── tsconfig.json       # TypeScript config
├── nodemon.json        # Nodemon config
├── package.json        # Dependencies and scripts 
├── LICENSE             # Project license
└── README.md           # This file
```

### Architectural pattern

The project follows a **Clean Architecture** style, split into four layers by responsibility: `domain` → `application` → `infraestructure` → `presentation`. Dependencies point inward: the presentation layer depends on application/domain, and infrastructure implements the contracts defined in the domain — never the other way around.

- **Domain** (`src/domain/`): Entities, Zod validation schemas and repository interfaces (e.g. `UserRepository`). Framework-agnostic.
- **Application** (`src/application/`): Use cases — one class per action (`CreateUseCase`, `ListAllUseCase`, ...) — holding the business logic. Depends only on domain interfaces, receiving the repository via constructor injection.
- **Infraestructure** (`src/infraestructure/`): Concrete implementations of the domain contracts, such as `PrismaRepository`, plus the shared Prisma client instance.
- **Presentation** (`src/presentation/`): HTTP layer — `routes/` define the endpoints and wire controllers to their use cases; `controllers/` read `req`, call the corresponding use case and send `res`.
- **Middleware** (`src/middleware/`): Cross-cutting functions (authentication, rate limiting, error handling, body validation).

## Contribution

Feel free to fork the project and submit pull requests with improvements!

## License

This project is licensed under the [License MIT](./LICENSE).

---

**Developed by:** [LeoSantosp2](https://github.com/LeoSantosp2)

**Last update:** August 2026
