-- ==============================================================================
--
--   E-LEARNING PLATFORM — PHASE 36 UPDATE
--   Convert All Procedures → Functions
--   PostgreSQL / Supabase
--
--   Generated : 2026-04-04
--
--   Purpose: Replace all PROCEDURE definitions with FUNCTION equivalents.
--            INSERT functions → RETURNS BIGINT (new row ID)
--            UPDATE/DELETE/RESTORE functions → RETURNS VOID
--            BULK functions → RETURNS INT (affected row count)
--
--   Naming convention preserved: sp_<entity>_<action>
--
--   IMPORTANT: Run this AFTER the original phase-36-roles-and-permissions.sql
--              This file DROPs old procedures and creates new functions.
--
-- ==============================================================================



-- ══════════════════════════════════════════════════════════════════════════════
--  01  ROLES
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_roles_insert(CITEXT, CITEXT, TEXT, BIGINT, SMALLINT, BOOLEAN, INT, TEXT, TEXT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_roles_update(BIGINT, CITEXT, CITEXT, TEXT, BIGINT, SMALLINT, INT, TEXT, TEXT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_roles_delete(BIGINT);
DROP PROCEDURE IF EXISTS sp_roles_restore(BIGINT, BOOLEAN);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_roles_insert → RETURNS BIGINT                                         │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_roles_insert(
    IN p_name                       CITEXT,
    IN p_code                       CITEXT,
    IN p_description                TEXT DEFAULT NULL,
    IN p_parent_role_id             BIGINT DEFAULT NULL,
    IN p_level                      SMALLINT DEFAULT 99,
    IN p_is_system_role             BOOLEAN DEFAULT FALSE,
    IN p_display_order              INT DEFAULT 0,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_color                      TEXT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT TRUE,
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    -- Validate name
    IF TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Role name cannot be empty.';
    END IF;

    -- Validate code
    IF TRIM(p_code) = '' THEN
        RAISE EXCEPTION 'Role code cannot be empty.';
    END IF;

    -- Validate parent role exists if provided
    IF p_parent_role_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_parent_role_id AND is_deleted = FALSE) THEN
            RAISE EXCEPTION 'Parent role with ID % does not exist or is deleted.', p_parent_role_id;
        END IF;
    END IF;

    -- Check for duplicate name
    IF EXISTS (SELECT 1 FROM roles WHERE name = p_name AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with name "%" already exists.', p_name;
    END IF;

    -- Check for duplicate code
    IF EXISTS (SELECT 1 FROM roles WHERE code = p_code AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with code "%" already exists.', p_code;
    END IF;

    -- Insert role
    INSERT INTO roles (
        name, code, description, parent_role_id, level,
        is_system_role, display_order, icon, color,
        is_active, created_by, updated_by
    )
    VALUES (
        TRIM(p_name), LOWER(TRIM(p_code)), p_description, p_parent_role_id, p_level,
        p_is_system_role, p_display_order, p_icon, p_color,
        p_is_active, p_created_by, p_created_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error inserting role: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_roles_update → RETURNS VOID                                           │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_roles_update(
    IN p_id                         BIGINT,
    IN p_name                       CITEXT DEFAULT NULL,
    IN p_code                       CITEXT DEFAULT NULL,
    IN p_description                TEXT DEFAULT NULL,
    IN p_parent_role_id             BIGINT DEFAULT NULL,
    IN p_level                      SMALLINT DEFAULT NULL,
    IN p_display_order              INT DEFAULT NULL,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_color                      TEXT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT NULL,
    IN p_updated_by                 BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_current_name CITEXT;
    v_is_system    BOOLEAN;
BEGIN

    -- Get current values
    SELECT name, is_system_role
    INTO v_current_name, v_is_system
    FROM roles
    WHERE id = p_id AND is_deleted = FALSE;

    IF v_current_name IS NULL THEN
        RAISE EXCEPTION 'Role with ID % does not exist or is deleted.', p_id;
    END IF;

    -- Prevent renaming system role code
    IF v_is_system AND p_code IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot change code of a system role.';
    END IF;

    -- Prevent self-reference
    IF p_parent_role_id IS NOT NULL AND p_parent_role_id = p_id THEN
        RAISE EXCEPTION 'Cannot set parent_role_id to the same ID (self-reference).';
    END IF;

    -- Validate parent role if provided
    IF p_parent_role_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_parent_role_id AND is_deleted = FALSE) THEN
            RAISE EXCEPTION 'Parent role with ID % does not exist or is deleted.', p_parent_role_id;
        END IF;
    END IF;

    -- Update role
    UPDATE roles
    SET
        name = COALESCE(NULLIF(TRIM(p_name)::CITEXT, ''), name),
        code = COALESCE(NULLIF(LOWER(TRIM(p_code))::CITEXT, ''), code),
        description = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        parent_role_id = COALESCE(p_parent_role_id, parent_role_id),
        level = COALESCE(p_level, level),
        display_order = COALESCE(p_display_order, display_order),
        icon = CASE WHEN p_icon IS NOT NULL THEN p_icon ELSE icon END,
        color = CASE WHEN p_color IS NOT NULL THEN p_color ELSE color END,
        is_active = COALESCE(p_is_active, is_active),
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating role: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_roles_delete → RETURNS VOID                                           │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_roles_delete(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    -- Verify role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with ID % does not exist or is already deleted.', p_id;
    END IF;

    -- Prevent deleting system roles
    IF EXISTS (SELECT 1 FROM roles WHERE id = p_id AND is_system_role = TRUE) THEN
        RAISE EXCEPTION 'Cannot delete a system role. System roles are protected.';
    END IF;

    -- Check if role is assigned to any active users
    IF EXISTS (SELECT 1 FROM user_role_assignments WHERE role_id = p_id AND is_deleted = FALSE AND is_active = TRUE) THEN
        RAISE EXCEPTION 'Cannot delete role: it is currently assigned to active users. Remove assignments first.';
    END IF;

    -- Soft delete role
    UPDATE roles
    SET
        is_deleted = TRUE,
        is_active = FALSE,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    -- Cascade soft delete to role_permissions
    UPDATE role_permissions
    SET
        is_deleted = TRUE,
        is_active = FALSE,
        deleted_at = CURRENT_TIMESTAMP
    WHERE role_id = p_id AND is_deleted = FALSE;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting role: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_roles_restore → RETURNS VOID                                          │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_roles_restore(
    IN p_id                     BIGINT,
    IN p_restore_permissions    BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    -- Verify role exists and is deleted
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_id AND is_deleted = TRUE) THEN
        RAISE EXCEPTION 'Role with ID % is not deleted or does not exist.', p_id;
    END IF;

    -- Restore role
    UPDATE roles
    SET
        is_deleted = FALSE,
        is_active = TRUE,
        deleted_at = NULL
    WHERE id = p_id;

    -- Optionally restore associated permissions
    IF p_restore_permissions THEN
        UPDATE role_permissions
        SET
            is_deleted = FALSE,
            is_active = TRUE,
            deleted_at = NULL
        WHERE role_id = p_id;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error restoring role: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Roles
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Insert (now returns BIGINT)
-- SELECT sp_roles_insert(
--     p_name          := 'Branch Manager',
--     p_code          := 'branch_manager',
--     p_description   := 'Manages a specific branch location',
--     p_parent_role_id := (SELECT id FROM roles WHERE code = 'admin'),
--     p_level         := 2,
--     p_display_order := 9
-- );

-- Test 2: Update (SELECT ... returns void)
-- SELECT sp_roles_update(p_id := 1, p_name := 'Super Administrator');

-- Test 3: Delete
-- SELECT sp_roles_delete(p_id := 10);

-- Test 4: Restore with permissions
-- SELECT sp_roles_restore(p_id := 10, p_restore_permissions := TRUE);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  02  MODULES
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_modules_insert(CITEXT, CITEXT, TEXT, INT, TEXT, TEXT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_modules_update(BIGINT, CITEXT, CITEXT, TEXT, INT, TEXT, TEXT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_modules_delete(BIGINT);
DROP PROCEDURE IF EXISTS sp_modules_restore(BIGINT);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_modules_insert → RETURNS BIGINT                                       │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_modules_insert(
    IN p_name                       CITEXT,
    IN p_code                       CITEXT,
    IN p_description                TEXT DEFAULT NULL,
    IN p_display_order              INT DEFAULT 0,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_color                      TEXT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT TRUE,
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    IF TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Module name cannot be empty.';
    END IF;

    IF TRIM(p_code) = '' THEN
        RAISE EXCEPTION 'Module code cannot be empty.';
    END IF;

    IF EXISTS (SELECT 1 FROM modules WHERE code = p_code AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Module with code "%" already exists.', p_code;
    END IF;

    INSERT INTO modules (
        name, code, description, display_order, icon, color,
        is_active, created_by, updated_by
    )
    VALUES (
        TRIM(p_name), LOWER(TRIM(p_code)), p_description, p_display_order, p_icon, p_color,
        p_is_active, p_created_by, p_created_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error inserting module: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_modules_update → RETURNS VOID                                         │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_modules_update(
    IN p_id                         BIGINT,
    IN p_name                       CITEXT DEFAULT NULL,
    IN p_code                       CITEXT DEFAULT NULL,
    IN p_description                TEXT DEFAULT NULL,
    IN p_display_order              INT DEFAULT NULL,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_color                      TEXT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT NULL,
    IN p_updated_by                 BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_current_name CITEXT;
BEGIN

    SELECT name INTO v_current_name
    FROM modules WHERE id = p_id AND is_deleted = FALSE;

    IF v_current_name IS NULL THEN
        RAISE EXCEPTION 'Module with ID % does not exist or is deleted.', p_id;
    END IF;

    UPDATE modules
    SET
        name = COALESCE(NULLIF(TRIM(p_name)::CITEXT, ''), name),
        code = COALESCE(NULLIF(LOWER(TRIM(p_code))::CITEXT, ''), code),
        description = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        display_order = COALESCE(p_display_order, display_order),
        icon = CASE WHEN p_icon IS NOT NULL THEN p_icon ELSE icon END,
        color = CASE WHEN p_color IS NOT NULL THEN p_color ELSE color END,
        is_active = COALESCE(p_is_active, is_active),
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating module: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_modules_delete → RETURNS VOID                                         │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_modules_delete(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM modules WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Module with ID % does not exist or is already deleted.', p_id;
    END IF;

    UPDATE modules
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting module: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_modules_restore → RETURNS VOID                                        │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_modules_restore(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM modules WHERE id = p_id AND is_deleted = TRUE) THEN
        RAISE EXCEPTION 'Module with ID % is not deleted or does not exist.', p_id;
    END IF;

    UPDATE modules
    SET is_deleted = FALSE, is_active = TRUE, deleted_at = NULL
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error restoring module: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Modules
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Insert (returns BIGINT)
-- SELECT sp_modules_insert(
--     p_name          := 'Custom Module',
--     p_code          := 'custom_module',
--     p_description   := 'A custom feature module',
--     p_display_order := 50,
--     p_icon          := 'box'
-- );

-- Test 2: Update
-- SELECT sp_modules_update(p_id := 1, p_name := 'User & Auth Management');

-- Test 3: Delete
-- SELECT sp_modules_delete(p_id := 5);

-- Test 4: Restore
-- SELECT sp_modules_restore(p_id := 5);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  03  PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_permissions_insert(BIGINT, CITEXT, CITEXT, TEXT, TEXT, TEXT, TEXT, INT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_permissions_update(BIGINT, CITEXT, CITEXT, TEXT, TEXT, TEXT, TEXT, INT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_permissions_delete(BIGINT);
DROP PROCEDURE IF EXISTS sp_permissions_restore(BIGINT);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_permissions_insert → RETURNS BIGINT                                   │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_permissions_insert(
    IN p_module_id                  BIGINT,
    IN p_name                       CITEXT,
    IN p_code                       CITEXT,
    IN p_resource                   TEXT,
    IN p_action                     TEXT,
    IN p_scope                      TEXT DEFAULT 'global',
    IN p_description                TEXT DEFAULT NULL,
    IN p_display_order              INT DEFAULT 0,
    IN p_is_active                  BOOLEAN DEFAULT TRUE,
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    IF NOT EXISTS (SELECT 1 FROM modules WHERE id = p_module_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Module with ID % does not exist or is deleted.', p_module_id;
    END IF;

    IF TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Permission name cannot be empty.';
    END IF;

    IF EXISTS (SELECT 1 FROM permissions WHERE code = p_code AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Permission with code "%" already exists.', p_code;
    END IF;

    INSERT INTO permissions (
        module_id, name, code, description, resource, action, scope,
        display_order, is_active, created_by, updated_by
    )
    VALUES (
        p_module_id, TRIM(p_name), LOWER(TRIM(p_code)), p_description,
        LOWER(TRIM(p_resource)), LOWER(TRIM(p_action)), LOWER(TRIM(p_scope)),
        p_display_order, p_is_active, p_created_by, p_created_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error inserting permission: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_permissions_update → RETURNS VOID                                     │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_permissions_update(
    IN p_id                         BIGINT,
    IN p_name                       CITEXT DEFAULT NULL,
    IN p_code                       CITEXT DEFAULT NULL,
    IN p_description                TEXT DEFAULT NULL,
    IN p_resource                   TEXT DEFAULT NULL,
    IN p_action                     TEXT DEFAULT NULL,
    IN p_scope                      TEXT DEFAULT NULL,
    IN p_display_order              INT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT NULL,
    IN p_updated_by                 BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_current_name CITEXT;
BEGIN

    SELECT name INTO v_current_name FROM permissions WHERE id = p_id AND is_deleted = FALSE;

    IF v_current_name IS NULL THEN
        RAISE EXCEPTION 'Permission with ID % does not exist or is deleted.', p_id;
    END IF;

    UPDATE permissions
    SET
        name = COALESCE(NULLIF(TRIM(p_name)::CITEXT, ''), name),
        code = COALESCE(NULLIF(LOWER(TRIM(p_code))::CITEXT, ''), code),
        description = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        resource = COALESCE(NULLIF(LOWER(TRIM(p_resource)), ''), resource),
        action = COALESCE(NULLIF(LOWER(TRIM(p_action)), ''), action),
        scope = COALESCE(NULLIF(LOWER(TRIM(p_scope)), ''), scope),
        display_order = COALESCE(p_display_order, display_order),
        is_active = COALESCE(p_is_active, is_active),
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating permission: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_permissions_delete → RETURNS VOID                                     │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_permissions_delete(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Permission with ID % does not exist or is already deleted.', p_id;
    END IF;

    UPDATE permissions
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    -- Also remove from role_permissions
    UPDATE role_permissions
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE permission_id = p_id AND is_deleted = FALSE;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting permission: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_permissions_restore → RETURNS VOID                                    │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_permissions_restore(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = p_id AND is_deleted = TRUE) THEN
        RAISE EXCEPTION 'Permission with ID % is not deleted or does not exist.', p_id;
    END IF;

    UPDATE permissions
    SET is_deleted = FALSE, is_active = TRUE, deleted_at = NULL
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error restoring permission: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Permissions
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Insert (returns BIGINT)
-- SELECT sp_permissions_insert(
--     p_module_id     := (SELECT id FROM modules WHERE code = 'settings'),
--     p_name          := 'Manage Email Templates',
--     p_code          := 'settings.email_template.manage',
--     p_resource      := 'email_template',
--     p_action        := 'manage',
--     p_display_order := 3
-- );

-- Test 2: Update
-- SELECT sp_permissions_update(p_id := 1, p_name := 'Create New User');

-- Test 3: Delete
-- SELECT sp_permissions_delete(p_id := 5);

-- Test 4: Restore
-- SELECT sp_permissions_restore(p_id := 5);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  04  ROLE PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_role_permissions_insert(BIGINT, BIGINT, BIGINT);
DROP PROCEDURE IF EXISTS sp_role_permissions_bulk_insert(BIGINT, BIGINT[], BIGINT);
DROP PROCEDURE IF EXISTS sp_role_permissions_delete(BIGINT, BIGINT);
DROP PROCEDURE IF EXISTS sp_role_permissions_bulk_delete(BIGINT);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_role_permissions_insert → RETURNS BIGINT                              │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_role_permissions_insert(
    IN p_role_id                    BIGINT,
    IN p_permission_id              BIGINT,
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with ID % does not exist or is deleted.', p_role_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = p_permission_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Permission with ID % does not exist or is deleted.', p_permission_id;
    END IF;

    IF EXISTS (SELECT 1 FROM role_permissions WHERE role_id = p_role_id AND permission_id = p_permission_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'This permission is already assigned to this role.';
    END IF;

    INSERT INTO role_permissions (role_id, permission_id, created_by)
    VALUES (p_role_id, p_permission_id, p_created_by)
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error assigning permission to role: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_role_permissions_bulk_insert → RETURNS INT (count inserted)            │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_role_permissions_bulk_insert(
    IN p_role_id                    BIGINT,
    IN p_permission_ids             BIGINT[],
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_inserted INT := 0;
BEGIN

    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with ID % does not exist or is deleted.', p_role_id;
    END IF;

    INSERT INTO role_permissions (role_id, permission_id, created_by)
    SELECT p_role_id, pid, p_created_by
    FROM UNNEST(p_permission_ids) AS pid
    WHERE pid IN (SELECT id FROM permissions WHERE is_deleted = FALSE)
      AND NOT EXISTS (
          SELECT 1 FROM role_permissions
          WHERE role_id = p_role_id AND permission_id = pid AND is_deleted = FALSE
      );

    GET DIAGNOSTICS v_inserted = ROW_COUNT;

    RETURN v_inserted;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error bulk assigning permissions: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_role_permissions_delete → RETURNS VOID                                │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_role_permissions_delete(
    IN p_role_id        BIGINT,
    IN p_permission_id  BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = p_role_id AND permission_id = p_permission_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'This permission is not assigned to this role.';
    END IF;

    UPDATE role_permissions
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE role_id = p_role_id AND permission_id = p_permission_id AND is_deleted = FALSE;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing permission from role: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_role_permissions_bulk_delete → RETURNS INT (count deleted)             │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_role_permissions_bulk_delete(
    IN p_role_id    BIGINT
)
RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_deleted INT := 0;
BEGIN

    UPDATE role_permissions
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE role_id = p_role_id AND is_deleted = FALSE;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RETURN v_deleted;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing permissions from role: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Role Permissions
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Assign single permission (returns BIGINT)
-- SELECT sp_role_permissions_insert(
--     p_role_id       := (SELECT id FROM roles WHERE code = 'moderator'),
--     p_permission_id := (SELECT id FROM permissions WHERE code = 'user.export')
-- );

-- Test 2: Bulk assign (returns INT count)
-- SELECT sp_role_permissions_bulk_insert(
--     p_role_id       := (SELECT id FROM roles WHERE code = 'content_manager'),
--     p_permission_ids := ARRAY(SELECT id FROM permissions WHERE code IN ('review.read', 'review.approve'))
-- );

-- Test 3: Remove single
-- SELECT sp_role_permissions_delete(
--     p_role_id       := (SELECT id FROM roles WHERE code = 'moderator'),
--     p_permission_id := (SELECT id FROM permissions WHERE code = 'user.export')
-- );

-- Test 4: Bulk delete (returns INT count)
-- SELECT sp_role_permissions_bulk_delete(p_role_id := 9);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  05  USER ROLE ASSIGNMENTS
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_user_role_assignments_insert(BIGINT, BIGINT, TEXT, BIGINT, TIMESTAMPTZ, TEXT, BIGINT);
DROP PROCEDURE IF EXISTS sp_user_role_assignments_update(BIGINT, TIMESTAMPTZ, TEXT, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_user_role_assignments_delete(BIGINT);
DROP PROCEDURE IF EXISTS sp_user_role_assignments_restore(BIGINT);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_user_role_assignments_insert → RETURNS BIGINT                         │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_user_role_assignments_insert(
    IN p_user_id                    BIGINT,
    IN p_role_id                    BIGINT,
    IN p_context_type               TEXT DEFAULT NULL,
    IN p_context_id                 BIGINT DEFAULT NULL,
    IN p_expires_at                 TIMESTAMPTZ DEFAULT NULL,
    IN p_reason                     TEXT DEFAULT NULL,
    IN p_assigned_by                BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'User with ID % does not exist or is deleted.', p_user_id;
    END IF;

    -- Validate role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Role with ID % does not exist or is deleted.', p_role_id;
    END IF;

    -- Validate context consistency
    IF (p_context_type IS NULL) <> (p_context_id IS NULL) THEN
        RAISE EXCEPTION 'context_type and context_id must both be NULL or both be provided.';
    END IF;

    -- Check for duplicate active assignment
    IF EXISTS (
        SELECT 1 FROM user_role_assignments
        WHERE user_id = p_user_id
          AND role_id = p_role_id
          AND COALESCE(context_type, '') = COALESCE(p_context_type, '')
          AND COALESCE(context_id, 0) = COALESCE(p_context_id, 0)
          AND is_deleted = FALSE
          AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'This role is already assigned to this user in this context.';
    END IF;

    INSERT INTO user_role_assignments (
        user_id, role_id, context_type, context_id,
        expires_at, reason, assigned_by
    )
    VALUES (
        p_user_id, p_role_id, p_context_type, p_context_id,
        p_expires_at, p_reason, p_assigned_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error assigning role to user: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_user_role_assignments_update → RETURNS VOID                           │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_user_role_assignments_update(
    IN p_id                         BIGINT,
    IN p_expires_at                 TIMESTAMPTZ DEFAULT NULL,
    IN p_reason                     TEXT DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT NULL,
    IN p_updated_by                 BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM user_role_assignments WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Assignment with ID % does not exist or is deleted.', p_id;
    END IF;

    UPDATE user_role_assignments
    SET
        expires_at = CASE WHEN p_expires_at IS NOT NULL THEN p_expires_at ELSE expires_at END,
        reason = CASE WHEN p_reason IS NOT NULL THEN p_reason ELSE reason END,
        is_active = COALESCE(p_is_active, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating user role assignment: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_user_role_assignments_delete → RETURNS VOID                           │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_user_role_assignments_delete(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM user_role_assignments WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Assignment with ID % does not exist or is already deleted.', p_id;
    END IF;

    UPDATE user_role_assignments
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error revoking user role assignment: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_user_role_assignments_restore → RETURNS VOID                          │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_user_role_assignments_restore(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM user_role_assignments WHERE id = p_id AND is_deleted = TRUE) THEN
        RAISE EXCEPTION 'Assignment with ID % is not deleted or does not exist.', p_id;
    END IF;

    UPDATE user_role_assignments
    SET is_deleted = FALSE, is_active = TRUE, deleted_at = NULL
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error restoring user role assignment: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — User Role Assignments
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Assign global admin role (returns BIGINT)
-- SELECT sp_user_role_assignments_insert(
--     p_user_id    := 2,
--     p_role_id    := (SELECT id FROM roles WHERE code = 'admin'),
--     p_reason     := 'Promoted to admin',
--     p_assigned_by := 1
-- );

-- Test 2: Assign course-scoped instructor role
-- SELECT sp_user_role_assignments_insert(
--     p_user_id       := 5,
--     p_role_id       := (SELECT id FROM roles WHERE code = 'instructor'),
--     p_context_type  := 'course',
--     p_context_id    := 1,
--     p_reason        := 'Assigned as course instructor'
-- );

-- Test 3: Extend expiry
-- SELECT sp_user_role_assignments_update(
--     p_id         := 2,
--     p_expires_at := CURRENT_TIMESTAMP + INTERVAL '60 days'
-- );

-- Test 4: Delete
-- SELECT sp_user_role_assignments_delete(p_id := 3);

-- Test 5: Restore
-- SELECT sp_user_role_assignments_restore(p_id := 3);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  06  MENU NAVIGATION
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedures                                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_menu_items_insert(CITEXT, CITEXT, TEXT, TEXT, TEXT, BIGINT, BIGINT, INT, BOOLEAN, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_menu_items_update(BIGINT, CITEXT, CITEXT, TEXT, TEXT, TEXT, BIGINT, BIGINT, INT, BOOLEAN, BOOLEAN, BIGINT);
DROP PROCEDURE IF EXISTS sp_menu_items_delete(BIGINT);
DROP PROCEDURE IF EXISTS sp_menu_items_restore(BIGINT, BOOLEAN);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_menu_items_insert → RETURNS BIGINT                                    │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_menu_items_insert(
    IN p_name                       CITEXT,
    IN p_code                       CITEXT,
    IN p_route                      TEXT DEFAULT NULL,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_description                TEXT DEFAULT NULL,
    IN p_parent_menu_id             BIGINT DEFAULT NULL,
    IN p_permission_id              BIGINT DEFAULT NULL,
    IN p_display_order              INT DEFAULT 0,
    IN p_is_visible                 BOOLEAN DEFAULT TRUE,
    IN p_is_active                  BOOLEAN DEFAULT TRUE,
    IN p_created_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_new_id BIGINT;
BEGIN

    IF TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Menu item name cannot be empty.';
    END IF;

    IF EXISTS (SELECT 1 FROM menu_items WHERE code = p_code AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Menu item with code "%" already exists.', p_code;
    END IF;

    IF p_parent_menu_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM menu_items WHERE id = p_parent_menu_id AND is_deleted = FALSE) THEN
            RAISE EXCEPTION 'Parent menu item with ID % does not exist or is deleted.', p_parent_menu_id;
        END IF;
    END IF;

    IF p_permission_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM permissions WHERE id = p_permission_id AND is_deleted = FALSE) THEN
            RAISE EXCEPTION 'Permission with ID % does not exist or is deleted.', p_permission_id;
        END IF;
    END IF;

    INSERT INTO menu_items (
        name, code, route, icon, description,
        parent_menu_id, permission_id,
        display_order, is_visible, is_active,
        created_by, updated_by
    )
    VALUES (
        TRIM(p_name), LOWER(TRIM(p_code)), p_route, p_icon, p_description,
        p_parent_menu_id, p_permission_id,
        p_display_order, p_is_visible, p_is_active,
        p_created_by, p_created_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error inserting menu item: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_menu_items_update → RETURNS VOID                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_menu_items_update(
    IN p_id                         BIGINT,
    IN p_name                       CITEXT DEFAULT NULL,
    IN p_code                       CITEXT DEFAULT NULL,
    IN p_route                      TEXT DEFAULT NULL,
    IN p_icon                       TEXT DEFAULT NULL,
    IN p_description                TEXT DEFAULT NULL,
    IN p_parent_menu_id             BIGINT DEFAULT NULL,
    IN p_permission_id              BIGINT DEFAULT NULL,
    IN p_display_order              INT DEFAULT NULL,
    IN p_is_visible                 BOOLEAN DEFAULT NULL,
    IN p_is_active                  BOOLEAN DEFAULT NULL,
    IN p_updated_by                 BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_current_name CITEXT;
BEGIN

    SELECT name INTO v_current_name FROM menu_items WHERE id = p_id AND is_deleted = FALSE;

    IF v_current_name IS NULL THEN
        RAISE EXCEPTION 'Menu item with ID % does not exist or is deleted.', p_id;
    END IF;

    IF p_parent_menu_id IS NOT NULL AND p_parent_menu_id = p_id THEN
        RAISE EXCEPTION 'Cannot set parent_menu_id to the same ID (self-reference).';
    END IF;

    UPDATE menu_items
    SET
        name = COALESCE(NULLIF(TRIM(p_name)::CITEXT, ''), name),
        code = COALESCE(NULLIF(LOWER(TRIM(p_code))::CITEXT, ''), code),
        route = CASE WHEN p_route IS NOT NULL THEN p_route ELSE route END,
        icon = CASE WHEN p_icon IS NOT NULL THEN p_icon ELSE icon END,
        description = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
        parent_menu_id = COALESCE(p_parent_menu_id, parent_menu_id),
        permission_id = COALESCE(p_permission_id, permission_id),
        display_order = COALESCE(p_display_order, display_order),
        is_visible = COALESCE(p_is_visible, is_visible),
        is_active = COALESCE(p_is_active, is_active),
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating menu item: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_menu_items_delete → RETURNS VOID                                      │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_menu_items_delete(
    IN p_id     BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM menu_items WHERE id = p_id AND is_deleted = FALSE) THEN
        RAISE EXCEPTION 'Menu item with ID % does not exist or is already deleted.', p_id;
    END IF;

    -- Soft delete the item
    UPDATE menu_items
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_id;

    -- Cascade to child menu items
    UPDATE menu_items
    SET is_deleted = TRUE, is_active = FALSE, deleted_at = CURRENT_TIMESTAMP
    WHERE parent_menu_id = p_id AND is_deleted = FALSE;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting menu item: %', SQLERRM;
END;
$$;


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_menu_items_restore → RETURNS VOID                                     │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_menu_items_restore(
    IN p_id                     BIGINT,
    IN p_restore_children       BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM menu_items WHERE id = p_id AND is_deleted = TRUE) THEN
        RAISE EXCEPTION 'Menu item with ID % is not deleted or does not exist.', p_id;
    END IF;

    UPDATE menu_items
    SET is_deleted = FALSE, is_active = TRUE, deleted_at = NULL
    WHERE id = p_id;

    IF p_restore_children THEN
        UPDATE menu_items
        SET is_deleted = FALSE, is_active = TRUE, deleted_at = NULL
        WHERE parent_menu_id = p_id;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error restoring menu item: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Menu Navigation
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Insert (returns BIGINT)
-- SELECT sp_menu_items_insert(
--     p_name          := 'Analytics',
--     p_code          := 'analytics',
--     p_route         := '/analytics',
--     p_icon          := 'pie-chart',
--     p_display_order := 25,
--     p_permission_id := (SELECT id FROM permissions WHERE code = 'report.read')
-- );

-- Test 2: Update
-- SELECT sp_menu_items_update(p_id := 1, p_name := 'Home Dashboard');

-- Test 3: Delete with cascade
-- SELECT sp_menu_items_delete(p_id := 2);

-- Test 4: Restore with children
-- SELECT sp_menu_items_restore(p_id := 2, p_restore_children := TRUE);

-- ══════════════════════════════════════════════════════════════════════════════



-- ══════════════════════════════════════════════════════════════════════════════
--  07  ROLE CHANGE LOG
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  Drop old procedure                                                       │
-- └────────────────────────────────────────────────────────────────────────────┘

DROP PROCEDURE IF EXISTS sp_role_change_log_insert(BIGINT, TEXT, BIGINT, TEXT, BIGINT, JSONB, JSONB, TEXT, INET, BIGINT);


-- ┌────────────────────────────────────────────────────────────────────────────┐
-- │  sp_role_change_log_insert → RETURNS BIGINT                               │
-- └────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION sp_role_change_log_insert(
    IN p_user_id                    BIGINT,
    IN p_action                     TEXT,
    IN p_role_id                    BIGINT DEFAULT NULL,
    IN p_context_type               TEXT DEFAULT NULL,
    IN p_context_id                 BIGINT DEFAULT NULL,
    IN p_old_values                 JSONB DEFAULT NULL,
    IN p_new_values                 JSONB DEFAULT NULL,
    IN p_reason                     TEXT DEFAULT NULL,
    IN p_ip_address                 INET DEFAULT NULL,
    IN p_changed_by                 BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_role_code CITEXT;
    v_role_name CITEXT;
    v_new_id    BIGINT;
BEGIN

    -- Get role details for denormalized storage
    IF p_role_id IS NOT NULL THEN
        SELECT code, name INTO v_role_code, v_role_name
        FROM roles WHERE id = p_role_id;
    END IF;

    INSERT INTO role_change_log (
        user_id, action, role_id, role_code, role_name,
        context_type, context_id,
        old_values, new_values,
        reason, ip_address, changed_by
    )
    VALUES (
        p_user_id, p_action, p_role_id, v_role_code, v_role_name,
        p_context_type, p_context_id,
        p_old_values, p_new_values,
        p_reason, p_ip_address, p_changed_by
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error logging role change: %', SQLERRM;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TESTING QUERIES — Role Change Log
-- ══════════════════════════════════════════════════════════════════════════════

-- Test 1: Log a role assignment (returns BIGINT)
-- SELECT sp_role_change_log_insert(
--     p_user_id    := 5,
--     p_action     := 'assigned',
--     p_role_id    := (SELECT id FROM roles WHERE code = 'moderator'),
--     p_reason     := 'Promoted to moderator by admin',
--     p_changed_by := 1
-- );

-- Test 2: Log a role revocation
-- SELECT sp_role_change_log_insert(
--     p_user_id    := 5,
--     p_action     := 'revoked',
--     p_role_id    := (SELECT id FROM roles WHERE code = 'moderator'),
--     p_reason     := 'Temporary role expired',
--     p_changed_by := 1
-- );

-- ══════════════════════════════════════════════════════════════════════════════



-- ==============================================================================
--  PHASE 36 UPDATE — PROCEDURE → FUNCTION CONVERSION COMPLETE
--
--  Total functions created : 25
--
--  Summary:
--    01 Roles                  : 4 functions (insert, update, delete, restore)
--    02 Modules                : 4 functions (insert, update, delete, restore)
--    03 Permissions            : 4 functions (insert, update, delete, restore)
--    04 Role Permissions       : 4 functions (insert, bulk_insert, delete, bulk_delete)
--    05 User Role Assignments  : 4 functions (insert, update, delete, restore)
--    06 Menu Navigation        : 4 functions (insert, update, delete, restore)
--    07 Role Change Log        : 1 function  (insert)
--
--  Return types:
--    INSERT functions  → RETURNS BIGINT   (new row ID)
--    UPDATE functions  → RETURNS VOID
--    DELETE functions  → RETURNS VOID
--    RESTORE functions → RETURNS VOID
--    BULK INSERT       → RETURNS INT      (rows inserted count)
--    BULK DELETE       → RETURNS INT      (rows deleted count)
--
--  Usage change:
--    OLD: CALL sp_roles_insert(p_name := 'Admin', ...);
--    NEW: SELECT sp_roles_insert(p_name := 'Admin', ...);
--
--  Supabase RPC:
--    const { data } = await supabase.rpc('sp_roles_insert', { p_name: 'Admin', ... });
--    // data = new BIGINT id
--
-- ==============================================================================
