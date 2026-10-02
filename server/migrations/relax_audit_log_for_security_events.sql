-- Let audit_log hold security events as well as administrative content writes.
--
-- create_audit_log_table.sql made `action` and `entity` NOT NULL because every
-- row was a create, update or delete of a content record. add_audit_log.sql
-- then added the columns for security events (event_type, email, ip_address,
-- user_agent, metadata) that utils/audit.js writes for logins, codes and
-- registrations. Those rows have no action or entity, so every insert failed
-- the NOT NULL constraint and, being fire-and-forget, failed silently: the
-- security dashboard's audit log stayed empty.
--
-- The action CHECK constraint is kept. It still allows NULL, and still refuses
-- anything other than create / update / delete when an action is given.
-- Safe to re-run.

ALTER TABLE audit_log ALTER COLUMN action DROP NOT NULL;
ALTER TABLE audit_log ALTER COLUMN entity DROP NOT NULL;
