# GrowUpMore API — RBAC Seed Data Guide

## API-Based Seed Data for Testing

This guide provides ready-to-use API requests to seed your RBAC system with realistic test data. Execute them **in order** using Postman or any HTTP client.

**Base URL:** `http://localhost:5001`
**API Prefix:** `/api/v1`

---

## Prerequisites

Before seeding RBAC data, you need two registered & logged-in users:

1. A **Super Admin** user (must be manually assigned `super_admin` role in the database first time)
2. A **regular user** (registered via `/auth/register` flow — auto-assigned `student` role)

> **First-time setup:** Since the very first super_admin can't be created via API (no one has permission yet), you must manually insert the first super_admin assignment in the database:
>
> ```sql
> -- Run this ONCE in Supabase SQL Editor for your first admin user
> SELECT sp_user_role_assignments_insert(
>   p_user_id := 1,          -- your first registered user's ID
>   p_role_id := 1,          -- super_admin role ID (seeded)
>   p_context_type := NULL,
>   p_context_id := NULL,
>   p_expires_at := NULL,
>   p_reason := 'Initial platform super admin',
>   p_created_by := 1
> );
> ```

---

## Step 0 — Login as Super Admin

Get the super admin token first. All subsequent requests use this token.

```
POST http://localhost:5001/api/v1/auth/login
```

```json
{
  "identifier": "girish@example.com",
  "password": "Girish@123"
}
```

> **Save the `accessToken` from response as `{{sa_token}}`** — you'll use it in all requests below.

**Why:** Every RBAC write operation requires super_admin privileges. Without this token, all create/assign requests will return `403 Forbidden`.

---

## Step 1 — Create Custom Roles

The 8 system roles (super_admin, admin, moderator, content_manager, finance_admin, support_agent, instructor, student) are already seeded in the database. Here we create additional custom roles specific to our e-learning platform.

### 1.1 — Create "Course Reviewer" Role

A course reviewer checks course content quality before it goes live. They sit between support agent and instructor in the hierarchy.

```
POST http://localhost:5001/api/v1/rbac/roles
Authorization: Bearer {{sa_token}}
```

```json
{
  "name": "Course Reviewer",
  "code": "course_reviewer",
  "description": "Reviews course content for quality and accuracy before publishing. Can approve or reject courses.",
  "level": 3,
  "parentRoleId": 3,
  "displayOrder": 7,
  "icon": "clipboard-check",
  "color": "#8E44AD",
  "isActive": true
}
```

> **Why level 3?** Same level as support_agent — they can manage instructors and students but not moderators or above. `parentRoleId: 3` links them under the moderator hierarchy.

---

### 1.2 — Create "Teaching Assistant" Role

Teaching assistants help instructors manage their courses — they can view enrolled students, moderate discussions, but can't create courses.

```
POST http://localhost:5001/api/v1/rbac/roles
Authorization: Bearer {{sa_token}}
```

```json
{
  "name": "Teaching Assistant",
  "code": "teaching_assistant",
  "description": "Assists instructors with course management, student queries, and discussion moderation.",
  "level": 4,
  "parentRoleId": 7,
  "displayOrder": 8,
  "icon": "user-graduate",
  "color": "#E67E22",
  "isActive": true
}
```

> **Why level 4?** Same level as instructor — they can manage students but cannot manage other instructors. `parentRoleId: 7` links them under the instructor hierarchy.

---

### 1.3 — Create "Guest Lecturer" Role

Guest lecturers are temporary instructors invited for specific courses. They have limited, time-bound access.

```
POST http://localhost:5001/api/v1/rbac/roles
Authorization: Bearer {{sa_token}}
```

```json
{
  "name": "Guest Lecturer",
  "code": "guest_lecturer",
  "description": "Temporary instructor with limited access for specific courses. Time-bound assignment.",
  "level": 4,
  "parentRoleId": 7,
  "displayOrder": 9,
  "icon": "user-clock",
  "color": "#F39C12",
  "isActive": true
}
```

> **Why level 4?** Same as instructor level but designed for temporary, context-scoped assignments (assigned to a specific course, not globally).

---

### 1.4 — Create "Mentor" Role

Mentors are experienced students who guide newer students. They have slightly elevated permissions compared to regular students.

```
POST http://localhost:5001/api/v1/rbac/roles
Authorization: Bearer {{sa_token}}
```

