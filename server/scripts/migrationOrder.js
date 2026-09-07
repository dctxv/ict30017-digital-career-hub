/**
 * The order the SQL migrations are applied in.
 *
 * Lives in its own file because two scripts need it: migrate.js applies it and
 * check-setup.js reports what is still pending against it. One list, so the
 * two can never disagree about what "up to date" means.
 */

/**
 * Order matters and is not alphabetical: content tables must exist before they
 * are seeded, and the bilingual columns before the Bangla that fills them. This
 * list is the authority — the README mirrors it, and mirrored it wrongly before
 * (add_resume_review_tracking.sql was missing entirely, so the review quota
 * columns were never created on a machine set up from the documentation).
 */
export const MIGRATION_ORDER = Object.freeze([
  'create_users_table.sql',
  'add_login_attempt_tracking.sql',
  'add_password_reset_tokens.sql',
  'add_chat_turn_tracking.sql',
  'add_resume_review_tracking.sql',
  'add_user_tier.sql',
  'create_content_tables.sql',
  'seed_content_data.sql',
  'fix_resource_links.sql',
  'add_bilingual_content.sql',
  'seed_bangla_content.sql',
  'add_alumni_contact_fields.sql',
  'add_user_profile_fields.sql',
  'create_review_history_tables.sql',
  'create_chat_history_tables.sql',
  'create_subscriptions_table.sql',
  'create_audit_log_table.sql',
  'add_subscription_payment_method.sql',
  'add_subscription_upgrade_source.sql',
  'create_preparation_tables.sql',
]);
