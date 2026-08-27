/**
 * Module: gapStore
 * Responsibility: Hold a user's gaps across analyses, and decide what a new
 * analysis means for the ones already there.
 *
 * This is where "the profile shows progress rather than a list" is actually
 * implemented, and the whole of it is in reconcileGaps below. Everything else in
 * the file is reads.
 *
 * THE LIFECYCLE, AND THE ONE THING IT MUST NOT DO
 *
 * A gap opens on first detection. On a later analysis from the same source, any
 * open gap that was not re-detected is closed with a timestamp — that is the
 * progress. A closed gap detected again reopens, because a rewrite that undid an
 * earlier fix should show up.
 *
 * What it must not do is touch a dismissed gap. Dismissed is the user saying it
 * does not apply to them, and it is deliberately not the same as closed: closed
 * counts as progress, dismissed does not. If a re-detection could quietly reopen
 * a dismissed gap, the user would dismiss it, run another review, and find it
 * back on their board with no explanation — so the dismissal wins and the
 * detection is recorded on last_seen instead.
 *
 * SCOPED CLOSING
 *
 * Closing is scoped to the source that produced the analysis. A resume review
 * cannot see what an interview revealed about how someone talks, so a review
 * that does not mention it is not evidence that it is fixed. Closing across
 * sources would let each feature quietly clear the other's findings, and the
 * board would report progress nobody made.
 */

import pool from '../db.js';
import { GAP_SEVERITY_WEIGHT, summariseGapProgress } from 'ai-service';

/**
 * Sources whose findings a given source is allowed to close.
 *
 * A review with an advertisement (role_comparison) and one without (resume) are
 * the same eye on the same document, so each closes the other's findings — a
 * user who ran their first review without an advertisement should not carry
 * those gaps forever once they start supplying one.
 */
const CLOSES = Object.freeze({
  resume: ['resume', 'role_comparison'],
  role_comparison: ['resume', 'role_comparison'],
  interview: ['interview'],
});

/**
 * Applies one analysis to the user's board.
 *
 * Runs in a single transaction. A half-applied reconciliation — some gaps
 * upserted, none closed — is a board that has silently stopped being true, and
 * unlike a failed write it leaves nothing to notice.
 *
 * @param {object} input
 * @param {string|number} input.userId
 * @param {Array<object>} input.gaps normalised gaps from ai-service
 * @param {'resume'|'interview'|'role_comparison'} input.source
 * @param {string} [input.targetRole]
 * @param {'en'|'bn'} [input.language]
 * @returns {Promise<{opened: number, reopened: number, updated: number, closed: number}>}
 */
