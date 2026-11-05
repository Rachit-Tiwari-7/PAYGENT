-- ============================================================================
-- PAYGENT - COMPLETE SUPABASE SETUP (ONE FILE)
-- ============================================================================
-- WARNING: this drops all Paygent tables and their data before recreating them.
-- Do not run it against a database that already holds data you want to keep.
--
-- What this does:
--   1. Drops and recreates every Paygent table (safe to re-run from scratch).
--   2. Creates Supabase Auth profile table + auto-create trigger.
--   3. Enables Row Level Security (public read, owner writes on projects).
--   4. Seeds agents, companies, skills, integrations.
--   5. Seeds a full demo project IF an auth user already exists.
--   6. Prints a verification summary.
--
-- How to use:
--   Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--
-- Free-tier friendly:
--   - No extra extensions, no cron jobs, no storage buckets.
--   - ~24 small tables, lean indexes, JSONB where it keeps things simple.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. CLEAN SLATE
-- ----------------------------------------------------------------------------
drop view if exists public.v_ledger_totals;
drop view if exists public.v_project_summary;
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists
  public.automation_events,
  public.integrations,
  public.agent_messages,
  public.reputation_events,
  public.payment_events,
  public.ledger_entries,
  public.transactions,
  public.disputes,
  public.evaluations,
  public.deliverables,
  public.contract_events,
  public.contracts,
  public.negotiations,
  public.bids,
  public.task_dependencies,
  public.tasks,
  public.projects,
  public.company_members,
  public.agent_versions,
  public.agent_memories,
  public.agent_skills,
  public.agents,
  public.companies,
  public.profiles
cascade;

-- ----------------------------------------------------------------------------
-- 1. HELPERS
-- ----------------------------------------------------------------------------

-- Readable text IDs, e.g. prj_4f8a2c9b1e7d3a60
create or replace function public.new_id(prefix text)
returns text
language sql
volatile
as $$
  select prefix || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
$$;

-- Keep updated_at fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. AUTH PROFILES
-- ----------------------------------------------------------------------------
-- profiles.id is the same UUID as auth.users.id, so policies can simply use
-- auth.uid() = profiles.id (and auth.uid() = projects.user_id).
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique,
  full_name   text,
  role        text not null default 'CLIENT'
                check (role in ('CLIENT', 'DEVELOPER', 'AUDITOR', 'ADMIN')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(coalesce(new.email, 'user@paygent.local'), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    -- Only self-service roles are allowed from signup metadata.
    -- ADMIN / AUDITOR must be granted manually in SQL.
    case
      when new.raw_user_meta_data->>'role' in ('CLIENT', 'DEVELOPER')
        then new.raw_user_meta_data->>'role'
      else 'CLIENT'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for auth users that already exist. This makes re-running
-- the script safe: your login accounts are not orphaned.
insert into public.profiles (id, email, full_name, avatar_url, role)
select
  u.id,
  u.email,
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    nullif(u.raw_user_meta_data->>'name', ''),
    split_part(coalesce(u.email, 'user@paygent.local'), '@', 1)
  ),
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ),
  case
    when u.raw_user_meta_data->>'role' in ('CLIENT', 'DEVELOPER')
      then u.raw_user_meta_data->>'role'
    else 'CLIENT'
  end
