# Auth Playground

A small backend-focused authentication project built with Node.js, Express, Prisma, PostgreSQL, JWT, Zod, and bcrypt.

The goal of this project is to deeply understand how authentication works in modern web applications by building the core pieces manually.


---

## Disclaimer

This project is a learning-focused authentication/security playground intended to explore backend architecture and security concepts progressively.

The goal is to understand authentication flows, token management, validation, and secure backend practices rather than immediately build a production-ready authentication service.

---

# Features

## Current Features

- User registration
- User login
- JWT authentication
- Protected routes
- Password hashing with bcrypt
- Request validation with Zod
- Prisma ORM + PostgreSQL
- JWT access + refresh token authentication
- Refresh token rotation
- Logout / session invalidation


---

# Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- JWT (`jsonwebtoken`)
- bcrypt
- Zod

---

# Project Structure

```txt
jwt-auth-playground/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── prisma.ts
│   │
│   └── auth/
│       ├── auth.routes.ts
│       ├── auth.controller.ts
│       ├── auth.middleware.ts
│       ├── auth.schemas.ts
│       └── auth.utils.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

# User Model

```prisma
model User {
  id              String            @id @default(cuid())
  email           String            @unique
  password        String
  role            Role              @default(USER)
  refreshTokens   RefreshToken[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

# Refresh Token Model

```prisma
model RefreshToken {
  id              String            @id @default(cuid())
  tokenHash       String            @unique
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  expiresAt       DateTime
  revokedAt       DateTime?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

---

# Installation

## 1. Initialize Project

```bash
npm init -y
```

## 2. Install Dependencies

### Production Dependencies

```bash
npm i express cors dotenv bcrypt jsonwebtoken zod @prisma/client
```

### Development Dependencies

```bash
npm i -D typescript tsx prisma \
@types/node \
@types/express \
@types/bcrypt \
@types/jsonwebtoken
```

---

# Initialize TypeScript

```bash
npx tsc --init
```

---

# Initialize Prisma

```bash
npx prisma init
```

---

# Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="super_secret_key"
PORT=3001
```

---

# Prisma Migration

After creating the `User` model:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

---

# Development Workflow

Add this script to `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/server.ts"
}
```

Run development server:

```bash
npm run dev
```

---

# API Routes

## Register

### POST `/auth/register`

### Request

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cmpiidmfd0000uotdpttmiquw",
    "email": "test2@mail.com"
  }
}
```

---

## Login

### POST `/auth/login`

### Request

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### Response

```json
{
  "status": "success",
  "data": {
    "id": "clx123",
    "email": "test@example.com",
  },
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

---

## Refresh

### POST `/auth/refresh`

### Request

```json
{
  "refreshToken": "new_refresh_token"
}
```

### Response

```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

## Logout

### POST `/auth/logout`

### Request

```json
{
  "refreshToken": "new_refresh_token"
}
```

### Response

```json
{
  "message": "Logged out successfully"
}
```

---


## Protected Route

### GET `/auth/me`

### Headers

```txt
Authorization: Bearer <token>
```

### Response

```json
{
  "user": {
    "id": "clx123",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

## Admin Route

### GET `/auth/admin`

### Headers

Authorization: Bearer <token>

### Access

ADMIN only

---

# Build Order

## Phase 1 (MVP)

- [x] Basic Express server
- [x] Connect Prisma
- [x] Create User model
- [x] Register route
- [x] Login route
- [x] JWT creation
- [x] Auth middleware
- [x] Protected `/me` route

---

## Phase 2

- [x] Refresh tokens
- [x] Role-based middleware
- [ ] Secure HTTP-only cookies
- [ ] Rate limiting
- [ ] Email verification
- [ ] Password reset
- [ ] OAuth / Google login
- [ ] 2FA

---

# Learning Goals

This project is meant to teach:

- Authentication flow
- Password hashing
- JWT creation and verification
- Middleware architecture
- Authorization vs authentication
- Prisma + PostgreSQL workflows
- Secure backend practices
- API structure and organization

---

# Security Concepts Practiced

- Password hashing with bcrypt
- JWT authentication
- Access token vs refresh token architecture
- Refresh token rotation
- Token revocation
- Session invalidation
- Request validation with Zod
- Transaction-safe token rotation
- Race condition prevention
- Role-based access control (RBAC)
- Authentication vs authorization

---

# Authentication Flow

```txt
User registers
→ Password hashed with bcrypt
→ User saved in database

User logs in
→ Password compared with bcrypt
→ Access token generated
→ Refresh token generated
→ Refresh token hashed and stored in database

Protected route accessed
→ Middleware verifies access token
→ User information attached to request
→ Route returns protected data

Admin route accessed
→ Role middleware checks permissions
→ Unauthorized roles rejected
→ Authorized roles granted access

Access token expires
→ Client sends refresh token
→ Refresh token validated
→ Old refresh token revoked
→ New access token issued
→ New refresh token issued

User logs out
→ Refresh token revoked
→ Session invalidated
```

---


# Notes

This project intentionally starts small.

The goal is not to build a production-scale authentication system immediately, but to deeply understand the fundamentals first.

Focus on:
- completing features
- understanding the flow
- testing endpoints manually
- reading and modifying your own code

Avoid over-engineering early on.