```json
{
  "name": "Mentor",
  "code": "mentor",
  "description": "Experienced student who guides and mentors newer students. Can view mentee progress.",
  "level": 5,
  "parentRoleId": 8,
  "displayOrder": 10,
  "icon": "hands-helping",
  "color": "#27AE60",
  "isActive": true
}
```

> **Why level 5?** Same level as student — they don't manage anyone but get additional permissions for viewing mentee data.

---

### 1.5 — Create "Affiliate Partner" Role

External partners who refer students and get commissions. They need dashboard access to track referrals.

```
POST http://localhost:5001/api/v1/rbac/roles
Authorization: Bearer {{sa_token}}
```

```json
{
  "name": "Affiliate Partner",
  "code": "affiliate_partner",
  "description": "External partner who refers students. Can access referral dashboard and commission reports.",
  "level": 5,
  "parentRoleId": null,
  "displayOrder": 11,
  "icon": "handshake",
  "color": "#2980B9",
  "isActive": true
}
```

> **Why `parentRoleId: null`?** Affiliate partners sit outside the main teaching hierarchy. They're a standalone role with specific permissions.

---

After creating all 5 custom roles, verify them:

```
GET http://localhost:5001/api/v1/rbac/roles?sortBy=level&sortDir=ASC
Authorization: Bearer {{sa_token}}
```

**Expected:** 13 total roles (8 system + 5 custom), sorted by level.

---

## Step 2 — Assign Permissions to Custom Roles

Now we give each custom role the permissions they need. First, let's see what permissions are available.

### 2.0 — List Available Permissions

```
GET http://localhost:5001/api/v1/rbac/permissions?limit=100
Authorization: Bearer {{sa_token}}
```

> **Save the permission IDs** from this response — you'll need them for the bulk assign calls below. The exact IDs depend on your database seed. The examples below use placeholder IDs; replace them with your actual values.

---

### 2.1 — Assign Permissions to "Course Reviewer" (roleId: 9)

Course reviewers need to read courses, read/approve content, and manage discussions.

```
POST http://localhost:5001/api/v1/rbac/roles/9/permissions/bulk
Authorization: Bearer {{sa_token}}
```

```json
{
  "permissionIds": [5, 6, 10, 11, 15, 20, 25, 30]
}
```

> **What these permissions cover (adjust IDs to match your DB):**
>
> | ID | Permission Code | Why Needed |
> |----|----------------|------------|
> | 5 | `course.read` | View all courses for review |
> | 6 | `course.update` | Add review comments/status |
> | 10 | `content.read` | Read course content (lessons, videos) |
> | 11 | `content.approve` | Approve content for publishing |
> | 15 | `discussion.read` | Monitor course discussions |
> | 20 | `discussion.update` | Moderate discussions |
> | 25 | `assessment.read` | Review quiz/assignment quality |
> | 30 | `notification.create` | Send feedback to instructors |

---

### 2.2 — Assign Permissions to "Teaching Assistant" (roleId: 10)

TAs need to view course content, manage enrolled students in their course, and moderate discussions.

```
POST http://localhost:5001/api/v1/rbac/roles/10/permissions/bulk
Authorization: Bearer {{sa_token}}
```

```json
{
  "permissionIds": [5, 10, 12, 15, 20, 22, 25, 26, 35]
}
```

> **What these permissions cover:**
>
> | ID | Permission Code | Why Needed |
> |----|----------------|------------|
> | 5 | `course.read` | View assigned courses |
> | 10 | `content.read` | Read course materials |
> | 12 | `enrollment.read.assigned` | View students in assigned courses |
> | 15 | `discussion.read` | Read discussions |
> | 20 | `discussion.update` | Moderate discussions |
> | 22 | `discussion.delete` | Remove inappropriate posts |
> | 25 | `assessment.read` | View student submissions |
> | 26 | `assessment.update` | Grade assignments |
> | 35 | `notification.create` | Send announcements to students |

---

### 2.3 — Assign Permissions to "Mentor" (roleId: 12)

Mentors need limited access to view mentee progress and communicate.

```
POST http://localhost:5001/api/v1/rbac/roles/12/permissions/bulk
Authorization: Bearer {{sa_token}}
```

```json
{
  "permissionIds": [5, 12, 15, 35, 40]
}
```

