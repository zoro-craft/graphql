import { graphql } from './graphql.js';
import { projectName, safeValue } from '../utils/format.js';

// Everything the profile screen needs, fetched in a single request.
const PROFILE_QUERY = `
{
  user {
    login
    avatarUrl
    auditRatio

    # Sum of every XP transaction across all modules.
    xp: transactions_aggregate(
      where: { type: { _eq: "xp" }, event: { object: { type: { _eq: "module" } } } }
    ) {
      aggregate { sum { amount } }
    }

    # Highest level reached.
    level: transactions_aggregate(
      where: { type: { _eq: "level" }, event: { object: { type: { _eq: "module" } } } }
    ) {
      aggregate { max { amount } }
    }

    # First cohort that has a label.
    cohort_number: events(where: { cohorts: { labelName: { _is_null: false } } }) {
      cohorts { labelName }
    }

    # Audit pass/fail counts, used by the donut chart.
    succeeded_audits: audits_aggregate(where: { closureType: { _eq: succeeded } }) {
      aggregate { count }
    }
    failed_audits: audits_aggregate(where: { closureType: { _eq: failed } }) {
      aggregate { count }
    }

    # Per-project XP rows, sorted by the API and re-sorted in code.
    project_xp: transactions(
      where: { type: { _eq: "xp" }, object: { type: { _eq: "project" } }, event: { object: { name: { _eq: "Module" } } } }
      order_by: { amount: desc }
    ) {
      amount
      path
    }
  }
}
`;

export async function fetchProfile() {
  const result = await graphql(PROFILE_QUERY);
  if (!result.ok) {
    return result;
  }

  // The profile is the first (and only) row in the "user" collection.
  const user = result.data?.user?.[0] ?? null;
  return { ok: true, user: user };
}

// Read an aggregate number (sum/max) from a GraphQL aggregate node.
function aggregateValue(aggregateNode, key) {
  const amount = aggregateNode?.aggregate?.[key]?.amount;
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return amount;
  }
  return undefined;
}

// Read a count from a GraphQL aggregate node.
function aggregateCount(aggregateNode) {
  const count = aggregateNode?.aggregate?.count;
  if (typeof count === 'number' && Number.isFinite(count)) {
    return count;
  }
  return undefined;
}

// Find the first non-empty cohort label across the user's events.
function firstCohortLabel(cohortNumber) {
  if (!Array.isArray(cohortNumber)) return undefined;
  for (const event of cohortNumber) {
    if (event?.cohorts) {
      for (const cohort of event.cohorts) {
        if (cohort?.labelName && typeof cohort.labelName === 'string' && cohort.labelName.trim() !== '') {
          return cohort.labelName;
        }
      }
    }
  }
  return undefined;
}

// Build the identification card values.
export function mapIdentification(user) {
  let username = '-';
  let photo = '-';
  let cohort = '-';
  let totalXp = '-';
  let level = '-';
  let auditRatio = '-';

  if (user) {
    username = safeValue(user.login);
    photo = safeValue(user.avatarUrl);
    cohort = safeValue(firstCohortLabel(user.cohort_number));
    level = safeValue(aggregateValue(user.level, 'max'));

    const ratio = user.auditRatio;
    if (typeof ratio === 'number' && Number.isFinite(ratio)) {
      auditRatio = ratio;
    }

    // Total XP is kept in raw bytes; formatting happens at render time.
    const xp = aggregateValue(user.xp, 'sum');
    if (xp !== undefined) {
      totalXp = xp;
    }
  }

  return { username, photo, cohort, totalXp, level, auditRatio };
}

// Build the data for the audit donut chart.
export function mapDonut(user) {
  let succeeded;
  let failed;
  if (user) {
    succeeded = aggregateCount(user.succeeded_audits);
    failed = aggregateCount(user.failed_audits);
  }

  // Only build segments when the API returned at least one count.
  const hasData = succeeded !== undefined || failed !== undefined;
  const segments = hasData
    ? [
        { label: 'succeeded', value: succeeded || 0 },
        { label: 'failed', value: failed || 0 }
      ]
    : [];

  return { succeededCount: safeValue(succeeded), failedCount: safeValue(failed), segments };
}

// Build the bar chart data (sorted, deduplicated).
export function mapBar(user) {
  const projects = [];

  if (user && Array.isArray(user.project_xp)) {
    for (const row of user.project_xp) {
      const amount = row?.amount;
      // Skip missing, non-numeric, or negative amounts.
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) continue;
      projects.push({ name: safeValue(projectName(row?.path)), xp: amount });
    }
  }

  projects.sort((a, b) => b.xp - a.xp);

  const seenNames = new Set();
  const unique = [];
  for (const project of projects) {
    if (seenNames.has(project.name)) continue;
    seenNames.add(project.name);
    unique.push(project);
  }

  return { projects: unique };
}