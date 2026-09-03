import { graphql } from './graphql.js';
import { byteToKB, projectName, safeValue } from '../utils/format.js';

const PROFILE_QUERY = `
{
  user {
    login
    avatarUrl
    auditRatio
    xp: transactions_aggregate(
      where: { type: { _eq: "xp" }, event: { object: { type: { _eq: "module" } } } }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    level: transactions_aggregate(
      where: { type: { _eq: "level" }, event: { object: { type: { _eq: "module" } } } }
    ) {
      aggregate {
        max {
          amount
        }
      }
    }
    cohort_number: events(where: { cohorts: { labelName: { _is_null: false } } }) {
      cohorts {
        labelName
      }
    }
    succeeded_audits: audits_aggregate(where: { closureType: { _eq: succeeded } }) {
      aggregate {
        count
      }
    }
    failed_audits: audits_aggregate(where: { closureType: { _eq: failed } }) {
      aggregate {
        count
      }
    }
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
  let user = null;
  if (result.data && result.data.user) {
    user = result.data.user[0];
  }
  return { ok: true, user: user };
}

function aggregateValue(aggregateNode, key) {
  if (!aggregateNode || !aggregateNode.aggregate) return undefined;
  const holder = aggregateNode.aggregate[key];
  const amount = holder && holder.amount;
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return amount;
  }
  return undefined;
}

function aggregateCount(aggregateNode) {
  if (!aggregateNode || !aggregateNode.aggregate) return undefined;
  const count = aggregateNode.aggregate.count;
  if (typeof count === 'number' && Number.isFinite(count)) {
    return count;
  }
  return undefined;
}

function firstCohortLabel(cohortNumber) {
  if (!Array.isArray(cohortNumber)) return undefined;
  for (let i = 0; i < cohortNumber.length; i++) {
    const event = cohortNumber[i];
    if (event && Array.isArray(event.cohorts)) {
      for (let j = 0; j < event.cohorts.length; j++) {
        const cohort = event.cohorts[j];
        if (cohort && typeof cohort.labelName === 'string' && cohort.labelName.trim() !== '') {
          return cohort.labelName;
        }
      }
    }
  }
  return undefined;
}

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
      auditRatio = Math.floor(ratio * 100) / 100;
    }
    const xpKB = byteToKB(aggregateValue(user.xp, 'sum'));
    if (xpKB !== undefined) {
      totalXp = Math.round(xpKB);
    }
  }

  return {
    username: username,
    photo: photo,
    cohort: cohort,
    totalXp: totalXp,
    level: level,
    auditRatio: auditRatio
  };
}

export function mapDonut(user) {
  let succeeded = undefined;
  let failed = undefined;
  if (user) {
    succeeded = aggregateCount(user.succeeded_audits);
    failed = aggregateCount(user.failed_audits);
  }

  const hasData = succeeded !== undefined || failed !== undefined;
  const segments = [];
  if (hasData) {
    segments.push({ label: 'succeeded', value: succeeded || 0 });
    segments.push({ label: 'failed', value: failed || 0 });
  }

  return {
    succeededCount: safeValue(succeeded),
    failedCount: safeValue(failed),
    segments: segments
  };
}

export function mapBar(user) {
  const projects = [];
  if (user && Array.isArray(user.project_xp)) {
    for (let i = 0; i < user.project_xp.length; i++) {
      const row = user.project_xp[i];
      const amount = row && row.amount;
      if (typeof amount !== 'number' || !Number.isFinite(amount)) continue;
      if (amount < 0) continue;
      const xpKB = Math.floor((amount / 1000) * 10) / 10;
      const name = projectName(row && row.path);
      projects.push({ name: safeValue(name), xpKB: xpKB });
    }
  }
  projects.sort(function (a, b) {
    return b.xpKB - a.xpKB;
  });

  const unique = [];
  const seen = {};
  for (let i = 0; i < projects.length; i++) {
    const name = projects[i].name;
    if (seen[name]) continue;
    seen[name] = true;
    unique.push(projects[i]);
  }
  return { projects: unique };
}