> **What these permissions cover:**
>
> | ID | Permission Code | Why Needed |
> |----|----------------|------------|
> | 5 | `course.read` | View available courses |
> | 12 | `enrollment.read.assigned` | View mentee enrollment/progress |
> | 15 | `discussion.read` | Read discussions |
> | 35 | `notification.create` | Send messages to mentees |
> | 40 | `feedback.create` | Provide feedback to mentees |

---

## Step 3 — Register Test Users

Register multiple test users through the auth flow to simulate a real platform. Each user will auto-receive the `student` role on registration.

### 3.1 — Register an Admin User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul.admin@example.com",
  "mobile": "9876543210",
  "password": "Rahul@Admin123"
}
```

> Complete the full OTP verification flow (verify-email → verify-mobile). Then note the `user_id` from the response.

---

### 3.2 — Register an Instructor User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Priya",
  "lastName": "Patel",
  "email": "priya.instructor@example.com",
  "mobile": "9988776655",
  "password": "Priya@Teach123"
}
```

---

### 3.3 — Register a Moderator User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Amit",
  "lastName": "Verma",
  "email": "amit.moderator@example.com",
  "mobile": "9112233445",
  "password": "Amit@Mod123"
}
```

---

### 3.4 — Register a Student User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Neha",
  "lastName": "Gupta",
  "email": "neha.student@example.com",
  "mobile": "9223344556",
  "password": "Neha@Learn123"
}
```

---

### 3.5 — Register a Teaching Assistant User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Vikram",
  "lastName": "Singh",
  "email": "vikram.ta@example.com",
  "mobile": "9334455667",
  "password": "Vikram@TA123"
}
```

---

### 3.6 — Register a Guest Lecturer User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Dr. Meera",
  "lastName": "Joshi",
  "email": "meera.guest@example.com",
  "mobile": "9445566778",
  "password": "Meera@Guest123"
}
```

---

### 3.7 — Register a Mentor User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Arjun",
  "lastName": "Reddy",
  "email": "arjun.mentor@example.com",
  "mobile": "9556677889",
  "password": "Arjun@Mentor123"
}
```

---

### 3.8 — Register a Second Super Admin User

```
POST http://localhost:5001/api/v1/auth/register
```

```json
{
  "firstName": "Kavita",
  "lastName": "Nair",
  "email": "kavita.sa@example.com",
  "mobile": "9667788990",
  "password": "Kavita@SA123"
}
```

> After registering all users, note down their `user_id` values. The IDs below assume:
>
> | user_id | Name | Target Role |
> |---------|------|-------------|
> | 1 | Girish (you) | super_admin (already assigned) |
> | 2 | Rahul Sharma | admin |
> | 3 | Priya Patel | instructor |
> | 4 | Amit Verma | moderator |
> | 5 | Neha Gupta | student (auto-assigned) |
> | 6 | Vikram Singh | teaching_assistant |
> | 7 | Dr. Meera Joshi | guest_lecturer |
> | 8 | Arjun Reddy | mentor |
> | 9 | Kavita Nair | super_admin |

---

## Step 4 — Assign Roles to Users

Now promote each user to their proper role. All requests use the super admin token.

### 4.1 — Assign "admin" to Rahul (userId: 2)

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 2,
  "roleId": 2,
  "reason": "Platform admin - manages day-to-day operations"
}
```

> **What happens:** Rahul now has both `student` (auto-assigned) and `admin` roles. The system uses the **highest privilege role** (admin, level 1) for hierarchy checks. Rahul can now create moderators, instructors, and students but NOT super_admins or other admins.

---

### 4.2 — Assign "instructor" to Priya (userId: 3)

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 3,
  "roleId": 7,
  "reason": "Full-time instructor - Web Development courses"
}
```

> **What happens:** Priya gets `instructor` (level 4) + existing `student` (level 5). She can create and manage her courses, and manage students within her courses.

---

### 4.3 — Assign "moderator" to Amit (userId: 4)

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 4,
  "roleId": 3,
  "reason": "Content moderator - reviews and moderates platform content"
}
```

> **What happens:** Amit gets `moderator` (level 2). He can manage support agents, instructors, and students. He cannot manage other moderators, admins, or super_admins.

---

