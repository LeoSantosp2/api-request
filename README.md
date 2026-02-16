# API Request

An API example created with NodeJS and TypeScript for a complete CRUD model of users with authentication.

## Summary
- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
- [Routes](#routes)
- [Installation](#installation)
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
- JWT para autenticação

## Features
- ✅ Complete CRUD of users
- ✅ Login system with email and password
- ✅ Authentication with JWT (JSON Web Tokens)
- ✅ Datas validation
- ✅ Error handling
- ✅ Swagger/OpenAPI Documentation
- ✅ Automatic database migrations

## Requirements
- [NodeJS](https://nodejs.org/en) v18.20.2 or higher
- A database in [MySQL](https://www.mysql.com/) 5.7 or higher
- A tool to http request. For example [Insomnia](https://insomnia.rest/download), [Postman](https://www.postman.com/) or the extension to Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Routes
- URL base: `http://localhost:3000`
- Users route: `http://localhost:3000/api/users`
- Login route: `http://localhost:3000/api/login`
- Endpoint docs: `http://localhost:3000/api/docs`

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
Create a file with name `.env` and write the variables below:

```env
DATABASE=database_name
DATABASE_HOST=database_host
DATABASE_PORT=database_port
DATABASE_USERNAME=database_username
DATABASE_PASSWORD=database_password
DATABASE_URL=your_database_url

TOKEN_SECRET=token_secret
TOKEN_EXPIRATION=token_expiration

API_PORT=api_port
```

### Example:
```env
DATABASE=database
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_URL="mysql://username:password:3306/database_name"

TOKEN_SECRET=your_secret_key
TOKEN_EXPIRATION=7d

API_PORT=3000
```

Attention: The environment variables should be the same as the example above

### Variables description
| Variables | Description | Example |
|----------|-----------|---------|
| `DATABASE` | Database Name | `database` |
| `DATABASE_HOST` | Server host MySQL | `127.0.0.1` or `localhost` |
| `DATABASE_PORT` | MySQL port | `3306` |
| `DATABASE_USERNAME` | MySQL username | `user` |
| `DATABASE_PASSWORD` | MySQL user password | `password` |
| `DATABASE_URL` | URL prisma connection | `mysql://username:password:3306/db_name` |
| `TOKEN_SECRET` | Secret key to JWT | Random safe string |
| `TOKEN_EXPIRATION` | Token expiration time | `7d`, `24h`, `30d` |
| `API_PORT` | API port | `3000` |

### 4. Execute the migrations

The migrations configure database automatically:
```bash
npm run prisma:migrate
```

## Configuration

### Database
The project use prisma ORM. The schema of the database is in `prisma/schema.prisma`.

**Created tables:**
- `users` - Users datas
- `prisma_migrations` - migrations history

### Swagger/Documentation

The interactive documentation of the endpoints is in available in:
```
http://localhost:3000/api/docs
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
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
# }

# 2. Use token to access protected endpoints
curl http://localhost:3000/api/users \
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

The API is available in `http://localhost:3000`

### Available scripts
| Script | Description |
|--------|-----------|
| `npm run dev` | Execute in dev mode with Nodemon |
| `npm run build` | Compile TypeScript for JavaScript |
| `npm start` | Execute the compiled version |
| `npm run prisma:migrate` | Create and execute migrations |

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
│   │   ├── env.ts      # Environment variables
│   │   ├── prisma.ts   # Prisma instance
│   │   └── swagger.ts  # Swagger Configuration
│   ├── controllers/    # Controllers (request logic)
│   │   ├── login-controller.ts
│   │   └── users-controller.ts
│   ├── services/       # Services (business logic)
│   │   ├── login-service.ts
│   │   └── users-service.ts
│   ├── repositories/   # Repositories (data manipulation)
│   │   ├── login-repository.ts
│   │   └── users-repository.ts
│   ├── routes/         # Routes definition
│   │   ├── login-route.ts
│   │   └── users-route.ts
│   ├── middleware/     # Middlewares
│   │   ├── error-handler.ts
│   │   └── login-required.ts
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

The project follow the layered architecture pattern.

- **Routes**: Define the API endpoints
- **Controllers**: Receives HTTP requests and call the services
- **Services**: Contains the main business logic
- **Repositories**: Abstract the data manipulation with Prisma
- **Middleware**: Intermediaries functions (authentication, error handling)

## Contribution

Feel free to fork the project and submit pull requests with improvements!

## License

This project is licensed under the [License MIT](./LICENSE).

---

**Developed by:** [LeoSantosp2](https://github.com/LeoSantosp2)

**Last update:** February 2026
