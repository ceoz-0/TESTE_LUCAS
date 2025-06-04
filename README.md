# AdonisJS 6 Auth Guard Example

This repository shows a minimal example of how a custom auth guard can support both **session** and **API consumer** flows using AdonisJS 6.

## Features

- `/auth/login` – Issues access and refresh tokens based on `grantType` (`session` or `api`).
- `/auth/register` – Creates a new user and returns a session based token pair.
- `/auth/refresh` – Exchanges a refresh token for a new access token.
- Admin routes under `/api/clients` and `/auth/token/:id` to manage API clients and tokens.
- `AuthGuard` class capable of authenticating via session cookies or bearer tokens with support for abilities stored on each token.

The implementation uses in-memory stores for brevity, but can be wired to a database by replacing the storage layer.