### 4.4 — Assign "teaching_assistant" to Vikram (userId: 6), scoped to a course

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 6,
  "roleId": 10,
  "contextType": "course",
  "contextId": 1,
  "reason": "TA for Web Development 101 course"
}
```

> **What happens:** Vikram is a teaching assistant **only within course ID 1**. The `contextType: "course"` and `contextId: 1` scope this role to that specific course. He still has `student` role globally.

---

### 4.5 — Assign "guest_lecturer" to Dr. Meera (userId: 7), with expiration

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 7,
  "roleId": 11,
  "contextType": "course",
  "contextId": 2,
  "expiresAt": "2026-07-01T00:00:00.000Z",
  "reason": "Guest lecturer for AI/ML Masterclass - Summer 2026 semester"
}
```

> **What happens:** Dr. Meera is a guest lecturer for course ID 2, and this assignment **automatically expires** on July 1, 2026. After that date, she reverts to just `student`. This is perfect for temporary guest faculty.

---

### 4.6 — Assign "mentor" to Arjun (userId: 8)

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 8,
  "roleId": 12,
  "reason": "Peer mentor for new students - completed 10+ courses"
}
```

> **What happens:** Arjun gets `mentor` (level 5) + `student` (level 5). Both are same level, but `mentor` grants additional permissions like viewing mentee progress.

---

### 4.7 — Assign "super_admin" to Kavita (userId: 9)

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{sa_token}}
```

```json
{
  "userId": 9,
  "roleId": 1,
  "reason": "Second super admin - backup platform administrator"
}
```

> **What happens:** Kavita becomes another super_admin. **Important:** After this, even Girish (the original SA) **cannot delete or revoke** Kavita's super_admin role. This is the hierarchy protection in action.

---

## Step 5 — Verify Seed Data

Run these verification requests to confirm everything is set up correctly.

### 5.1 — Verify All Roles (system + custom)

```
GET http://localhost:5001/api/v1/rbac/roles?limit=20&sortBy=level&sortDir=ASC
Authorization: Bearer {{sa_token}}
```

**Expected:** 13 roles total (8 system + 5 custom).

| ID | Code | Level | Type |
|----|------|-------|------|
| 1 | super_admin | 0 | System |
| 2 | admin | 1 | System |
| 3 | moderator | 2 | System |
| 4 | content_manager | 2 | System |
| 5 | finance_admin | 2 | System |
| 6 | support_agent | 3 | System |
| 9 | course_reviewer | 3 | Custom |
| 7 | instructor | 4 | System |
| 10 | teaching_assistant | 4 | Custom |
| 11 | guest_lecturer | 4 | Custom |
| 8 | student | 5 | System |
| 12 | mentor | 5 | Custom |
| 13 | affiliate_partner | 5 | Custom |

---

### 5.2 — Verify User Role Assignments

```
GET http://localhost:5001/api/v1/rbac/user-role-assignments?limit=50&sortBy=createdAt&sortDir=ASC
Authorization: Bearer {{sa_token}}
```

**Expected:** 17 assignments (8 auto-assigned `student` + 1 initial SA + 8 manual assignments from Step 4).

---

### 5.3 — Verify Specific User's Roles (Vikram — TA)

```
GET http://localhost:5001/api/v1/rbac/user-role-assignments?userId=6
Authorization: Bearer {{sa_token}}
```

**Expected:** 2 assignments — `student` (global) + `teaching_assistant` (scoped to course 1).

---

### 5.4 — Verify My Permissions (as Super Admin)

```
GET http://localhost:5001/api/v1/rbac/my-permissions
Authorization: Bearer {{sa_token}}
```

**Expected:** All permissions (super admin bypasses checks, but this returns the actual permission list from all assigned roles).

---

### 5.5 — Verify Course Reviewer Permissions

```
GET http://localhost:5001/api/v1/rbac/roles/9/permissions
Authorization: Bearer {{sa_token}}
```

**Expected:** 8 permissions assigned in Step 2.1.

---

## Step 6 — Test Hierarchy Enforcement

These requests validate that the hierarchy rules are working correctly. **Login as different users** to test.

### 6.1 — Login as Admin (Rahul) and try to create a super_admin

```
POST http://localhost:5001/api/v1/auth/login
```

```json
{
  "identifier": "rahul.admin@example.com",
  "password": "Rahul@Admin123"
}
```

> Save response token as `{{admin_token}}`

