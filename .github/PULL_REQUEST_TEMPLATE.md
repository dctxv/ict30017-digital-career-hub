## Summary
<!-- What does this PR do? One or two sentences. -->

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] Config / setup
- [ ] Documentation

## Notes for reviewer
<!-- Anything the reviewer should know before reading the code. -->

## Security checklist

Tick every line, or write why it does not apply. An unticked box with no
explanation blocks the review.

- [ ] **No secrets in the diff.** No API keys, tokens, passwords, connection
      strings or private keys, including in tests, fixtures, comments and
      sample output. New configuration is read from the environment and the
      key name is added to `server/.env.example` with a placeholder value.
- [ ] **Input is validated server side.** Every new or changed request body,
      query parameter and route parameter is validated on the server. Client
      side checks are treated as a convenience only and never as the control.
- [ ] **Protected routes enforce authentication and role checks.** Any new
      endpoint that reads or writes user data runs `requireAuth`, and anything
      administrative also runs `requireRole`. Frontend guards such as
      `RequireAuth` are an addition, not a replacement.
- [ ] **File uploads are validated by magic bytes.** Extension and MIME type
      checks alone are not sufficient. Size limits are enforced server side and
      uploaded temporary files are deleted on both success and failure.
- [ ] **Rate limits are present on authentication and AI endpoints.** New auth
      or AI routes carry a limiter. Limits are keyed on user identity where the
      caller is known, so shared and NAT addresses do not pool one allowance.
- [ ] **No plain text credential storage.** Passwords are hashed with bcrypt,
      reset tokens are stored hashed, and no credential is written to logs.

## Verification
<!-- What did you actually run? Commands, endpoints hit, expected vs observed. -->