from auth.users u
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. COMPANIES
-- ----------------------------------------------------------------------------
create table public.companies (
  id                  text primary key default public.new_id('cmp'),
  slug                text unique not null,
  name                text not null,
  avatar              text not null default 'CO',
  tagline             text,
  description         text,
  ceo_agent_id        text,  -- FK added after agents exists
  total_revenue       numeric(14,2) not null default 0 check (total_revenue >= 0),
  completed_projects  integer not null default 0 check (completed_projects >= 0),
  reputation_score    numeric(5,2) not null default 95 check (reputation_score between 0 and 100),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_companies_updated
before update on public.companies
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. AGENTS
-- ----------------------------------------------------------------------------
create table public.agents (
  id                     text primary key default public.new_id('agt'),
  slug                   text unique not null,
  name                   text not null,
  avatar                 text not null default 'AG',
  headline               text,
  description            text,
  category               text not null default 'Research'
                           check (category in ('Research', 'Finance', 'Engineering', 'Design', 'QA', 'Management')),
  pricing_model          text not null default 'FIXED_PER_TASK'
                           check (pricing_model in ('FIXED_PER_TASK', 'HOURLY', 'REVENUE_SHARE')),
  hourly_rate            numeric(10,2) not null default 20 check (hourly_rate >= 0),
  base_price             numeric(10,2) not null default 25 check (base_price >= 0),
  availability           text not null default 'AVAILABLE'
                           check (availability in ('AVAILABLE', 'BUSY', 'OFFLINE')),
  reputation_score       numeric(5,2) not null default 95 check (reputation_score between 0 and 100),
  success_rate           numeric(5,2) not null default 98 check (success_rate between 0 and 100),
  completed_projects     integer not null default 0 check (completed_projects >= 0),
  total_earnings         numeric(14,2) not null default 0 check (total_earnings >= 0),
  avg_delivery_time_hours numeric(6,2) not null default 1.5 check (avg_delivery_time_hours >= 0),
  is_autonomous          boolean not null default true,
  system_prompt          text,
  capabilities           jsonb not null default '[]'::jsonb,
  tools                  jsonb not null default '[]'::jsonb,
  company_id             text references public.companies(id) on delete set null,
  is_ceo                 boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.companies
  add constraint companies_ceo_agent_fk
  foreign key (ceo_agent_id) references public.agents(id) on delete set null;

create index idx_agents_category     on public.agents(category);
create index idx_agents_availability on public.agents(availability);
create index idx_agents_company      on public.agents(company_id);

create trigger trg_agents_updated
before update on public.agents
for each row execute function public.set_updated_at();

-- 4.1 Agent skills
create table public.agent_skills (
  id           text primary key default public.new_id('skl'),
  agent_id     text not null references public.agents(id) on delete cascade,
  name         text not null,
  category     text,
  level        integer not null default 5 check (level between 1 and 10),
  endorsements integer not null default 0 check (endorsements >= 0),
  unique (agent_id, name)
);

create index idx_agent_skills_agent on public.agent_skills(agent_id);

-- 4.2 Agent memories (episodic / semantic / procedural / contract)
create table public.agent_memories (
  id          text primary key default public.new_id('mem'),
  agent_id    text not null references public.agents(id) on delete cascade,
  key         text not null,
  content     text not null,
  category    text not null default 'semantic'
                check (category in ('episodic', 'semantic', 'procedural', 'contract')),
  importance  numeric(3,2) not null default 0.5 check (importance between 0 and 1),
  created_at  timestamptz not null default now()
);

create index idx_agent_memories_agent on public.agent_memories(agent_id, category);

-- 4.3 Agent versions
create table public.agent_versions (
  id             text primary key default public.new_id('ver'),
  agent_id       text not null references public.agents(id) on delete cascade,
  version_number text not null default 'v1.0.0',
  system_prompt  text,
  changelog      text,
  created_at     timestamptz not null default now()
);

create index idx_agent_versions_agent on public.agent_versions(agent_id);

-- 4.4 Company members
create table public.company_members (
  id           text primary key default public.new_id('cpm'),
  company_id   text not null references public.companies(id) on delete cascade,
  agent_id     text not null references public.agents(id) on delete cascade,
  role         text not null default 'MEMBER',
  department   text,
  equity_share numeric(5,2) not null default 0 check (equity_share between 0 and 100),
  joined_at    timestamptz not null default now(),
  unique (company_id, agent_id)
);

create index idx_company_members_company on public.company_members(company_id);

-- ----------------------------------------------------------------------------
-- 5. PROJECTS + TASKS
-- ----------------------------------------------------------------------------
create table public.projects (
  id          text primary key default public.new_id('prj'),
  title       text not null,
  description text,
  category    text not null default 'Market Research',
  budget      numeric(12,2) not null check (budget > 0),
  spent       numeric(12,2) not null default 0 check (spent >= 0),
  currency    text not null default 'USD' check (char_length(currency) = 3),
  status      text not null default 'OPEN'
                check (status in ('DRAFT', 'OPEN', 'BIDDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DISPUTED', 'CANCELLED')),
  deadline    timestamptz,
  user_id     uuid references public.profiles(id) on delete cascade,
  company_id  text references public.companies(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_projects_user    on public.projects(user_id);
create index idx_projects_status  on public.projects(status);
create index idx_projects_created on public.projects(created_at desc);

create trigger trg_projects_updated
before update on public.projects
for each row execute function public.set_updated_at();

create table public.tasks (
  id                text primary key default public.new_id('tsk'),
  project_id        text not null references public.projects(id) on delete cascade,
  title             text not null,
  description       text,
  status            text not null default 'PENDING'
                      check (status in ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  budget            numeric(10,2) not null default 0 check (budget >= 0),
  allocated_amount  numeric(10,2) not null default 0 check (allocated_amount >= 0),
  assigned_agent_id text references public.agents(id) on delete set null,
  order_index       integer not null default 0,
  estimated_hours   numeric(6,2) not null default 1 check (estimated_hours >= 0),
  start_date        timestamptz,
  end_date          timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_agent   on public.tasks(assigned_agent_id);

create trigger trg_tasks_updated
before update on public.tasks
for each row execute function public.set_updated_at();

create table public.task_dependencies (
  id                 text primary key default public.new_id('dep'),
  task_id            text not null references public.tasks(id) on delete cascade,
  depends_on_task_id text not null references public.tasks(id) on delete cascade,
  unique (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

-- ----------------------------------------------------------------------------
-- 6. BIDS + NEGOTIATIONS
-- ----------------------------------------------------------------------------
create table public.bids (
  id                  text primary key default public.new_id('bid'),
  project_id          text not null references public.projects(id) on delete cascade,
  agent_id            text not null references public.agents(id) on delete cascade,
  proposed_price      numeric(10,2) not null check (proposed_price >= 0),
  estimated_hours     numeric(6,2) not null default 1 check (estimated_hours >= 0),
  confidence_score    numeric(4,3) not null default 0.9 check (confidence_score between 0 and 1),
  proposal            text,
  capabilities        jsonb not null default '[]'::jsonb,
  deliverables_summary text,
  status              text not null default 'SUBMITTED'
                        check (status in ('SUBMITTED', 'SHORTLISTED', 'COUNTEROFFERED', 'ACCEPTED', 'REJECTED')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_bids_project_status on public.bids(project_id, status);
create index idx_bids_agent          on public.bids(agent_id);

create trigger trg_bids_updated
before update on public.bids
for each row execute function public.set_updated_at();

create table public.negotiations (
  id             text primary key default public.new_id('neg'),
  bid_id         text not null references public.bids(id) on delete cascade,
  agent_id       text not null references public.agents(id) on delete cascade,
  round          integer not null default 1 check (round > 0),
  original_price numeric(10,2) not null check (original_price >= 0),
  offered_price  numeric(10,2) not null check (offered_price >= 0),
  rationale      text,
  agent_message  text,
  status         text not null default 'OPEN'
                   check (status in ('OPEN', 'COUNTER_SENT', 'ACCEPTED', 'DECLINED')),
  created_at     timestamptz not null default now()
);

create index idx_negotiations_bid on public.negotiations(bid_id);

-- ----------------------------------------------------------------------------
-- 7. CONTRACTS + EVENTS
-- ----------------------------------------------------------------------------
create table public.contracts (
  id                 text primary key default public.new_id('ctr'),
  project_id         text not null references public.projects(id) on delete cascade,
  lead_agent_id      text not null references public.agents(id) on delete restrict,
  parent_contract_id text references public.contracts(id) on delete set null,
  contract_type      text not null default 'PRIMARY'
                       check (contract_type in ('PRIMARY', 'SUBCONTRACT')),
  title              text not null,
  terms              text,
  agreed_price       numeric(12,2) not null default 0 check (agreed_price >= 0),
  status             text not null default 'ACTIVE'
                       check (status in ('PENDING', 'ACTIVE', 'DELIVERED', 'EVALUATING', 'SETTLED', 'DISPUTED', 'CANCELLED')),
  platform_fee       numeric(10,2) not null default 0 check (platform_fee >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_contracts_project on public.contracts(project_id);
create index idx_contracts_lead    on public.contracts(lead_agent_id);
create index idx_contracts_parent  on public.contracts(parent_contract_id);

create trigger trg_contracts_updated
before update on public.contracts
for each row execute function public.set_updated_at();

create table public.contract_events (
  id          text primary key default public.new_id('cev'),
  contract_id text not null references public.contracts(id) on delete cascade,
  event_type  text not null,
  description text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_contract_events_contract on public.contract_events(contract_id);

-- ----------------------------------------------------------------------------
-- 8. DELIVERABLES + EVALUATIONS + DISPUTES
-- ----------------------------------------------------------------------------
create table public.deliverables (
  id               text primary key default public.new_id('del'),
  project_id       text not null references public.projects(id) on delete cascade,
  contract_id      text references public.contracts(id) on delete set null,
  task_id          text references public.tasks(id) on delete set null,
  agent_id         text not null references public.agents(id) on delete restrict,
  title            text not null,
  content_markdown text,
  source_citations jsonb not null default '[]'::jsonb,
  status           text not null default 'SUBMITTED'
                     check (status in ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_deliverables_project  on public.deliverables(project_id);
create index idx_deliverables_contract on public.deliverables(contract_id);
create index idx_deliverables_agent    on public.deliverables(agent_id);

create trigger trg_deliverables_updated
before update on public.deliverables
for each row execute function public.set_updated_at();

create table public.evaluations (
  id                   text primary key default public.new_id('eva'),
  deliverable_id       text not null references public.deliverables(id) on delete cascade,
  evaluator_model      text not null default 'QualityGuard (AI Courtroom)',
  technical_score      numeric(5,2) not null check (technical_score between 0 and 100),
  completeness_score   numeric(5,2) not null check (completeness_score between 0 and 100),
  quality_score        numeric(5,2) not null check (quality_score between 0 and 100),
  compliance_score     numeric(5,2) not null check (compliance_score between 0 and 100),
  evidence_score       numeric(5,2) not null check (evidence_score between 0 and 100),
  overall_score        numeric(5,2) not null check (overall_score between 0 and 100),
  verdict              text not null
                         check (verdict in ('APPROVED', 'REVISION_REQUIRED', 'PARTIALLY_ACCEPTED', 'REJECTED')),
  critique_summary     text,
  detailed_feedback    jsonb,
  created_at           timestamptz not null default now()
);

create index idx_evaluations_deliverable on public.evaluations(deliverable_id);

create table public.disputes (
  id                  text primary key default public.new_id('dsp'),
  contract_id         text not null references public.contracts(id) on delete cascade,
  raised_by_user_id   uuid references public.profiles(id) on delete set null,
  reason              text not null,
  status              text not null default 'OPEN'
                        check (status in ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REFUNDED')),
  human_decision      text,
  resolved_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_disputes_contract on public.disputes(contract_id);

-- ----------------------------------------------------------------------------
-- 9. PAYMENTS + DOUBLE-ENTRY LEDGER
-- ----------------------------------------------------------------------------
create table public.transactions (
  id               text primary key default public.new_id('txn'),
  project_id       text not null references public.projects(id) on delete cascade,
  user_id          uuid references public.profiles(id) on delete set null,
  amount           numeric(12,2) not null check (amount > 0),
  currency         text not null default 'USD' check (char_length(currency) = 3),
  type             text not null
                     check (type in ('PAYPAL_CHECKOUT', 'ESCROW_LOCK', 'AGENT_PAYOUT', 'SUBCONTRACT_TRANSFER', 'PLATFORM_FEE')),
  status           text not null default 'PENDING'
                     check (status in ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  paypal_order_id  text,
  paypal_capture_id text,
  payment_method   text not null default 'PAYPAL_SANDBOX',
  created_at       timestamptz not null default now()
);

create index idx_transactions_project on public.transactions(project_id);
create index idx_transactions_user    on public.transactions(user_id);
create unique index idx_transactions_paypal_order
  on public.transactions(paypal_order_id)
  where paypal_order_id is not null;

create table public.ledger_entries (
  id           text primary key default public.new_id('ldg'),
  project_id   text not null references public.projects(id) on delete cascade,
  account_type text not null
                 check (account_type in ('CUSTOMER_FUNDS', 'AGENT_WALLET', 'COMPANY_TREASURY', 'PLATFORM_REVENUE', 'ESCROW_HOLDING')),
  account_id   text not null,
  account_name text not null,
  entry_type   text not null check (entry_type in ('DEBIT', 'CREDIT')),
  amount       numeric(12,2) not null check (amount > 0),
  currency     text not null default 'USD' check (char_length(currency) = 3),
  description  text,
  reference_id text not null,
  created_at   timestamptz not null default now()
);

create index idx_ledger_project   on public.ledger_entries(project_id);
create index idx_ledger_account   on public.ledger_entries(account_id);
create index idx_ledger_reference on public.ledger_entries(reference_id);

create table public.payment_events (
  id             text primary key default public.new_id('pev'),
  transaction_id text not null references public.transactions(id) on delete cascade,
  event_type     text not null,
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index idx_payment_events_transaction on public.payment_events(transaction_id);

-- ----------------------------------------------------------------------------
-- 10. REPUTATION + AGENT MESSAGES
-- ----------------------------------------------------------------------------
create table public.reputation_events (
  id             text primary key default public.new_id('rep'),
  agent_id       text not null references public.agents(id) on delete cascade,
  metric         text not null
                   check (metric in ('QUALITY_SCORE', 'DELIVERY_TIMELINESS', 'REVISION_RATE', 'EARNINGS')),
  delta          numeric(6,2) not null default 0,
  previous_value numeric(6,2) not null default 0,
  new_value      numeric(6,2) not null default 0,
  reason         text,
  verified       boolean not null default true,
  created_at     timestamptz not null default now()
);

create index idx_reputation_agent on public.reputation_events(agent_id);

create table public.agent_messages (
  id            text primary key default public.new_id('msg'),
  project_id    text not null references public.projects(id) on delete cascade,
  from_agent_id text not null references public.agents(id) on delete cascade,
  to_agent_id   text references public.agents(id) on delete set null,
  message_type  text not null
                  check (message_type in ('BID', 'NEGOTIATION', 'SUBCONTRACT_REQUEST', 'DELEGATION', 'DELIVERABLE_SHARE', 'THOUGHT')),
  content       text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_agent_messages_project on public.agent_messages(project_id);

-- ----------------------------------------------------------------------------
-- 11. INTEGRATIONS + AUTOMATION
-- ----------------------------------------------------------------------------
create table public.integrations (
  id           text primary key default public.new_id('int'),
  sponsor      text unique not null,
  name         text not null,
  category     text,
  status       text not null default 'ACTIVE'
                 check (status in ('ACTIVE', 'CONFIGURED', 'SIMULATED', 'DISCONNECTED')),
  is_mock      boolean not null default false,
  config_json  jsonb not null default '{}'::jsonb,
  last_ping_at timestamptz,
  updated_at   timestamptz not null default now()
);

create trigger trg_integrations_updated
before update on public.integrations
for each row execute function public.set_updated_at();

create table public.automation_events (
  id         text primary key default public.new_id('aut'),
  provider   text not null,
  event_name text not null,
  status     text not null check (status in ('SUCCESS', 'FAILED', 'PENDING')),
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_automation_provider on public.automation_events(provider, created_at desc);

-- ----------------------------------------------------------------------------
-- 12. HANDY VIEWS
-- ----------------------------------------------------------------------------
create or replace view public.v_ledger_totals
with (security_invoker = true) as
select
  project_id,
  currency,
  coalesce(sum(case when entry_type = 'DEBIT' then amount end), 0)          as total_debits,
  coalesce(sum(case when entry_type = 'CREDIT' then amount end), 0)         as total_credits,
  coalesce(sum(case when entry_type = 'DEBIT' then amount else -amount end), 0) as balance
from public.ledger_entries
group by project_id, currency;

create or replace view public.v_project_summary
with (security_invoker = true) as
select
  p.id,
  p.title,
  p.status,
  p.currency,
  p.budget,
  p.spent,
  p.user_id,
  (select count(*) from public.tasks        t where t.project_id = p.id) as task_count,
  (select count(*) from public.bids         b where b.project_id = p.id) as bid_count,
  (select count(*) from public.contracts    c where c.project_id = p.id) as contract_count,
  (select count(*) from public.deliverables d where d.project_id = p.id) as deliverable_count,
  p.created_at
from public.projects p;

-- ----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Marketplace data is readable by anyone (anon + logged-in).
-- Writes go through the service-role key from server code.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'companies', 'agents', 'agent_skills', 'agent_memories', 'agent_versions',
      'company_members', 'projects', 'tasks', 'task_dependencies', 'bids',
      'negotiations', 'contracts', 'contract_events', 'deliverables', 'evaluations',
      'disputes', 'transactions', 'ledger_entries', 'payment_events',
      'reputation_events', 'agent_messages', 'integrations', 'automation_events'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public_read" on public.%I', t);
    execute format(
      'create policy "public_read" on public.%I for select to anon, authenticated using (true)',
      t
    );
  end loop;
end;
$$;

-- Profiles: only signed-in users can read; users can edit their own row.
alter table public.profiles enable row level security;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Projects: anyone can browse, owners can create/edit/delete their own.
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 14. GRANTS
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
-- Column-level grant: users can edit their name/avatar but NOT role or email.
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant all on all tables in schema public to service_role;
grant select on public.v_ledger_totals to anon, authenticated;
grant select on public.v_project_summary to anon, authenticated;

alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant all on tables to service_role;

-- ----------------------------------------------------------------------------
-- 15. SEED - COMPANIES
-- ----------------------------------------------------------------------------
insert into public.companies
  (id, slug, name, avatar, tagline, description, total_revenue, completed_projects, reputation_score)
values
  ('cmp_apex_intelligence', 'apex-intelligence', 'Apex Intelligence Corp', 'AI',
   'Autonomous Strategic Research & Financial Synthesis',
   'A premier autonomous agent enterprise specializing in market diligence, unit economics modeling, and competitive intelligence with verifiable audit records.',
   2450.00, 14, 98.40),
  ('cmp_swarmworks', 'swarmworks-ltd', 'SwarmWorks Autonomous Ltd', 'SW',
   'Distributed Engineering & Systems Verification Swarm',
   'An orchestrated conglomerate of code synthesis, security auditing, and cloud infrastructure agents executing parallel engineering deliverables.',
   3890.00, 21, 97.80);

-- ----------------------------------------------------------------------------
-- 16. SEED - AGENTS
-- ----------------------------------------------------------------------------
insert into public.agents
  (id, slug, name, avatar, headline, description, category, pricing_model,
   hourly_rate, base_price, availability, reputation_score, success_rate,
   completed_projects, total_earnings, avg_delivery_time_hours, is_autonomous,
   company_id, is_ceo, system_prompt, capabilities, tools)
values
  ('agt_marketmind', 'marketmind', 'MarketMind', 'MM',
   'Autonomous Market Research Lead & Competitive Strategist',
   'Specializes in multi-vector market sizing, competitor teardowns, target persona mapping, and commercial synthesis. Directs research teams and negotiates subcontracts autonomously.',
   'Research', 'FIXED_PER_TASK', 35.00, 22.00, 'AVAILABLE', 98.70, 99.20,
   28, 840.00, 1.20, true, 'cmp_apex_intelligence', true,
   'You are MarketMind, an autonomous executive research agent. You evaluate market opportunities, formulate tactical research frameworks, negotiate contracts, and hire specialist subcontractors when detailed data aggregation is required.',
   '["Market Sizing (TAM/SAM/SOM)", "Competitor SWOT Matrix", "Buyer Persona Synthesis", "Autonomous Subcontracting"]'::jsonb,
   '["ElasticSearch", "KernelBrowser", "Channel3Commerce", "FinancialLedger"]'::jsonb),

  ('agt_researchbot', 'researchbot', 'ResearchBot', 'RB',
   'Deep Web Investigator & Citation Specialist',
   'Rapid academic, industry, and web synthesis agent. Performs controlled cloud-browser investigations, source verification, and structured summary creation.',
   'Research', 'FIXED_PER_TASK', 25.00, 25.00, 'AVAILABLE', 95.40, 97.50,
   19, 475.00, 0.80, true, 'cmp_apex_intelligence', false,
   'You are ResearchBot, an autonomous research operative. You scan open-source intelligence, verify citations with Kernel browser sandboxes, and synthesize unbiased empirical findings.',
   '["Web Scraping with Sandbox", "Academic Literature Synthesis", "Source Attribution & Citation", "Industry Trend Extraction"]'::jsonb,
   '["KernelBrowser", "ElasticSearch", "SemanticEmbedder"]'::jsonb),

  ('agt_datascout', 'datascout', 'DataScout', 'DS',
   'Dataset Scraper & Product Feature Extractor',
   'High-speed extraction agent connected to Channel3 for live e-commerce product discovery, competitor pricing grids, and structured schema compilation.',
   'Research', 'FIXED_PER_TASK', 15.00, 5.00, 'AVAILABLE', 97.10, 98.90,
   45, 225.00, 0.40, true, null, false,
   'You are DataScout, an agile data extraction specialist. You query Channel3 APIs for real commercial product benchmarks, extract structured JSON schemas, and serve high-throughput subcontract tasks.',
   '["Channel3 Product Discovery", "Competitor Pricing Extraction", "JSON Schema Transformation", "High-Speed Subcontract Delivery"]'::jsonb,
   '["Channel3Commerce", "RestApiCaller", "DataNormalizer"]'::jsonb),

  ('agt_finanalyst', 'finanalyst', 'FinAnalyst', 'FA',
   'Autonomous Financial Modeler & Unit Economics Auditor',
   'Produces audit-grade financial forecasts, pro forma P&L projections, break-even models, and PayPal transaction reconciliations with double-entry precision.',
   'Finance', 'FIXED_PER_TASK', 40.00, 20.00, 'AVAILABLE', 99.10, 99.50,
   32, 640.00, 1.00, true, 'cmp_apex_intelligence', false,
   'You are FinAnalyst, an autonomous financial engine. You compute strict cash-flow tables, unit economics (CAC, LTV, payback period), and verify ledger balances.',
   '["Unit Economics Modeling", "Pro Forma Financial Statements", "Burn Rate Projections", "Double-Entry Ledger Audit"]'::jsonb,
   '["FinancialLedger", "AgGridRenderer", "PayPalAuditLog"]'::jsonb),

  ('agt_presentationai', 'presentationai', 'PresentationAI', 'PA',
   'Autonomous Executive Slide Deck & Narrative Architect',
   'Transforms dense analytical findings and financial tables into presentation outlines, slide decks, and visual executive briefs.',
   'Design', 'FIXED_PER_TASK', 30.00, 15.00, 'AVAILABLE', 96.80, 97.80,
   24, 360.00, 0.90, true, null, false,
   'You are PresentationAI, a strategic presentation designer. You construct persuasive venture slide decks, executive summaries, and visual communication frameworks.',
   '["Pitch Deck Architecture", "Executive Slide Structuring", "Data Visualization Layouts", "Narrative Storyboarding"]'::jsonb,
   '["MarkdownSlideEngine", "MermaidVisualizer", "DesignSystem"]'::jsonb),

  ('agt_codeforge', 'codeforge', 'CodeForge', 'CF',
   'Principal Systems Architect & API Integration Agent',
   'Generates robust TypeScript adapters, OpenAPI specs via APIMatic, verifies Postman automated test suites, and provisions Render workflow configurations.',
   'Engineering', 'HOURLY', 50.00, 35.00, 'AVAILABLE', 98.90, 99.10,
   37, 1295.00, 1.40, true, 'cmp_swarmworks', true,
   'You are CodeForge, CEO of SwarmWorks. You construct resilient distributed architectures, generate OpenAPI and APIMatic specifications, and orchestrate engineering swarms.',
   '["APIMatic API Modeling", "Postman Test Automation", "Render Workflow Blueprinting", "Full-Stack TypeScript"]'::jsonb,
   '["APIMaticContext", "PostmanRunner", "RenderOrchestrator", "AstropodsPodManager"]'::jsonb),

  ('agt_qualityguard', 'qualityguard', 'QualityGuard', 'QG',
   'AI Courtroom Chief Magistrate & Quality Auditor',
   'Independent multi-perspective deliverable evaluator. Scores deliverables across 5 dimensions: Correctness, Completeness, Quality, Contract Compliance, and Evidence Quality.',
   'QA', 'FIXED_PER_TASK', 30.00, 10.00, 'AVAILABLE', 99.90, 100.00,
   68, 680.00, 0.30, true, null, false,
   'You are QualityGuard, the official Paygent AI Courtroom judge. You provide impartial, rigorous assessments of agent deliverables. You never release funds without passing scores of 85 or more across all 5 verification vectors.',
   '["5-Vector Deliverable Scoring", "Fact Checking & Hallucination Defense", "Contractual Compliance Audit", "Impartial Dispute Arbitration"]'::jsonb,
   '["AIJudicialEngine", "SourceVerificationScanner", "ContractComplianceChecker"]'::jsonb);

update public.companies set ceo_agent_id = 'agt_marketmind' where id = 'cmp_apex_intelligence';
update public.companies set ceo_agent_id = 'agt_codeforge'  where id = 'cmp_swarmworks';

-- ----------------------------------------------------------------------------
-- 17. SEED - SKILLS / MEMORIES / VERSIONS / COMPANY MEMBERS
-- ----------------------------------------------------------------------------
insert into public.agent_skills (agent_id, name, category, level, endorsements) values
  ('agt_marketmind', 'Competitive Analysis', 'Strategy', 10, 34),
  ('agt_marketmind', 'Market Sizing', 'Economics', 9, 29),
  ('agt_marketmind', 'Executive Synthesis', 'Writing', 9, 31),
  ('agt_marketmind', 'Subcontract Management', 'Operations', 8, 18),
  ('agt_researchbot', 'Source Citation', 'Research', 10, 27),
  ('agt_researchbot', 'Deep Web Scraping', 'Data', 9, 24),
  ('agt_researchbot', 'Fact Verification', 'Audit', 9, 22),
  ('agt_datascout', 'Product Intelligence', 'Commerce', 10, 42),
  ('agt_datascout', 'JSON Data Modeling', 'Engineering', 9, 38),
  ('agt_datascout', 'Subcontract Turnaround', 'Operations', 10, 40),
  ('agt_finanalyst', 'Financial Forecasting', 'Finance', 10, 36),
  ('agt_finanalyst', 'Unit Economics', 'Finance', 10, 39),
  ('agt_finanalyst', 'Ledger Reconciliation', 'Accounting', 9, 30),
  ('agt_presentationai', 'Pitch Deck Design', 'Design', 9, 28),
  ('agt_presentationai', 'Executive Storytelling', 'Content', 10, 33),
  ('agt_codeforge', 'API Architecture', 'Engineering', 10, 44),
  ('agt_codeforge', 'Postman Automation', 'Testing', 10, 38),
  ('agt_codeforge', 'Cloud Infrastructure', 'DevOps', 9, 35),
  ('agt_qualityguard', 'Audit & Evaluation', 'QA', 10, 55),
  ('agt_qualityguard', 'Fact Verification', 'Audit', 10, 50),
  ('agt_qualityguard', 'Compliance Verification', 'Legal', 10, 48);

insert into public.agent_memories (agent_id, key, content, category, importance) values
  ('agt_marketmind', 'pricing_strategy', 'Negotiate aggressively for project lead roles; target 15-20% discount if offered guaranteed prompt payment via PayPal escrow.', 'procedural', 0.90),
  ('agt_marketmind', 'preferred_subcontractor', 'DataScout consistently delivers clean structured data within 10 minutes for $5 fixed subcontracts.', 'episodic', 0.85),
  ('agt_datascout', 'subcontract_sla', 'Maintain sub-15 minute response time on micro-tasks ($5-$10) to maintain a 99% rating in the autonomous economy.', 'procedural', 0.90),
  ('agt_finanalyst', 'ledger_rules', 'Debits must always equal credits. Escrow funds must remain segregated until quality evaluation approval is granted.', 'procedural', 1.00),
  ('agt_qualityguard', 'judicial_standard', 'A deliverable must contain verifiable metrics and concrete source citations to achieve an Approved verdict.', 'procedural', 1.00);

insert into public.agent_versions (agent_id, version_number, system_prompt, changelog) values
  ('agt_marketmind', 'v1.2.0', 'Autonomous negotiation limits updated.', 'Added Channel3 commerce integration');

insert into public.company_members (company_id, agent_id, role, department, equity_share) values
  ('cmp_apex_intelligence', 'agt_marketmind', 'CEO', 'Executive', 40.00),
  ('cmp_apex_intelligence', 'agt_researchbot', 'RESEARCH_DIRECTOR', 'Research', 30.00),
  ('cmp_apex_intelligence', 'agt_finanalyst', 'FINANCE_DIRECTOR', 'Finance', 30.00),
  ('cmp_swarmworks', 'agt_codeforge', 'CEO', 'Engineering', 100.00);

-- ----------------------------------------------------------------------------
-- 18. SEED - INTEGRATIONS
-- ----------------------------------------------------------------------------
insert into public.integrations (sponsor, name, category, status, is_mock, config_json, last_ping_at) values
  ('PAYPAL', 'PayPal Developer Platform', 'Payments', 'ACTIVE', false,
   '{"environment":"sandbox","features":["Orders v2","Capture","Webhooks","Payouts"]}'::jsonb, now()),
  ('AG_GRID', 'AG Grid Enterprise', 'Data & Tables', 'ACTIVE', false,
   '{"features":["Sorting","Filtering","Aggregations","CSV Export"]}'::jsonb, now()),
  ('BRYNTUM', 'Bryntum Workforce Scheduler', 'Scheduling', 'ACTIVE', false,
   '{"features":["Gantt Timelines","Task Dependencies","Resource Allocation"]}'::jsonb, now()),
  ('APIMATIC', 'APIMatic Developer Experience', 'Dev Tools', 'ACTIVE', false,
   '{"features":["PayPal Context Plugin","OpenAPI Spec Generation"]}'::jsonb, now()),
  ('ASTROPODS', 'Astropods Agent Infrastructure', 'Agent Sandbox', 'ACTIVE', true,
   '{"features":["Agent Pod Isolation","Lifecycle Management"]}'::jsonb, now()),
  ('CHANNEL3', 'Channel3 Commerce Data', 'Commerce', 'ACTIVE', true,
   '{"features":["Product Discovery","Competitive Price Feeds"]}'::jsonb, now()),
  ('ELASTIC', 'Elasticsearch & Vector Search', 'Search', 'ACTIVE', true,
   '{"features":["Semantic Agent Discovery","Hybrid Search","Memory Indexing"]}'::jsonb, now()),
  ('KERNEL', 'Kernel Cloud Browser Sandbox', 'Browser', 'ACTIVE', true,
   '{"features":["Controlled Research","Domain Allowlists","Citation Screenshots"]}'::jsonb, now()),
  ('POSTMAN', 'Postman API Suite', 'API', 'ACTIVE', false,
   '{"features":["Collection v2.1","Automated Contract Tests"]}'::jsonb, now()),
  ('RENDER', 'Render Cloud & Workflows', 'Cloud', 'ACTIVE', false,
   '{"features":["render.yaml","Background Workers","Zero Downtime Deploy"]}'::jsonb, now()),
  ('ZAPIER', 'Zapier Business Automation', 'Automation', 'ACTIVE', true,
   '{"features":["Outbound Webhooks","CRM Sync","Email Notifications"]}'::jsonb, now());

-- ----------------------------------------------------------------------------
-- 19. OPTIONAL DEMO DATA
-- ----------------------------------------------------------------------------
-- Inserts a complete example project only if at least one auth user has signed
-- up (which creates a profiles row). Safe to skip on a fresh database.
do $$
declare
  v_user uuid;
begin
  select id into v_user
  from public.profiles
  order by created_at
  limit 1;

  if v_user is null then
    raise notice 'No auth user found - skipping demo project seed. Sign up, then re-run section 19 if you want it.';
    return;
  end if;

  insert into public.projects
    (id, title, description, category, budget, spent, currency, status, user_id, company_id)
  values
    ('prj_ref_fintech_market',
     'FinTech AI Agent Market Intelligence & Unit Economics Analysis',
     'Comprehensive competitive landscape mapping, autonomous pricing matrix, and 3-year cash flow projections for AI agent micro-transactions.',
     'Market Research', 100.00, 100.00, 'USD', 'COMPLETED', v_user, 'cmp_apex_intelligence');

  insert into public.tasks
    (id, project_id, title, description, status, budget, allocated_amount,
     assigned_agent_id, order_index, estimated_hours)
  values
    ('tsk_ref_01', 'prj_ref_fintech_market', 'Market Sizing & Competitor Discovery',
     'Analyze top 10 autonomous agent platforms and extract pricing models via Channel3.',
     'COMPLETED', 25.00, 18.00, 'agt_marketmind', 0, 1.00),
    ('tsk_ref_02', 'prj_ref_fintech_market', 'Channel3 E-Commerce Pricing Crawl',
     'Extract structured SKU pricing and feature matrices from targeted competitors.',
     'COMPLETED', 10.00, 5.00, 'agt_datascout', 1, 0.50);

  insert into public.task_dependencies (task_id, depends_on_task_id)
  values ('tsk_ref_02', 'tsk_ref_01');

  insert into public.bids
    (id, project_id, agent_id, proposed_price, estimated_hours, confidence_score,
     proposal, capabilities, deliverables_summary, status)
  values
    ('bid_ref_1', 'prj_ref_fintech_market', 'agt_researchbot', 25.00, 1.50, 0.940,
     'I will perform comprehensive web research and provide 15 verified citations on agent economics.',
     '["Web Scraping","Fact Verification","Trend Analysis"]'::jsonb,
     '10-page research synthesis with primary source links', 'SHORTLISTED'),
    ('bid_ref_2', 'prj_ref_fintech_market', 'agt_marketmind', 22.00, 1.20, 0.980,
     'Apex Intelligence offers end-to-end strategic synthesis with Channel3 commerce validation.',
     '["Market Sizing","Competitor SWOT","Subcontract Management"]'::jsonb,
     'Strategic research report plus subcontracted SKU dataset', 'ACCEPTED');

  insert into public.negotiations
    (id, bid_id, agent_id, round, original_price, offered_price, rationale,
     agent_message, status)
  values
    ('neg_ref_1', 'bid_ref_2', 'agt_marketmind', 1, 22.00, 18.00,
     'Orchestrator requested an 18% counteroffer in exchange for immediate PayPal sandbox settlement.',
     'MarketMind accepts $18.00 provided subcontracting authority for DataScout ($5.00) is granted.',
     'ACCEPTED');

  insert into public.contracts
    (id, project_id, lead_agent_id, contract_type, title, terms,
     agreed_price, status, platform_fee)
  values
    ('ctr_ref_primary', 'prj_ref_fintech_market', 'agt_marketmind', 'PRIMARY',
     'Primary Market Diligence Agreement',
     'Delivery of multi-page synthesized market report with unit economics and product data.',
     90.00, 'SETTLED', 10.00),
    ('ctr_ref_sub', 'prj_ref_fintech_market', 'agt_datascout', 'SUBCONTRACT',
     'Subcontract: Channel3 E-commerce Dataset Scrape',
     'Extraction of 50 competitor agent platform SKUs with price points.',
     5.00, 'SETTLED', 0.00);

  update public.contracts
  set parent_contract_id = 'ctr_ref_primary'
  where id = 'ctr_ref_sub';

  insert into public.contract_events
    (contract_id, event_type, description, created_at)
  values
    ('ctr_ref_primary', 'CONTRACT_SIGNED',
     'Primary contract signed between the client and MarketMind for $90.00 USD.',
     now() - interval '5 hours'),
    ('ctr_ref_primary', 'SUBCONTRACT_ISSUED',
     'MarketMind issued a $5.00 subcontract to DataScout for the Channel3 e-commerce crawl.',
     now() - interval '4 hours'),
    ('ctr_ref_primary', 'DELIVERABLE_SUBMITTED',
     'Synthesized report and dataset submitted to the AI Courtroom.',
     now() - interval '3 hours'),
    ('ctr_ref_primary', 'COURT_APPROVED',
     'QualityGuard approved the deliverable with a 94.6 score across 5 evaluation vectors.',
     now() - interval '2 hours'),
    ('ctr_ref_primary', 'PAYMENT_CAPTURED',
     'PayPal capture verified; funds transferred to the internal double-entry ledger.',
     now() - interval '1 hour');

  insert into public.deliverables
    (id, project_id, contract_id, task_id, agent_id, title, content_markdown,
     source_citations, status)
  values
    ('del_ref_report', 'prj_ref_fintech_market', 'ctr_ref_primary', 'tsk_ref_01',
     'agt_marketmind',
     'Executive Strategic Market Intelligence Report: Autonomous Agent Economy 2026',
     $md$# Executive Market Intelligence Report: Autonomous Agent Economy 2026

## 1. Executive Summary
The total addressable market for autonomous agent micro-transactions is projected to reach $14.2B by 2028.

## 2. Competitive Landscape
- Category A (Individual Assistants): high saturation, low commercial autonomy.
- Category B (Paygent Autonomous Economy): first-to-market protocol for agent-to-agent bidding, subcontracting, and PayPal sandbox settlement.

## 3. Financial Projections
Average contract size: $42.50. Subcontract depth: 1.8 levels. Margin per agent company: 64%.

Verified by Apex Intelligence Corp and Channel3 Data.$md$,
     '["Channel3 Commerce API", "Kernel Sandbox Query #8129", "SEC EDGAR AI filings"]'::jsonb,
     'APPROVED');

  insert into public.evaluations
    (deliverable_id, evaluator_model, technical_score, completeness_score,
     quality_score, compliance_score, evidence_score, overall_score, verdict,
     critique_summary, detailed_feedback)
  values
    ('del_ref_report', 'QualityGuard (Autonomous AI Courtroom)', 95.00, 93.00,
     96.00, 98.00, 91.00, 94.60, 'APPROVED',
     'Deliverable satisfies all contractual clauses. Clear empirical citations from Channel3 and rigorous unit economics breakdown.',
     '{"strengths":["Strong quantitative backing","Explicit subcontractor attribution","Zero hallucinated sources"],"recommendations":["Expand on regulatory compliance for multi-currency agent settlements"]}'::jsonb);

  insert into public.transactions
    (id, project_id, user_id, amount, currency, type, status,
     paypal_order_id, paypal_capture_id, payment_method)
  values
    ('txn_ref_paypal', 'prj_ref_fintech_market', v_user, 100.00, 'USD',
     'PAYPAL_CHECKOUT', 'COMPLETED', '8NB93821LK901234A', '9CP18293DF481920B',
     'PAYPAL_SANDBOX');

  insert into public.payment_events (transaction_id, event_type, payload)
  values
    ('txn_ref_paypal', 'CAPTURE_SUCCESS',
     '{"id":"9CP18293DF481920B","status":"COMPLETED","amount":{"value":"100.00","currency_code":"USD"}}'::jsonb);

  insert into public.ledger_entries
    (project_id, account_type, account_id, account_name, entry_type, amount,
     currency, description, reference_id)
  values
    ('prj_ref_fintech_market', 'CUSTOMER_FUNDS', v_user::text, 'Client', 'DEBIT',
     100.00, 'USD', 'PayPal checkout capture (Order 8NB93821LK901234A)', 'txn_ref_paypal'),
    ('prj_ref_fintech_market', 'ESCROW_HOLDING', 'ESCROW_POOL', 'Paygent Escrow',
     'CREDIT', 100.00, 'USD', 'Client funds locked in escrow', 'txn_ref_paypal'),
    ('prj_ref_fintech_market', 'ESCROW_HOLDING', 'ESCROW_POOL', 'Paygent Escrow',
     'DEBIT', 100.00, 'USD', 'Disbursement upon AI Courtroom approval', 'ctr_ref_primary'),
    ('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_marketmind', 'MarketMind (Apex)',
     'CREDIT', 55.00, 'USD', 'Contract payout net of subcontracts', 'ctr_ref_primary'),
    ('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_finanalyst', 'FinAnalyst (Apex)',
     'CREDIT', 20.00, 'USD', 'Financial modeling component payout', 'ctr_ref_primary'),
    ('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_datascout', 'DataScout',
     'CREDIT', 5.00, 'USD', 'Subcontract payout for Channel3 SKU crawl', 'ctr_ref_sub'),
    ('prj_ref_fintech_market', 'AGENT_WALLET', 'agt_qualityguard', 'QualityGuard',
     'CREDIT', 10.00, 'USD', 'Independent AI Courtroom audit fee', 'ctr_ref_primary'),
    ('prj_ref_fintech_market', 'PLATFORM_REVENUE', 'PLATFORM', 'Paygent Platform Fee',
     'CREDIT', 10.00, 'USD', '10% platform orchestration and verification fee', 'ctr_ref_primary');

  insert into public.reputation_events
    (agent_id, metric, delta, previous_value, new_value, reason, verified)
  values
    ('agt_marketmind', 'QUALITY_SCORE', 0.40, 98.30, 98.70,
     'Orchestrated a project with a 94.6 AI Courtroom evaluation and on-time delivery.', true);

  insert into public.agent_messages
    (project_id, from_agent_id, to_agent_id, message_type, content, metadata)
  values
    ('prj_ref_fintech_market', 'agt_marketmind', 'agt_datascout', 'DELEGATION',
     'Delegating the Channel3 pricing crawl. Budget cap is $5.00 and the SLA is 15 minutes.',
     '{"budget":5.00,"sla_minutes":15}'::jsonb),
    ('prj_ref_fintech_market', 'agt_datascout', 'agt_marketmind', 'DELIVERABLE_SHARE',
     'Pricing dataset delivered: 10 product SKUs with normalized feature matrices.',
     '{"sku_count":10}'::jsonb);

  raise notice 'Demo project seeded for user %', v_user;
end;
$$;

commit;

-- ----------------------------------------------------------------------------
-- 20. VERIFICATION
-- ----------------------------------------------------------------------------
select
  (select count(*) from public.profiles)        as profiles,
  (select count(*) from public.companies)       as companies,
  (select count(*) from public.agents)          as agents,
  (select count(*) from public.agent_skills)    as skills,
  (select count(*) from public.projects)        as projects,
  (select count(*) from public.transactions)    as transactions,
  (select count(*) from public.ledger_entries)  as ledger_entries,
  (select coalesce(sum(amount), 0) from public.ledger_entries where entry_type = 'DEBIT')  as total_debits,
  (select coalesce(sum(amount), 0) from public.ledger_entries where entry_type = 'CREDIT') as total_credits,
  (select coalesce(sum(case when entry_type = 'DEBIT' then amount else -amount end), 0)
     from public.ledger_entries)                as ledger_balance;
