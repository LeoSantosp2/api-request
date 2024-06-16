# Api Request

## About
Api-request created in NodeJS with TypeScript. This a api-request model where, makes requests to a database.

## Features
- CRUD of the users
- Login with email and password

## Requirements
- [NodeJS](https://nodejs.org/en) v18.20.2 or higher
- A database in MySQL with datas
- A tool to http request. For example [Insomnia](https://insomnia.rest/download) or the extension to Visual Studio Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Routes
- URL base: `http://localhost:3000`
- Users route: `http://localhost:3000/users`
- Login route: `http://localhost:3000/login`

## Usage
1- Clone this respository with the `git clone https://github.com/LeoSantosp2/api-request.git`.

2- Install the package with the command `npm i` or `npm install`. You can use better `yarn`.

3- Create file with name `.env` and write the variables below:
```
DATABASE=database_name
DATABASE_HOST=database_host
DATABASE_PORT=database_port
DATABASE_USERNAME=database_username
DATABASE_PASSWORD=database_password

TOKEN_SECRET=token_secret
TOKEN_EXPIRATION=token_expiration

API_PORT=api_port
```

### Example:
```
DATABASE=database
DATABASE_HOST=0.0.0.0
DATABASE_PORT=3306
DATABASE_USERNAME=user
DATABASE_PASSWORD=password

TOKEN_SECRET=8uh48h3489hv34nivi
TOKEN_EXPIRATION=7d

API_PORT=3000
```

Atention: The ambient variables it has to be equals the example above.

4- execute the command `npm run dev`.

Success image:
![DevSuccess](./assets/dev-success.png)

# Build Project

You can build the project using [Sucrase](https://www.npmjs.com/package/sucrase) library.

1- Execute the command `npm run build`.

2- After doing build, execute the command `npm start`

Success image:
![ProdSuccess](./assets/prod-success.png)