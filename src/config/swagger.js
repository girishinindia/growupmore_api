/**
 * ═══════════════════════════════════════════════════════════════
 * SWAGGER / OPENAPI 3.0 SPECIFICATION
 * ═══════════════════════════════════════════════════════════════
 * Comprehensive API documentation for GrowUpMore E-Learning API.
 * Accessible at /api-docs when the server is running.
 * ═══════════════════════════════════════════════════════════════
 */

const config = require('./index');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'GrowUpMore E-Learning Platform API',
    description: `
## Overview
The **GrowUpMore E-Learning API** is a comprehensive RESTful API powering an online learning platform built with **Express 5**, **Supabase (PostgreSQL)**, and **Upstash Redis**.

## Authentication
- **JWT Bearer Token** — Include \`Authorization: Bearer <token>\` in all protected requests.
- Access tokens expire in **15 minutes**; refresh tokens last **7 days**.
- Login supports **email OR mobile** as the identifier.

## Registration Flow (3-Step, Dual OTP)
1. \`POST /auth/register\` — Validates input, stores pending data in Redis, sends OTPs to both email (Brevo) and mobile (SMSGatewayHub). Returns \`registration_token\`. Expires in 10 minutes.
2. \`POST /auth/verify-registration-email\` — Verifies email OTP using \`registration_token\` + \`otp\`.
3. \`POST /auth/verify-registration-mobile\` — Verifies mobile OTP using \`registration_token\` + \`otp\`.
4. Once BOTH verified → user row created in DB, JWT tokens returned. Admin receives notification email on every registration.
5. \`POST /auth/resend-registration-otp\` — Resend OTP for pending registration to either channel (email or mobile).

## Password Reset Flow
1. \`POST /auth/forgot-password\` — Provide email or mobile, OTP sent to email
2. \`POST /auth/verify-reset-otp\` — Verify OTP, receive a \`reset_token\`
3. \`POST /auth/reset-password\` — Use \`reset_token\` + new password

## Rate Limiting
| Tier | Limit | Window |
|------|-------|--------|
| Global | 100 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |
| Strict (OTP resend) | 5 requests | 1 hour |

## Pagination
All list endpoints support: \`?page=1&limit=20&sort=name&order=asc&search=keyword\`

## reCAPTCHA
Google reCAPTCHA v3 is active on registration, login, and forgot-password. **Skipped locally** when \`RECAPTCHA_SKIP=true\`.

## Response Format
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "meta": { "pagination": { "page": 1, "limit": 20, "totalRecords": 100, "totalPages": 5 } }
}
\`\`\`
    `,
    version: '1.0.0',
    contact: {
      name: 'GrowUpMore Support',
      email: 'info@growupmore.com',
      url: 'https://growupmore.com',
    },
    license: {
      name: 'Private',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Local Development Server',
    },
    {
      url: 'https://api.growupmore.com/api/v1',
      description: 'Production Server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication — Register, Login, OTP, Password Reset, Token Management' },
    { name: 'Users', description: 'User Management (Admin) — CRUD, Role Assignment, Activate/Deactivate' },
    { name: 'Roles', description: 'Roles CRUD — Create, Update, Delete, Restore roles' },
    { name: 'Role Permissions', description: 'Assign/Remove permissions to/from roles' },
    { name: 'User Role Assignments', description: 'Assign/Revoke roles to/from users' },
    { name: 'Permissions', description: 'Permissions CRUD' },
    { name: 'Modules', description: 'Modules CRUD — Logical grouping for permissions' },
    { name: 'Countries', description: 'Master Data — Countries' },
    { name: 'States', description: 'Master Data — States' },
    { name: 'Cities', description: 'Master Data — Cities' },
    { name: 'Languages', description: 'Master Data — Languages' },
    { name: 'Categories', description: 'Master Data — Categories' },
    { name: 'Sub-Categories', description: 'Master Data — Sub-Categories' },
    { name: 'Skills', description: 'Master Data — Skills' },
    { name: 'Education Levels', description: 'Master Data — Education Levels' },
    { name: 'Designations', description: 'Master Data — Designations' },
    { name: 'Specializations', description: 'Master Data — Specializations' },
    { name: 'Learning Goals', description: 'Master Data — Learning Goals' },
    { name: 'Social Medias', description: 'Master Data — Social Media Platforms' },
    { name: 'Document Types', description: 'Master Data — Document Types' },
  ],

  // ─── Security Schemes ──────────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token. Obtain via POST /auth/login.',
      },
    },

    // ─── Reusable Schemas ──────────────────────────────────────
    schemas: {
      // ── Standard Responses ──
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
        },
      },
      RegistrationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 201 },
          message: { type: 'string', example: 'OTPs have been sent to g***h@example.com and ****3210. Please verify both to complete registration.' },
          data: {
            type: 'object',
            properties: {
              registration_token: { type: 'string', example: 'a1b2c3d4e5f6...64-char-hex-token...' },
            },
          },
        },
      },
      RegistrationCompleteResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Registration complete! Both email and mobile verified. Welcome to GrowUpMore!' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                },
              },
              registration_complete: { type: 'boolean', example: true },
            },
          },
        },
      },
      CreatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 201 },
          message: { type: 'string', example: 'Created successfully' },
          data: { type: 'object' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { type: 'array', items: { type: 'object' } },
          meta: {
            type: 'object',
            properties: {
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 20 },
                  totalRecords: { type: 'integer', example: 150 },
                  totalPages: { type: 'integer', example: 8 },
                  hasNextPage: { type: 'boolean', example: true },
                  hasPrevPage: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation failed.' },
          error: { type: 'string' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
        },
      },
      UnauthorizedError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 401 },
          message: { type: 'string', example: 'Authentication required.' },
        },
      },
      ForbiddenError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 403 },
          message: { type: 'string', example: 'Insufficient permissions.' },
        },
      },
      NotFoundError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 404 },
          message: { type: 'string', example: 'Resource not found.' },
        },
      },

      // ── Auth Schemas ──
      RegisterRequest: {
        type: 'object',
        required: ['first_name', 'last_name', 'email', 'mobile', 'password', 'agree_to_terms'],
        properties: {
          first_name: { type: 'string', example: 'Girish', minLength: 2, maxLength: 50 },
          last_name: { type: 'string', example: 'Kumar', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email', example: 'girish@example.com' },
          mobile: { type: 'string', example: '9876543210', description: 'Indian mobile (10 digits, starts with 6-9)' },
          password: { type: 'string', format: 'password', example: 'MyStr0ng@Pass', description: 'Min 8 chars, uppercase, lowercase, number, special char' },
          country_id: { type: 'integer', example: 1, default: 1 },
          agree_to_terms: { type: 'boolean', example: true },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'girish@example.com', description: 'Email address OR mobile number' },
          password: { type: 'string', format: 'password', example: 'MyStr0ng@Pass' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer', example: 1 },
                  first_name: { type: 'string', example: 'Girish' },
                  last_name: { type: 'string', example: 'Kumar' },
                  email: { type: 'string', example: 'girish@example.com' },
                  mobile: { type: 'string', example: '9876543210' },
                  role: { type: 'string', example: 'admin' },
                },
              },
              access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              expires_in: { type: 'string', example: '15m' },
            },
          },
        },
      },
      VerifyRegistrationEmailRequest: {
        type: 'object',
        required: ['registration_token', 'otp'],
        properties: {
          registration_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          otp: { type: 'string', example: '123456', pattern: '^\\d{6}$' },
        },
      },
      VerifyEmailOtpRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email', example: 'girish@example.com' },
          otp: { type: 'string', example: '123456', pattern: '^\\d{6}$', description: 'Exactly 6 digits' },
        },
      },
      VerifyRegistrationMobileRequest: {
        type: 'object',
        required: ['registration_token', 'otp'],
        properties: {
          registration_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          otp: { type: 'string', example: '654321', pattern: '^\\d{6}$' },
        },
      },
      VerifyMobileOtpRequest: {
        type: 'object',
        required: ['mobile', 'otp'],
        properties: {
          mobile: { type: 'string', example: '9876543210' },
          otp: { type: 'string', example: '123456', pattern: '^\\d{6}$' },
        },
      },
      ResendRegistrationOtpRequest: {
        type: 'object',
        required: ['registration_token', 'channel'],
        properties: {
          registration_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          channel: { type: 'string', enum: ['email', 'mobile'], example: 'mobile', description: 'Which channel to resend OTP to' },
        },
      },
      ResendOtpRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'girish@example.com' },
          purpose: { type: 'string', enum: ['verify_email', 'verify_mobile', 'reset_password'], default: 'verify_email' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['identifier'],
        properties: {
          identifier: { type: 'string', example: 'girish@example.com', description: 'Email or mobile number' },
        },
      },
      VerifyResetOtpRequest: {
        type: 'object',
        required: ['identifier', 'otp'],
        properties: {
          identifier: { type: 'string', example: 'girish@example.com' },
          otp: { type: 'string', example: '123456' },
        },
      },
      VerifyResetOtpResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OTP verified. Use the reset_token to set new password.' },
          data: {
            type: 'object',
            properties: {
              reset_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
            },
          },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['reset_token', 'new_password', 'confirm_password'],
        properties: {
          reset_token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          new_password: { type: 'string', format: 'password', example: 'NewStr0ng@Pass' },
          confirm_password: { type: 'string', format: 'password', example: 'NewStr0ng@Pass' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['current_password', 'new_password', 'confirm_password'],
        properties: {
          current_password: { type: 'string', format: 'password', example: 'MyStr0ng@Pass' },
          new_password: { type: 'string', format: 'password', example: 'NewStr0ng@Pass' },
          confirm_password: { type: 'string', format: 'password', example: 'NewStr0ng@Pass' },
        },
      },
      RequestEmailChangeRequest: {
        type: 'object',
        required: ['new_email'],
        properties: {
          new_email: { type: 'string', format: 'email', example: 'newemail@example.com' },
        },
      },
      VerifyOtpOnly: {
        type: 'object',
        required: ['otp'],
        properties: {
          otp: { type: 'string', example: '123456', pattern: '^\\d{6}$' },
        },
      },
      RequestMobileChangeRequest: {
        type: 'object',
        required: ['new_mobile'],
        properties: {
          new_mobile: { type: 'string', example: '9123456780' },
        },
      },

      // ── User Schemas ──
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          first_name: { type: 'string', example: 'Girish' },
          last_name: { type: 'string', example: 'Kumar' },
          email: { type: 'string', example: 'girish@example.com' },
          mobile: { type: 'string', example: '9876543210' },
          role: { type: 'string', example: 'admin' },
          is_active: { type: 'boolean', example: true },
          email_verified_at: { type: 'string', format: 'date-time', nullable: true },
          mobile_verified_at: { type: 'string', format: 'date-time', nullable: true },
          country_id: { type: 'integer', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['first_name', 'last_name'],
        properties: {
          first_name: { type: 'string', example: 'Rahul', minLength: 2, maxLength: 50 },
          last_name: { type: 'string', example: 'Sharma', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email', example: 'rahul@example.com' },
          mobile: { type: 'string', example: '9876543211' },
          password: { type: 'string', format: 'password', example: 'Temp@1234' },
          role: { type: 'string', enum: ['super_admin', 'admin', 'student', 'instructor'], default: 'student' },
          country_id: { type: 'integer', example: 1, default: 1 },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          first_name: { type: 'string', example: 'Rahul' },
          last_name: { type: 'string', example: 'Sharma' },
          country_id: { type: 'integer', example: 1 },
        },
      },
      UpdateUserRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['super_admin', 'admin', 'student', 'instructor'], example: 'instructor' },
        },
      },
      SetActiveRequest: {
        type: 'object',
        required: ['is_active'],
        properties: {
          is_active: { type: 'boolean', example: false },
        },
      },

      // ── Role Schemas ──
      Role: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Administrator' },
          code: { type: 'string', example: 'admin' },
          slug: { type: 'string', example: 'administrator' },
          description: { type: 'string', example: 'Full system access' },
          level: { type: 'integer', example: 1 },
          parent_role_id: { type: 'integer', nullable: true },
          is_system_role: { type: 'boolean', example: true },
          is_active: { type: 'boolean', example: true },
        },
      },
      CreateRoleRequest: {
        type: 'object',
        required: ['name', 'code', 'slug', 'level'],
        properties: {
          name: { type: 'string', example: 'Content Manager', minLength: 2, maxLength: 100 },
          code: { type: 'string', example: 'content_mgr', minLength: 2, maxLength: 50 },
          slug: { type: 'string', example: 'content-manager', minLength: 2, maxLength: 100 },
          description: { type: 'string', example: 'Manages course content and blogs', maxLength: 500 },
          parent_role_id: { type: 'integer', nullable: true, example: 2 },
          level: { type: 'integer', example: 3, minimum: 0, maximum: 100 },
          is_system_role: { type: 'boolean', default: false },
          display_order: { type: 'integer', default: 0 },
          icon: { type: 'string', nullable: true, example: 'edit-3' },
          color: { type: 'string', nullable: true, example: '#3B82F6' },
          is_active: { type: 'boolean', default: true },
        },
      },
      UpdateRoleRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Updated description' },
          level: { type: 'integer', example: 3 },
          is_active: { type: 'boolean' },
        },
      },

      // ── Permission Schemas ──
      Permission: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          module_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Create Users' },
          code: { type: 'string', example: 'users.create' },
          resource: { type: 'string', example: 'users' },
          action: { type: 'string', example: 'create' },
          scope: { type: 'string', example: 'global' },
          is_active: { type: 'boolean', example: true },
        },
      },
      CreatePermissionRequest: {
        type: 'object',
        required: ['module_id', 'name', 'code', 'resource', 'action'],
        properties: {
          module_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Delete Courses', minLength: 2, maxLength: 100 },
          code: { type: 'string', example: 'courses.delete', minLength: 2, maxLength: 100 },
          description: { type: 'string', example: 'Permission to delete courses', maxLength: 500 },
          resource: { type: 'string', example: 'courses', minLength: 1, maxLength: 100 },
          action: {
            type: 'string',
            enum: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'publish', 'unpublish', 'export', 'import', 'assign', 'manage', 'restore', 'ban', 'unban', 'verify'],
            example: 'delete',
          },
          scope: { type: 'string', enum: ['global', 'own', 'assigned'], default: 'global' },
          display_order: { type: 'integer', default: 0 },
          is_active: { type: 'boolean', default: true },
        },
      },

      // ── Module Schemas ──
      Module: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'User Management' },
          code: { type: 'string', example: 'user_mgmt' },
          slug: { type: 'string', example: 'user-management' },
          is_active: { type: 'boolean', example: true },
        },
      },
      CreateModuleRequest: {
        type: 'object',
        required: ['name', 'code', 'slug'],
        properties: {
          name: { type: 'string', example: 'Course Management', minLength: 2, maxLength: 100 },
          code: { type: 'string', example: 'course_mgmt', minLength: 2, maxLength: 50 },
          slug: { type: 'string', example: 'course-management', minLength: 2, maxLength: 100 },
          description: { type: 'string', example: 'All course-related permissions', maxLength: 500 },
          display_order: { type: 'integer', default: 0 },
          icon: { type: 'string', nullable: true, example: 'book-open' },
          color: { type: 'string', nullable: true, example: '#10B981' },
          is_active: { type: 'boolean', default: true },
        },
      },

      // ── Role Permission Schemas ──
      AssignPermissionRequest: {
        type: 'object',
        required: ['role_id', 'permission_id'],
        properties: {
          role_id: { type: 'integer', example: 2 },
          permission_id: { type: 'integer', example: 5 },
        },
      },
      BulkAssignPermissionsRequest: {
        type: 'object',
        required: ['role_id', 'permission_ids'],
        properties: {
          role_id: { type: 'integer', example: 2 },
          permission_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3, 4, 5], minItems: 1 },
        },
      },
      RemovePermissionRequest: {
        type: 'object',
        required: ['role_id', 'permission_id'],
        properties: {
          role_id: { type: 'integer', example: 2 },
          permission_id: { type: 'integer', example: 5 },
        },
      },

      // ── User Role Assignment Schemas ──
      AssignRoleToUserRequest: {
        type: 'object',
        required: ['user_id', 'role_id'],
        properties: {
          user_id: { type: 'integer', example: 5 },
          role_id: { type: 'integer', example: 3 },
          context_type: { type: 'string', enum: ['course', 'batch', 'department', 'branch', 'internship'], nullable: true, example: 'course' },
          context_id: { type: 'integer', nullable: true, example: 42 },
          expires_at: { type: 'string', format: 'date-time', nullable: true, example: '2026-12-31T23:59:59Z' },
          reason: { type: 'string', nullable: true, example: 'Promoted to instructor for Advanced Python batch', maxLength: 500 },
        },
      },

      // ── Master Data Schemas ──
      Country: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'India' },
          iso2: { type: 'string', example: 'IN' },
          iso3: { type: 'string', example: 'IND' },
          phone_code: { type: 'string', example: '+91' },
          currency: { type: 'string', example: 'INR' },
          is_active: { type: 'boolean', example: true },
        },
      },
      CreateCountryRequest: {
        type: 'object',
        required: ['name', 'iso2', 'iso3', 'phone_code', 'currency'],
        properties: {
          name: { type: 'string', example: 'Bangladesh' },
          iso2: { type: 'string', example: 'BD', minLength: 2, maxLength: 2 },
          iso3: { type: 'string', example: 'BGD', minLength: 3, maxLength: 3 },
          phone_code: { type: 'string', example: '+880' },
          currency: { type: 'string', example: 'BDT' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateStateRequest: {
        type: 'object',
        required: ['country_id', 'name'],
        properties: {
          country_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Maharashtra' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateCityRequest: {
        type: 'object',
        required: ['state_id', 'name'],
        properties: {
          state_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Mumbai' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateLanguageRequest: {
        type: 'object',
        required: ['name', 'native_name', 'iso_code'],
        properties: {
          name: { type: 'string', example: 'Hindi' },
          native_name: { type: 'string', example: 'हिन्दी' },
          iso_code: { type: 'string', example: 'hi' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name', 'code', 'slug'],
        properties: {
          name: { type: 'string', example: 'Programming' },
          code: { type: 'string', example: 'PROG' },
          slug: { type: 'string', example: 'programming' },
          display_order: { type: 'integer', default: 0 },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateSubCategoryRequest: {
        type: 'object',
        required: ['category_id', 'name', 'code', 'slug'],
        properties: {
          category_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Python' },
          code: { type: 'string', example: 'PY' },
          slug: { type: 'string', example: 'python' },
          display_order: { type: 'integer', default: 0 },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateSkillRequest: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string', example: 'React.js' },
          category: { type: 'string', enum: ['technical', 'soft', 'professional', 'other'], example: 'technical' },
          description: { type: 'string', example: 'JavaScript library for building UIs' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateEducationLevelRequest: {
        type: 'object',
        required: ['name', 'level_order', 'level_category'],
        properties: {
          name: { type: 'string', example: 'Bachelor of Technology' },
          level_order: { type: 'integer', example: 4 },
          level_category: { type: 'string', example: 'undergraduate' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateDesignationRequest: {
        type: 'object',
        required: ['name', 'level', 'level_band'],
        properties: {
          name: { type: 'string', example: 'Senior Software Engineer' },
          level: { type: 'string', example: 'IC3' },
          level_band: { type: 'string', example: 'mid-senior' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateSpecializationRequest: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string', example: 'Artificial Intelligence' },
          category: { type: 'string', enum: ['engineering', 'management', 'healthcare', 'finance', 'education', 'other'], example: 'engineering' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateLearningGoalRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Become a Full Stack Developer' },
          display_order: { type: 'integer', default: 0 },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateSocialMediaRequest: {
        type: 'object',
        required: ['name', 'platform_type'],
        properties: {
          name: { type: 'string', example: 'LinkedIn' },
          platform_type: { type: 'string', enum: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github', 'other'], example: 'linkedin' },
          is_active: { type: 'boolean', default: true },
        },
      },
      CreateDocumentTypeRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Aadhaar Card' },
          is_active: { type: 'boolean', default: true },
        },
      },
    },

    // ─── Reusable Parameters ──────────────────────────────────
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
        description: 'Resource ID',
        example: 1,
      },
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number',
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Items per page',
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        schema: { type: 'string', default: 'created_at' },
        description: 'Sort field (e.g., name, created_at, id)',
      },
      OrderParam: {
        name: 'order',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        description: 'Sort order',
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        schema: { type: 'string' },
        description: 'Search keyword (fuzzy match via pg_trgm)',
      },
    },

    // ─── Reusable Responses ────────────────────────────────────
    responses: {
      '400': { description: 'Bad Request / Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedError' } } } },
      '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenError' } } } },
      '404': { description: 'Not Found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundError' } } } },
      '429': { description: 'Too Many Requests', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string', example: 'Too many requests. Please try again later.' } } } } } },
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  P A T H S
  // ═══════════════════════════════════════════════════════════
  paths: {
    // ─── Health ────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'API v1 Health Check',
        description: 'Returns API health status. No authentication required.',
        responses: {
          200: {
            description: 'API is running',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'API v1 is running' }, version: { type: 'string', example: 'v1' } } } } },
          },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  AUTH ENDPOINTS
    // ═══════════════════════════════════════════════════════

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user (Step 1 of 3-step flow)',
        description: 'Validates input, stores pending registration data in Redis (expires in 10 minutes), and sends OTPs to both email (Brevo) and mobile (SMSGatewayHub). Returns registration_token for use in verify-registration-email and verify-registration-mobile endpoints. Requires reCAPTCHA in production.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: {
          201: { description: 'Registration initiated. OTPs sent to both email and mobile.', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistrationResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          429: { $ref: '#/components/responses/429' },
        },
      },
    },

    '/auth/verify-registration-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email OTP (Step 2a of 3-step registration)',
        description: 'Verifies the email OTP during registration. Uses registration_token + otp. Once BOTH email and mobile are verified, user is created in DB and JWT tokens are returned.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyRegistrationEmailRequest' } } } },
        responses: {
          200: { description: 'Email OTP verified. If mobile already verified, registration complete with tokens. Otherwise, continue to mobile verification.', content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { $ref: '#/components/schemas/RegistrationCompleteResponse' }] } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/verify-registration-mobile': {
      post: {
        tags: ['Auth'],
        summary: 'Verify mobile OTP (Step 2b of 3-step registration)',
        description: 'Verifies the mobile OTP during registration. Uses registration_token + otp. Once BOTH email and mobile are verified, user is created in DB and JWT tokens are returned.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyRegistrationMobileRequest' } } } },
        responses: {
          200: { description: 'Mobile OTP verified. If email already verified, registration complete with tokens. Otherwise, continue to email verification.', content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { $ref: '#/components/schemas/RegistrationCompleteResponse' }] } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/resend-registration-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend OTP for pending registration',
        description: 'Resends OTP for a pending registration to either email or mobile channel. Uses registration_token + channel ("email" or "mobile"). Subject to strict rate limiting (5 per hour).',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResendRegistrationOtpRequest' } } } },
        responses: {
          200: { description: 'OTP resent successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          429: { $ref: '#/components/responses/429' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email or mobile',
        description: 'Authenticates user using email OR mobile number + password. Requires BOTH email AND mobile to be verified. If either is unverified, login is blocked and fresh OTPs are sent. Returns JWT access token (15min) and refresh token (7d). Requires reCAPTCHA in production.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                loginWithEmail: { summary: 'Login with email', value: { identifier: 'girish@example.com', password: 'MyStr0ng@Pass' } },
                loginWithMobile: { summary: 'Login with mobile', value: { identifier: '9876543210', password: 'MyStr0ng@Pass' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedError' } } } },
          429: { $ref: '#/components/responses/429' },
        },
      },
    },

    '/auth/verify-email-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email with OTP (Existing Users Only)',
        description: 'Verifies the email address for EXISTING users (post-login re-verification). Uses email + OTP. For registration, use /auth/verify-registration-email instead.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailOtpRequest' } } } },
        responses: {
          200: { description: 'Email verified successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/verify-mobile-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify mobile with OTP (Existing Users Only)',
        description: 'Verifies the mobile number for EXISTING users (post-login re-verification). Uses mobile + OTP. For registration, use /auth/verify-registration-mobile instead.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyMobileOtpRequest' } } } },
        responses: {
          200: { description: 'Mobile verified successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/resend-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend verification OTP',
        description: 'Resends OTP for email/mobile verification or password reset. Subject to strict rate limiting (5 per hour) and cooldown period.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResendOtpRequest' } } } },
        responses: {
          200: { description: 'OTP resent successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          429: { $ref: '#/components/responses/429' },
        },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset OTP',
        description: 'Sends a password reset OTP to the user\'s registered email. Accepts email or mobile as identifier — OTP always goes to email.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
        responses: {
          200: { description: 'Reset OTP sent to email', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          404: { $ref: '#/components/responses/404' },
        },
      },
    },

    '/auth/verify-reset-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify password reset OTP',
        description: 'Verifies the reset OTP and returns a one-time `reset_token` to be used in the next step (reset-password).',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyResetOtpRequest' } } } },
        responses: {
          200: { description: 'OTP verified, reset_token returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyResetOtpResponse' } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        description: 'Sets a new password using the `reset_token` from verify-reset-otp. Password changed notification email is sent.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
        responses: {
          200: { description: 'Password reset successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
        },
      },
    },

    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Generates a new access token using a valid refresh token.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } } },
        responses: {
          200: { description: 'New access token returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (blacklist token)',
        description: 'Blacklists the current access token in Redis. Token becomes invalid immediately.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile including permissions.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password (authenticated)',
        description: 'Changes the password for the logged-in user. Requires current password. Notification email is sent.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
        responses: {
          200: { description: 'Password changed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/request-email-change': {
      post: {
        tags: ['Auth'],
        summary: 'Request email change',
        description: 'Sends an OTP to the NEW email address for verification. The pending change is stored in Redis with 10-minute TTL.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RequestEmailChangeRequest' } } } },
        responses: {
          200: { description: 'OTP sent to new email', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/verify-email-change': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email change with OTP',
        description: 'Verifies the OTP and updates the user\'s email to the new address.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpOnly' } } } },
        responses: {
          200: { description: 'Email updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/request-mobile-change': {
      post: {
        tags: ['Auth'],
        summary: 'Request mobile number change',
        description: 'Initiates mobile number change. OTP is sent and notification goes to current email.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RequestMobileChangeRequest' } } } },
        responses: {
          200: { description: 'OTP sent for mobile change', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/auth/verify-mobile-change': {
      post: {
        tags: ['Auth'],
        summary: 'Verify mobile change with OTP',
        description: 'Verifies the OTP and updates the user\'s mobile number.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpOnly' } } } },
        responses: {
          200: { description: 'Mobile updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  USERS MANAGEMENT
    // ═══════════════════════════════════════════════════════

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (Admin)',
        description: 'Returns paginated list of users. Supports search, role filter, and active status filter.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SortParam' },
          { $ref: '#/components/parameters/OrderParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['sa', 'admin', 'student', 'instructor'] }, description: 'Filter by role' },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
        ],
        responses: {
          200: { description: 'Users list retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user (Admin)',
        description: 'Admin creates a new user directly without OTP verification. Only super_admin can create users with admin or super_admin role. Returns 403 if a non-super_admin tries to create privileged roles.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } } },
        responses: {
          201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } },
        responses: {
          200: { description: 'User updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft-delete user',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'User deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
    },

    '/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Update user role',
        description: 'Only super_admin can assign admin or super_admin roles. Returns 403 if a non-super_admin tries to assign privileged roles.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRoleRequest' } } } },
        responses: {
          200: { description: 'Role updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/users/{id}/active': {
      patch: {
        tags: ['Users'],
        summary: 'Activate or deactivate user',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SetActiveRequest' } } } },
        responses: {
          200: { description: 'User active status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/users/{id}/restore': {
      post: {
        tags: ['Users'],
        summary: 'Restore soft-deleted user',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'User restored', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  ROLES
    // ═══════════════════════════════════════════════════════

    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'List all roles',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SortParam' },
          { $ref: '#/components/parameters/OrderParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'level', in: 'query', schema: { type: 'integer' } },
          { name: 'parent_role_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_system_role', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Roles list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
      post: {
        tags: ['Roles'],
        summary: 'Create a new role',
        description: 'Creates a role with hierarchy support (parent_role_id, level). Requires `roles.create` permission.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRoleRequest' } } } },
        responses: {
          201: { description: 'Role created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/{id}': {
      get: {
        tags: ['Roles'],
        summary: 'Get role by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Role details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      put: {
        tags: ['Roles'],
        summary: 'Update a role',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateRoleRequest' } } } },
        responses: {
          200: { description: 'Role updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Soft-delete a role',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Role deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/{id}/restore': {
      post: {
        tags: ['Roles'],
        summary: 'Restore a soft-deleted role',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Role restored', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    // ─── Role Permissions ──────────────────────────────────

    '/roles/permissions/list': {
      get: {
        tags: ['Role Permissions'],
        summary: 'List role-permission mappings',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { name: 'role_id', in: 'query', schema: { type: 'integer' } },
          { name: 'role_code', in: 'query', schema: { type: 'string' } },
          { name: 'module_code', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'scope', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Role permissions list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/roles/permissions/assign': {
      post: {
        tags: ['Role Permissions'],
        summary: 'Assign a permission to a role',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignPermissionRequest' } } } },
        responses: {
          201: { description: 'Permission assigned', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/permissions/bulk-assign': {
      post: {
        tags: ['Role Permissions'],
        summary: 'Bulk assign permissions to a role',
        description: 'Assigns multiple permissions to a role in one request.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkAssignPermissionsRequest' } } } },
        responses: {
          201: { description: 'Permissions assigned', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/permissions/remove': {
      post: {
        tags: ['Role Permissions'],
        summary: 'Remove a permission from a role',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RemovePermissionRequest' } } } },
        responses: {
          200: { description: 'Permission removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    // ─── User Role Assignments ─────────────────────────────

    '/roles/user-assignments/list': {
      get: {
        tags: ['User Role Assignments'],
        summary: 'List user-role assignments',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { name: 'user_id', in: 'query', schema: { type: 'integer' } },
          { name: 'role_id', in: 'query', schema: { type: 'integer' } },
          { name: 'role_code', in: 'query', schema: { type: 'string' } },
          { name: 'context_type', in: 'query', schema: { type: 'string' } },
          { name: 'context_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_valid', in: 'query', schema: { type: 'boolean' }, description: 'Filter only valid (non-expired) assignments' },
        ],
        responses: {
          200: { description: 'Assignments list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
    },

    '/roles/user-assignments/assign': {
      post: {
        tags: ['User Role Assignments'],
        summary: 'Assign a role to a user',
        description: 'Assigns a role to a user, optionally scoped to a context (course, batch, department, branch, internship) with optional expiry.',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignRoleToUserRequest' } } } },
        responses: {
          201: { description: 'Role assigned', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/user-assignments/{id}': {
      delete: {
        tags: ['User Role Assignments'],
        summary: 'Revoke a user-role assignment',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Assignment revoked', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/roles/user-assignments/{id}/restore': {
      post: {
        tags: ['User Role Assignments'],
        summary: 'Restore a revoked assignment',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Assignment restored', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  PERMISSIONS & MODULES
    // ═══════════════════════════════════════════════════════

    '/permissions': {
      get: {
        tags: ['Permissions'],
        summary: 'List all permissions',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SortParam' },
          { $ref: '#/components/parameters/OrderParam' },
          { $ref: '#/components/parameters/SearchParam' },
          { name: 'module_id', in: 'query', schema: { type: 'integer' } },
          { name: 'module_code', in: 'query', schema: { type: 'string' } },
          { name: 'resource', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'scope', in: 'query', schema: { type: 'string', enum: ['global', 'own', 'assigned'] } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Permissions list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
      post: {
        tags: ['Permissions'],
        summary: 'Create a permission',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePermissionRequest' } } } },
        responses: {
          201: { description: 'Permission created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/permissions/{id}': {
      get: {
        tags: ['Permissions'],
        summary: 'Get permission by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Permission details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      put: {
        tags: ['Permissions'],
        summary: 'Update a permission',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePermissionRequest' } } } },
        responses: {
          200: { description: 'Permission updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
      delete: {
        tags: ['Permissions'],
        summary: 'Delete a permission',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Permission deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/permissions/modules': {
      get: {
        tags: ['Modules'],
        summary: 'List all modules',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/SortParam' },
          { $ref: '#/components/parameters/OrderParam' },
          { $ref: '#/components/parameters/SearchParam' },
        ],
        responses: {
          200: { description: 'Modules list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          401: { $ref: '#/components/responses/401' },
        },
      },
      post: {
        tags: ['Modules'],
        summary: 'Create a module',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateModuleRequest' } } } },
        responses: {
          201: { description: 'Module created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    '/permissions/modules/{id}': {
      get: {
        tags: ['Modules'],
        summary: 'Get module by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Module details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      put: {
        tags: ['Modules'],
        summary: 'Update a module',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateModuleRequest' } } } },
        responses: {
          200: { description: 'Module updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
      delete: {
        tags: ['Modules'],
        summary: 'Delete a module',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: 'Module deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },

    // ═══════════════════════════════════════════════════════
    //  MASTER DATA — Generated for all 13 entities
    // ═══════════════════════════════════════════════════════

    ...generateMasterDataPaths('countries', 'Countries', 'Country', 'CreateCountryRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('states', 'States', 'State', 'CreateStateRequest', [
      { name: 'country_id', in: 'query', schema: { type: 'integer' }, description: 'Filter by country' },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('cities', 'Cities', 'City', 'CreateCityRequest', [
      { name: 'state_id', in: 'query', schema: { type: 'integer' }, description: 'Filter by state' },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('languages', 'Languages', 'Language', 'CreateLanguageRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('categories', 'Categories', 'Category', 'CreateCategoryRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('sub-categories', 'Sub-Categories', 'SubCategory', 'CreateSubCategoryRequest', [
      { name: 'category_id', in: 'query', schema: { type: 'integer' }, description: 'Filter by category' },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('skills', 'Skills', 'Skill', 'CreateSkillRequest', [
      { name: 'category', in: 'query', schema: { type: 'string', enum: ['technical', 'soft', 'professional', 'other'] }, description: 'Filter by skill category' },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('education-levels', 'Education Levels', 'EducationLevel', 'CreateEducationLevelRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('designations', 'Designations', 'Designation', 'CreateDesignationRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('specializations', 'Specializations', 'Specialization', 'CreateSpecializationRequest', [
      { name: 'category', in: 'query', schema: { type: 'string', enum: ['engineering', 'management', 'healthcare', 'finance', 'education', 'other'] } },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('learning-goals', 'Learning Goals', 'LearningGoal', 'CreateLearningGoalRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('social-medias', 'Social Medias', 'SocialMedia', 'CreateSocialMediaRequest', [
      { name: 'platform_type', in: 'query', schema: { type: 'string', enum: ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github', 'other'] } },
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),

    ...generateMasterDataPaths('document-types', 'Document Types', 'DocumentType', 'CreateDocumentTypeRequest', [
      { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
    ]),
  },
};

/**
 * Helper: Generate standard CRUD paths for master data entities
 * Master data GET endpoints are public; POST/PUT/DELETE require auth + master_data permission.
 */
function generateMasterDataPaths(basePath, tag, entityName, createSchemaRef, extraQueryParams = []) {
  const paginationParams = [
    { $ref: '#/components/parameters/PageParam' },
    { $ref: '#/components/parameters/LimitParam' },
    { $ref: '#/components/parameters/SortParam' },
    { $ref: '#/components/parameters/OrderParam' },
    { $ref: '#/components/parameters/SearchParam' },
    ...extraQueryParams,
  ];

  return {
    [`/${basePath}`]: {
      get: {
        tags: [tag],
        summary: `List all ${tag.toLowerCase()}`,
        description: `Returns a paginated list of ${tag.toLowerCase()}. Public endpoint — no authentication required.`,
        parameters: paginationParams,
        responses: {
          200: { description: `${tag} list`, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
        },
      },
      post: {
        tags: [tag],
        summary: `Create a ${entityName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`,
        description: `Requires authentication and \`master_data.create\` permission.`,
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${createSchemaRef}` } } } },
        responses: {
          201: { description: `${entityName} created`, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
        },
      },
    },
    [`/${basePath}/{id}`]: {
      get: {
        tags: [tag],
        summary: `Get ${entityName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} by ID`,
        description: 'Public endpoint — no authentication required.',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: `${entityName} details`, content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          404: { $ref: '#/components/responses/404' },
        },
      },
      put: {
        tags: [tag],
        summary: `Update a ${entityName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`,
        description: `Requires authentication and \`master_data.update\` permission. Partial updates supported.`,
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${createSchemaRef}` } } } },
        responses: {
          200: { description: `${entityName} updated`, content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { $ref: '#/components/responses/400' },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
          404: { $ref: '#/components/responses/404' },
        },
      },
      delete: {
        tags: [tag],
        summary: `Delete a ${entityName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`,
        description: `Soft-delete. Requires authentication and \`master_data.delete\` permission.`,
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: { description: `${entityName} deleted`, content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { $ref: '#/components/responses/401' },
          403: { $ref: '#/components/responses/403' },
          404: { $ref: '#/components/responses/404' },
        },
      },
    },
  };
}

module.exports = swaggerSpec;