Now try to assign super_admin role to someone:

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{admin_token}}
```

```json
{
  "userId": 5,
  "roleId": 1,
  "reason": "Trying to escalate Neha to super_admin"
}
```

**Expected — 403 Forbidden:**

```json
{
  "success": false,
  "message": "Admin cannot manage super_admin roles"
}
```

> **Why this fails:** Admin (level 1) cannot assign super_admin (level 0). The hierarchy enforcement blocks this — preventing privilege escalation.

---

### 6.2 — Admin tries to create another admin

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{admin_token}}
```

```json
{
  "userId": 5,
  "roleId": 2,
  "reason": "Trying to make Neha an admin"
}
```

**Expected — 403 Forbidden:**

```json
{
  "success": false,
  "message": "Admin cannot manage admin roles"
}
```

> **Why this fails:** Admins cannot create other admins — only super_admins can.

---

### 6.3 — Admin successfully assigns instructor role

```
POST http://localhost:5001/api/v1/rbac/user-role-assignments
Authorization: Bearer {{admin_token}}
```

```json
{
  "userId": 5,
  "roleId": 7,
  "reason": "Neha promoted to instructor by admin Rahul"
}
```

**Expected — 201 Created:**

```json
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": {
    "assignment_id": 18
  }
}
```

> **Why this works:** Admin (level 1) can assign instructor (level 4) — target level is strictly greater than acting user's level.

---

### 6.4 — Super Admin tries to delete other Super Admin's role

```
DELETE http://localhost:5001/api/v1/rbac/user-role-assignments/{{kavita_sa_assignment_id}}
Authorization: Bearer {{sa_token}}
```

**Expected — 403 Forbidden:**

```json
{
  "success": false,
  "message": "Super admin cannot delete/revoke another super_admin"
}
```

> **Why this fails:** This is the ultimate protection — no super_admin can remove another super_admin's role, preventing hostile takeovers.

---

### 6.5 — Super Admin tries to delete a system role

```
DELETE http://localhost:5001/api/v1/rbac/roles/8
Authorization: Bearer {{sa_token}}
```

**Expected — 403 Forbidden:**

```json
{
  "success": false,
  "message": "Cannot delete system roles"
}
```

> **Why this fails:** The 8 seeded system roles are protected and cannot be deleted, even by super_admin. Only custom roles can be deleted.

---

### 6.6 — Super Admin successfully deletes a custom role

```
DELETE http://localhost:5001/api/v1/rbac/roles/13
Authorization: Bearer {{sa_token}}
```

**Expected — 200 OK:**

```json
{
  "success": true,
  "message": "Role deleted successfully",
  "data": null
}
```

> **Why this works:** `affiliate_partner` (ID 13) is a custom role, not a system role, so it can be soft-deleted by super_admin.

---

### 6.7 — Restore the deleted role

```
POST http://localhost:5001/api/v1/rbac/roles/13/restore
Authorization: Bearer {{sa_token}}
```

```json
{
  "restorePermissions": true
}
```

**Expected — 200 OK:**

```json
{
  "success": true,
  "message": "Role restored successfully",
  "data": {
    "role_id": 13,
    "name": "Affiliate Partner",
    "code": "affiliate_partner"
  }
}
```

> **What `restorePermissions: true` does:** When a role is deleted, its permission assignments are also soft-deleted. Setting this to `true` restores those permission assignments along with the role. If `false`, the role comes back but you'd need to re-assign permissions manually.

---

## Summary — Final Seed State

After completing all steps, your platform should have:

| Entity | Count | Details |
|--------|-------|---------|
| Roles | 13 | 8 system + 5 custom |
| Users | 9 | 1 SA + 1 Admin + 1 Instructor + 1 Moderator + 1 Student + 1 TA + 1 Guest + 1 Mentor + 1 SA backup |
| Role Assignments | 18+ | 9 auto-student + 1 initial SA + 8 manual promotions + hierarchy test assignments |
| Role Permission Mappings | 22+ | 8 (reviewer) + 9 (TA) + 5 (mentor) from bulk assigns |

### User → Role Quick Reference

| User | Roles | Scope |
|------|-------|-------|
| Girish | super_admin, student | Global |
| Kavita | super_admin, student | Global |
| Rahul | admin, student | Global |
| Amit | moderator, student | Global |
| Priya | instructor, student | Global |
| Vikram | teaching_assistant, student | TA scoped to Course 1 |
| Dr. Meera | guest_lecturer, student | Guest scoped to Course 2 (expires July 2026) |
| Arjun | mentor, student | Global |
| Neha | instructor, student | Global (promoted by admin in Step 6.3) |
