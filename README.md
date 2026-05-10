# JWT Auth Playground

A small backend-focused authentication project built with Node.js, Express, Prisma, PostgreSQL, JWT, Zod, and bcrypt.

The goal of this project is to deeply understand how authentication works in modern web applications by building the core pieces manually.

---

# Features

## MVP Features

- User registration
- User login
- JWT authentication
- Protected routes
- Password hashing with bcrypt
- Request validation with Zod
- Prisma ORM + PostgreSQL
- Role-based authorization (`USER` / `ADMIN`)

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
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
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
  "user": {
    "id": "clx123",
    "email": "test@example.com",
    "role": "USER"
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
  "accessToken": "jwt_token_here",
  "user": {
    "id": "clx123",
    "email": "test@example.com",
    "role": "USER"
  }
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

---

# Build Order

## Phase 1 (MVP)

- [ ] Basic Express server
- [ ] Connect Prisma
- [ ] Create User model
- [ ] Register route
- [ ] Login route
- [ ] JWT creation
- [ ] Auth middleware
- [ ] Protected `/me` route

---

## Phase 2

- [ ] Refresh tokens
- [ ] Secure HTTP-only cookies
- [ ] Role-based middleware
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

# Authentication Flow

```txt
User registers
→ Password gets hashed
→ User saved in database

User logs in
→ Password compared with bcrypt
→ JWT generated

Protected route accessed
→ Middleware verifies JWT
→ User information attached to request
→ Route returns protected data
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