export async function reconcileGaps({ userId, gaps = [], source, targetRole = null, language = 'en' }) {
  if (!userId || userId === 'guest') return { opened: 0, reopened: 0, updated: 0, closed: 0 };

  const client = await pool.connect();
  const detected = gaps.map((gap) => gap.gap_key);

  try {
    await client.query('BEGIN');

    /*
     * What each detected gap was before this analysis touched it.
     *
     * Read up front, in one query, because the upsert cannot report it. An
     * ON CONFLICT DO UPDATE ... RETURNING hands back the row as it now stands,
     * so by the time closed_at could be inspected the update has already
     * cleared it — which made every reopened gap count as an ordinary update
     * and the [gaps] log line quietly report zero reopenings forever. The
     * difference matters: a gap coming back is a regression the user should be
     * able to see in the log, not a routine refresh.
     */
    const priorRows = await client.query(
      'SELECT gap_key, status FROM user_gaps WHERE user_id = $1 AND gap_key = ANY($2)',
      [userId, detected.length > 0 ? detected : ['']]
    );
    const prior = new Map(priorRows.rows.map((row) => [row.gap_key, row.status]));

    let opened = 0, reopened = 0, updated = 0;

    for (const gap of gaps) {
      const before = prior.get(gap.gap_key);
      if (before === undefined) opened++;
      else if (before === 'closed') reopened++;
      else updated++;

      await client.query(
        `INSERT INTO user_gaps
           (user_id, gap_key, source, category, description, severity, closeable,
            remediation, status, target_role, language, first_seen, last_seen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10, NOW(), NOW())
         ON CONFLICT (user_id, gap_key) DO UPDATE SET
           -- The prose is refreshed from the newest analysis, because the older
           -- wording described an older version of the resume.
           --
           -- The source column is the exception and is NOT refreshed. It is
           -- where the gap was FIRST found, and closing is scoped to it, so
           -- overwriting it moves the gap out of reach of the analysis that can
           -- actually close it: a SQL gap raised by the resume review and later
           -- re-detected by an interview would become interview-scoped, and no
           -- future review of a resume that finally evidences SQL would ever
           -- close it. Observed exactly that way in testing on 2026-08-27.
           --
           -- The cost is the mirror case — a gap both features find is closed
           -- only by whichever found it first — and that errs towards leaving a
           -- gap open, which is the safe direction. Claiming progress nobody
           -- made is the failure worth avoiding.
           category    = EXCLUDED.category,
           description = EXCLUDED.description,
           severity    = EXCLUDED.severity,
           closeable   = EXCLUDED.closeable,
           remediation = EXCLUDED.remediation,
           target_role = EXCLUDED.target_role,
           language    = EXCLUDED.language,
           last_seen   = NOW(),
           -- A dismissal survives re-detection. See the note at the top of this
           -- file: the alternative is a gap the user dismissed reappearing with
           -- no explanation.
           status      = CASE WHEN user_gaps.status = 'dismissed'
                              THEN 'dismissed' ELSE 'open' END,
           closed_at   = CASE WHEN user_gaps.status = 'dismissed'
                              THEN user_gaps.closed_at ELSE NULL END`,
        [
          userId,
          gap.gap_key,
          source,
          gap.category,
          gap.description,
          gap.severity,
          gap.closeable,
          JSON.stringify({
            steps: gap.remediation?.steps ?? [],
            resource_query: gap.remediation?.resource_query ?? '',
            effort: gap.remediation?.effort ?? '',
            alternative_role: gap.alternative_role ?? null,
          }),
          targetRole,
          language,
        ]
      );
    }

    // Everything this source found before and did not find now.
    const closed = await client.query(
      `UPDATE user_gaps
          SET status = 'closed', closed_at = NOW()
        WHERE user_id = $1
          AND status = 'open'
          AND source = ANY($2)
          AND NOT (gap_key = ANY($3))
        RETURNING gap_id`,
      [userId, CLOSES[source] ?? [source], detected]
    );

    await client.query('COMMIT');

    const summary = {
      opened, reopened, updated, closed: closed.rowCount,
    };
    console.log(
      `[gaps] reconcile user=${userId} source=${source} opened=${summary.opened}`
      + ` reopened=${summary.reopened} updated=${summary.updated} closed=${summary.closed}`
    );
    return summary;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Words that carry no subject, stripped before matching.
 *
 * Without this the match is worse than useless rather than merely thin. A live
 * gap keyed "data cleaning techniques pandas sql" matched "Essential lab
 * techniques every science graduate should know", on the single word
 * "techniques" — a confidently wrong link under a heading that says where to
 * learn the thing. Generic vocabulary is exactly what a curated library repeats
 * across every unrelated row, so it is the one kind of word that must not decide
 * a match.
 */
const GENERIC_TERMS = new Set([
  'techniques', 'technique', 'skills', 'skill', 'basics', 'basic', 'guide',
  'guides', 'introduction', 'intro', 'fundamentals', 'tips', 'best', 'practices',
  'practice', 'course', 'tutorial', 'training', 'learning', 'learn', 'using',
  'with', 'your', 'the', 'and', 'for', 'how', 'what', 'advanced', 'beginner',
  'beginners', 'professional', 'modern', 'complete', 'essential', 'overview',
]);

/**
 * Attaches real resource links to a set of gaps.
 *
 * The model returns a search term rather than a URL, because it has no browsing
 * tool and would invent plausible links — see prompt/gaps.js. This is the other
 * half of that decision: the term is matched against the resources table, so
 * every link on the board points at a row an admin actually curated, and the
 * Career Resources page acquires the functional role in the product it has never
 * had.
 *
 * One query for the whole set rather than one per gap. Matching is a case
 * -insensitive substring over the English title and the category, deliberately
 * biased towards showing nothing: a title hit is worth two, a category hit one,
 * and two points are needed. A category hit alone therefore never qualifies,
 * which matters because "Skill Development" would otherwise match every skill
 * gap in the product. A gap with no matching resource shows its steps and no
 * links, and that is a correct and unremarkable outcome — an unrelated link
 * under "where to learn it" is not.
 *
 * @param {Array<object>} gaps rows from listGaps
 * @param {'en'|'bn'} lang
 * @returns {Promise<Array<object>>} the same gaps, each with a `resources` array
 */
export async function attachResources(gaps, lang = 'en') {
  const queries = [...new Set(
    gaps.map((gap) => String(gap.remediation?.resource_query ?? '').trim().toLowerCase())
      .filter((q) => q.length >= 3)
  )];

  if (queries.length === 0) return gaps.map((gap) => ({ ...gap, resources: [] }));

  const title = lang === 'bn' ? 'COALESCE(title_bn, title_en)' : 'title_en';

  let rows = [];
  try {
    const result = await pool.query(
      `SELECT id, ${title} AS title, type, category, url, LOWER(title_en) AS match_title,
              LOWER(category) AS match_category
         FROM resources
        WHERE url IS NOT NULL AND url <> ''`,
    );
    rows = result.rows;
  } catch (err) {
    // The board is still worth showing without links. A resources table that is
    // missing or behind is a content problem, not a reason to fail a read of the
    // user's own gaps.
    console.warn('[gaps] Could not attach resources:', err.message);
    return gaps.map((gap) => ({ ...gap, resources: [] }));
  }

  return gaps.map((gap) => {
    const query = String(gap.remediation?.resource_query ?? '').trim().toLowerCase();
    if (query.length < 3) return { ...gap, resources: [] };

    const terms = query
      .split(/\s+/)
      .filter((term) => term.length >= 3 && !GENERIC_TERMS.has(term));

    // Nothing but generic vocabulary. Better to show no link than to match on
    // the words every row in the library shares.
    if (terms.length === 0) return { ...gap, resources: [] };

    const scored = rows
      .map((row) => ({
        row,
        score: terms.reduce((total, term) => (
          total
          + (row.match_title.includes(term) ? 2 : 0)
          + (row.match_category.includes(term) ? 1 : 0)
        ), 0),
      }))
      .filter((entry) => entry.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ row }) => ({ id: row.id, title: row.title, type: row.type, url: row.url }));

    return { ...gap, resources: scored };
  });
}

