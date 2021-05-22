# Auth API
Login &amp; Register API based on SQLite file, with password crypting and UUID System, using [express](https://www.npmjs.com/package/express), [cryptr](https://www.npmjs.com/package/cryptr) and [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) - I'm french and I forgot to translate comments etc, make yourself

# Install / Start
1. `cd src` 
2. Configure `port` and `password` encryption key
3. Execute `npm install`
4. Execute `node index.js`

# Endpoints
## `/register` POST
### Request Body: { `email`,`phone`,`firstname`,`lastname`,`password` }
### Response Body: { `code`, `reason`, `message` }
## `/login` POST
### Request Body: { `email`,`password` }
### Response Body: { `code`, `reason`, `message` } || { `firstname`,`lastname`,`email`,`phone`,`uuid` }