/** Every gap held for one user, worst and most recent first. */
export async function listGaps(userId) {
  const result = await pool.query(
    `SELECT gap_id, gap_key, source, category, description, severity, closeable,
            remediation, status, target_role, language,
            first_seen, last_seen, closed_at, dismissed_at
       FROM user_gaps
      WHERE user_id = $1
      ORDER BY
        CASE status WHEN 'open' THEN 0 WHEN 'closed' THEN 1 ELSE 2 END,
        CASE severity WHEN 'blocking' THEN 0 WHEN 'significant' THEN 1 ELSE 2 END,
        last_seen DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * The progress figure, and the counts behind it.
 *
 * Severity-weighted rather than counted, and the per-category breakdown is
 * returned alongside because the categories carry different advice: a board that
 * is mostly evidence gaps is a rewriting afternoon, and one that is mostly
 * experience gaps is a different job search. A single percentage cannot say
 * which of those a user is looking at.
 */
export async function readGapSummary(userId) {
  const gaps = await listGaps(userId);
  const overall = summariseGapProgress(gaps);

  const byCategory = {};
  for (const gap of gaps) {
    const bucket = byCategory[gap.category] ?? (byCategory[gap.category] = { open: 0, closed: 0, dismissed: 0, weightOpen: 0 });
    if (gap.status === 'open') {
      bucket.open++;
      bucket.weightOpen += GAP_SEVERITY_WEIGHT[gap.severity] ?? GAP_SEVERITY_WEIGHT.minor;
    } else if (gap.status === 'closed') bucket.closed++;
    else bucket.dismissed++;
  }

  // The single most useful line on the page: what to do next. Highest severity
  // among the gaps that are closeable now, because that is the one with the best
  // ratio of effort to movement.
  const nextUp = gaps
    .filter((gap) => gap.status === 'open')
    .sort((a, b) => {
      const closeable = (gap) => (gap.closeable === 'now' ? 0 : gap.closeable === 'months' ? 1 : 2);
      const severity = (gap) => (gap.severity === 'blocking' ? 0 : gap.severity === 'significant' ? 1 : 2);
      return closeable(a) - closeable(b) || severity(a) - severity(b);
    })[0] ?? null;

  return { ...overall, byCategory, nextUp, total: gaps.length };
}

/**
 * Sets a gap's status from the user's own action.
 *
 * user_id is in the WHERE clause rather than compared after the row is fetched,
 * for the same reason it is in the review history route: both refuse the
 * request, and only one of them cannot be undone by a later edit that forgets
 * the check.
 *
 * @param {string|number} userId
 * @param {number} gapId
 * @param {'dismissed'|'open'} status
 * @returns {Promise<object|null>} the updated row, or null when it is not theirs
 */
export async function setGapStatus(userId, gapId, status) {
  // $3 is cast explicitly at every use. Postgres infers a parameter's type from
  // where it appears, and here it appears once assigned to a varchar column and
  // twice compared against an untyped literal — which it reports as "inconsistent
  // types deduced for parameter $3" and refuses, so every dismissal failed.
  const result = await pool.query(
    `UPDATE user_gaps
        SET status       = $3::text,
            dismissed_at = CASE WHEN $3::text = 'dismissed' THEN NOW() ELSE NULL END,
            -- Restoring a dismissed gap returns it to open, not to closed. The
            -- user is saying it does apply after all, and nothing has happened
            -- since to suggest it has been dealt with.
            closed_at    = CASE WHEN $3::text = 'open' THEN NULL ELSE closed_at END
      WHERE gap_id = $2 AND user_id = $1
      RETURNING gap_id, gap_key, status, dismissed_at, closed_at`,
    [userId, gapId, status]
  );
  return result.rows[0] ?? null;
}

/** Open gaps only, in the shape the interview prompt expects. */
export async function readOpenGapsForPrompt(userId, limit = 6) {
  const result = await pool.query(
    `SELECT gap_key, category, description, severity
       FROM user_gaps
      WHERE user_id = $1 AND status = 'open'
      ORDER BY
        CASE severity WHEN 'blocking' THEN 0 WHEN 'significant' THEN 1 ELSE 2 END,
        last_seen DESC
      LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
