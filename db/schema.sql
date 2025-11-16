-- ============================================================================
-- Citation Integrity Platform - PostgreSQL Schema
-- ============================================================================
-- Production database schema for multi-level state tracking, provenance,
-- and citation verification
--
-- Design principles:
-- - Immutable audit trail (parameter_history, lss_events)
-- - Denormalized for read performance
-- - Partial indexes for common queries
-- - JSON columns for flexibility
-- - Triggers for automated tracking
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Parameters with provenance tracking
CREATE TABLE parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  cited_value NUMERIC,
  citation_id UUID REFERENCES citations(id) ON DELETE SET NULL,
  source_file TEXT,
  source_line INTEGER,
  decorator_metadata JSONB, -- @provenance decorator data
  level INTEGER NOT NULL CHECK (level IN (0, 1, 2, 3)), -- Nested learning level
  update_frequency NUMERIC, -- Updates per session
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_param_name_file UNIQUE (name, source_file),
  CONSTRAINT valid_update_freq CHECK (update_frequency IS NULL OR update_frequency >= 0)
);

-- Parameter change history (immutable audit trail)
CREATE TABLE parameter_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parameter_id UUID NOT NULL REFERENCES parameters(id) ON DELETE CASCADE,
  old_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  drift NUMERIC NOT NULL, -- |new - old| / old
  lss NUMERIC NOT NULL, -- Learning Surprise Signal
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('MANUAL', 'AUTO_CORRECTION', 'MONTE_CARLO', 'LSS_ALERT')),
  changed_by TEXT, -- Agent or user ID
  reason TEXT,
  metadata JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Citations (peer-reviewed sources)
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doi TEXT,
  arxiv_id TEXT,
  url TEXT,
  title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  publication_venue TEXT,
  citation_format TEXT NOT NULL CHECK (citation_format IN ('APA', 'MLA', 'CHICAGO', 'IEEE', 'BIBTEX')),
  raw_citation TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_source TEXT, -- 'MCP', 'DOI', 'ARXIV', 'MANUAL'
  verification_confidence NUMERIC CHECK (verification_confidence BETWEEN 0 AND 1),
  verified_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT at_least_one_identifier CHECK (doi IS NOT NULL OR arxiv_id IS NOT NULL OR url IS NOT NULL),
  CONSTRAINT unique_doi UNIQUE (doi),
  CONSTRAINT unique_arxiv UNIQUE (arxiv_id)
);

-- Claims extracted from agent reasoning
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_text TEXT NOT NULL,
  claim_embedding VECTOR(768), -- Sentence-BERT embedding
  severity TEXT NOT NULL CHECK (severity IN ('CORE_ASSUMPTION', 'ARCHITECTURAL_DECISION', 'PARAMETER_JUSTIFICATION', 'PASSING_MENTION', 'METADATA')),
  confidence NUMERIC NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  source_context TEXT, -- Surrounding reasoning context
  source_agent TEXT, -- Which agent made the claim
  source_timestamp TIMESTAMPTZ NOT NULL,
  citation_id UUID REFERENCES citations(id) ON DELETE SET NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_result JSONB, -- {matched: bool, confidence: number, source: string}
  verification_lss NUMERIC, -- Surprise signal if verification fails
  reviewed_by TEXT, -- Human reviewer ID
  review_status TEXT CHECK (review_status IN ('PENDING', 'APPROVED', 'FLAGGED', 'REJECTED')),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_claim_text UNIQUE (claim_text)
);

-- Claim revisions (backtracking/coherence maintenance)
CREATE TABLE claim_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  revised_claim_text TEXT NOT NULL,
  revision_reason TEXT NOT NULL CHECK (revision_reason IN ('VERIFICATION_FAILURE', 'SCOPE_INFLATION', 'PARAMETER_DRIFT', 'MANUAL_CORRECTION')),
  coherence_score NUMERIC CHECK (coherence_score BETWEEN 0 AND 1),
  llm_transition TEXT, -- LLM-generated smooth transition
  revised_by TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LSS events (Learning Surprise Signal monitoring)
CREATE TABLE lss_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('PARAMETER_DRIFT', 'CLAIM_DEVIATION', 'MEMORY_STALENESS', 'VERIFICATION_FAILURE')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('PARAMETER', 'CLAIM', 'MEMORY', 'CITATION')),
  entity_id UUID NOT NULL,
  lss_value NUMERIC NOT NULL CHECK (lss_value >= 0),
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  context TEXT,
  metadata JSONB,
  alerted BOOLEAN NOT NULL DEFAULT FALSE,
  alert_method TEXT CHECK (alert_method IN ('LOG', 'GITHUB_ISSUE', 'PAGERDUTY', 'SLACK')),
  alerted_at TIMESTAMPTZ,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grading results (automated assignment grading)
CREATE TABLE grading_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  submission_timestamp TIMESTAMPTZ NOT NULL,
  grading_criteria JSONB NOT NULL, -- {criterion: weight}
  claim_checks JSONB NOT NULL, -- {claim: {verified: bool, severity: string}}
  severity_score NUMERIC NOT NULL CHECK (severity_score BETWEEN 0 AND 100),
  provenance_score NUMERIC NOT NULL CHECK (provenance_score BETWEEN 0 AND 100),
  coherence_score NUMERIC NOT NULL CHECK (coherence_score BETWEEN 0 AND 100),
  final_score NUMERIC NOT NULL CHECK (final_score BETWEEN 0 AND 100),
  grade_letter TEXT,
  feedback TEXT,
  human_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  human_reviewer_id TEXT,
  human_override_score NUMERIC CHECK (human_override_score BETWEEN 0 AND 100),
  appeal_status TEXT CHECK (appeal_status IN ('NONE', 'PENDING', 'ACCEPTED', 'REJECTED')),
  metadata JSONB,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_student_assignment UNIQUE (student_id, assignment_id)
);

-- Memory health tracking (nested learning level monitoring)
CREATE TABLE memory_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER NOT NULL CHECK (level IN (0, 1, 2, 3)),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('UPDATE_FREQUENCY', 'STALENESS', 'COVERAGE', 'COMPRESSION_RATIO')),
  metric_value NUMERIC NOT NULL,
  threshold NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'WARNING', 'ERROR')),
  context TEXT,
  metadata JSONB,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool use tracking (micro-memories for L0)
CREATE TABLE tool_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_params JSONB NOT NULL,
  tool_result JSONB,
  success BOOLEAN NOT NULL,
  latency_ms INTEGER,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level IN (0, 1, 2, 3)),
  consolidated_to_task_id UUID, -- Link to higher-level task memory
  metadata JSONB,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task tracking (consolidated from tool calls, L1 memory)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  task_status TEXT NOT NULL CHECK (task_status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'BLOCKED')),
  tool_call_ids UUID[] NOT NULL, -- Links to tool_calls
  outcome TEXT,
  consolidated_to_learning_id UUID, -- Link to learning memory
  metadata JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning events (consolidated from tasks, L2 memory)
CREATE TABLE learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  learning_type TEXT NOT NULL CHECK (learning_type IN ('PATTERN', 'PITFALL', 'BEST_PRACTICE', 'CONSTRAINT')),
  learning_text TEXT NOT NULL,
  task_ids UUID[] NOT NULL, -- Links to tasks
  evidence JSONB,
  confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  consolidated_to_guideline_id UUID, -- Link to guidelines
  metadata JSONB,
  learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guidelines (consolidated from learnings, L3 memory)
CREATE TABLE guidelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL, -- 'SIMULATION', 'FRONTEND', 'DOCUMENTATION', etc.
  guideline_text TEXT NOT NULL,
  learning_ids UUID[] NOT NULL, -- Links to learnings
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  approval_status TEXT NOT NULL CHECK (approval_status IN ('DRAFT', 'APPROVED', 'DEPRECATED')) DEFAULT 'DRAFT',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Parameters
CREATE INDEX idx_parameters_name ON parameters (name);
CREATE INDEX idx_parameters_level ON parameters (level);
CREATE INDEX idx_parameters_updated_at ON parameters (last_updated_at DESC);
CREATE INDEX idx_parameters_citation ON parameters (citation_id) WHERE citation_id IS NOT NULL;
CREATE INDEX idx_parameters_source_file ON parameters (source_file);

-- Parameter history
CREATE INDEX idx_param_history_param_id ON parameter_history (parameter_id);
CREATE INDEX idx_param_history_changed_at ON parameter_history (changed_at DESC);
CREATE INDEX idx_param_history_lss ON parameter_history (lss DESC) WHERE lss > 0.2; -- High LSS only
CREATE INDEX idx_param_history_trigger ON parameter_history (trigger_type);

-- Citations
CREATE INDEX idx_citations_verified ON citations (verified, verification_confidence DESC);
CREATE INDEX idx_citations_title_trgm ON citations USING gin (title gin_trgm_ops); -- Text search
CREATE INDEX idx_citations_authors ON citations USING gin (authors); -- Array search

-- Claims
CREATE INDEX idx_claims_severity ON claims (severity);
CREATE INDEX idx_claims_verified ON claims (verified);
CREATE INDEX idx_claims_agent ON claims (source_agent);
CREATE INDEX idx_claims_citation ON claims (citation_id) WHERE citation_id IS NOT NULL;
CREATE INDEX idx_claims_review_status ON claims (review_status) WHERE review_status = 'PENDING';
CREATE INDEX idx_claims_text_trgm ON claims USING gin (claim_text gin_trgm_ops); -- Text similarity
-- CREATE INDEX idx_claims_embedding ON claims USING ivfflat (claim_embedding vector_cosine_ops) WITH (lists = 100); -- Uncomment if using pgvector

-- Claim revisions
CREATE INDEX idx_claim_revisions_original ON claim_revisions (original_claim_id);
CREATE INDEX idx_claim_revisions_reason ON claim_revisions (revision_reason);

-- LSS events
CREATE INDEX idx_lss_events_type ON lss_events (event_type);
CREATE INDEX idx_lss_events_severity ON lss_events (severity) WHERE severity IN ('ERROR', 'CRITICAL');
CREATE INDEX idx_lss_events_created_at ON lss_events (created_at DESC);
CREATE INDEX idx_lss_events_alerted ON lss_events (alerted) WHERE alerted = FALSE;
CREATE INDEX idx_lss_events_resolved ON lss_events (resolved) WHERE resolved = FALSE;

-- Grading results
CREATE INDEX idx_grading_student ON grading_results (student_id);
CREATE INDEX idx_grading_assignment ON grading_results (assignment_id);
CREATE INDEX idx_grading_review_required ON grading_results (human_review_required) WHERE human_review_required = TRUE;
CREATE INDEX idx_grading_appeal ON grading_results (appeal_status) WHERE appeal_status = 'PENDING';

-- Memory health
CREATE INDEX idx_memory_health_level ON memory_health (level);
CREATE INDEX idx_memory_health_status ON memory_health (status) WHERE status != 'HEALTHY';
CREATE INDEX idx_memory_health_measured_at ON memory_health (measured_at DESC);

-- Tool calls
CREATE INDEX idx_tool_calls_session ON tool_calls (session_id);
CREATE INDEX idx_tool_calls_agent ON tool_calls (agent_id);
CREATE INDEX idx_tool_calls_called_at ON tool_calls (called_at DESC);
CREATE INDEX idx_tool_calls_level ON tool_calls (level);

-- Tasks
CREATE INDEX idx_tasks_session ON tasks (session_id);
CREATE INDEX idx_tasks_agent ON tasks (agent_id);
CREATE INDEX idx_tasks_status ON tasks (task_status);
CREATE INDEX idx_tasks_completed_at ON tasks (completed_at DESC) WHERE completed_at IS NOT NULL;

-- Learnings
CREATE INDEX idx_learnings_agent ON learnings (agent_id);
CREATE INDEX idx_learnings_type ON learnings (learning_type);
CREATE INDEX idx_learnings_learned_at ON learnings (learned_at DESC);

-- Guidelines
CREATE INDEX idx_guidelines_domain ON guidelines (domain);
CREATE INDEX idx_guidelines_approval ON guidelines (approval_status);
CREATE INDEX idx_guidelines_priority ON guidelines (priority DESC);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-track parameter changes
CREATE OR REPLACE FUNCTION track_parameter_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO parameter_history (
      parameter_id,
      old_value,
      new_value,
      drift,
      lss,
      trigger_type,
      changed_by,
      reason,
      metadata
    ) VALUES (
      NEW.id,
      OLD.value,
      NEW.value,
      ABS(NEW.value - OLD.value) / NULLIF(OLD.value, 0),
      CASE
        WHEN NEW.cited_value IS NOT NULL THEN ABS(NEW.value - NEW.cited_value) / NULLIF(NEW.cited_value, 0)
        ELSE 0
      END,
      'AUTO_CORRECTION',
      current_user,
      'Automated parameter update',
      jsonb_build_object('old_citation', OLD.citation_id, 'new_citation', NEW.citation_id)
    );

    -- Generate LSS alert if drift exceeds threshold
    IF ABS(NEW.value - NEW.cited_value) / NULLIF(NEW.cited_value, 0) > 0.2 THEN
      INSERT INTO lss_events (
        event_type,
        entity_type,
        entity_id,
        lss_value,
        threshold,
        severity,
        context,
        metadata
      ) VALUES (
        'PARAMETER_DRIFT',
        'PARAMETER',
        NEW.id,
        ABS(NEW.value - NEW.cited_value) / NULLIF(NEW.cited_value, 0),
        0.2,
        CASE
          WHEN ABS(NEW.value - NEW.cited_value) / NULLIF(NEW.cited_value, 0) > 0.5 THEN 'CRITICAL'
          ELSE 'WARNING'
        END,
        format('Parameter %s drifted from cited value', NEW.name),
        jsonb_build_object('param_name', NEW.name, 'old_value', OLD.value, 'new_value', NEW.value, 'cited_value', NEW.cited_value)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parameter_change_tracker
AFTER UPDATE ON parameters
FOR EACH ROW
EXECUTE FUNCTION track_parameter_change();

-- Auto-consolidate tool calls to tasks
CREATE OR REPLACE FUNCTION check_task_consolidation()
RETURNS TRIGGER AS $$
DECLARE
  task_count INTEGER;
  related_calls UUID[];
BEGIN
  -- Count tool calls in same session within last 5 minutes
  SELECT COUNT(*), array_agg(id)
  INTO task_count, related_calls
  FROM tool_calls
  WHERE session_id = NEW.session_id
    AND agent_id = NEW.agent_id
    AND called_at >= NEW.called_at - INTERVAL '5 minutes'
    AND consolidated_to_task_id IS NULL;

  -- If 5+ tool calls, suggest consolidation (app handles actual consolidation)
  IF task_count >= 5 THEN
    RAISE NOTICE 'Task consolidation suggested: % tool calls in session %', task_count, NEW.session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_consolidation_checker
AFTER INSERT ON tool_calls
FOR EACH ROW
EXECUTE FUNCTION check_task_consolidation();

-- ============================================================================
-- Views
-- ============================================================================

-- Active LSS alerts
CREATE VIEW active_lss_alerts AS
SELECT
  e.id,
  e.event_type,
  e.entity_type,
  e.entity_id,
  e.lss_value,
  e.severity,
  e.context,
  e.created_at,
  CASE e.entity_type
    WHEN 'PARAMETER' THEN (SELECT name FROM parameters WHERE id = e.entity_id)
    WHEN 'CLAIM' THEN (SELECT substring(claim_text, 1, 100) FROM claims WHERE id = e.entity_id)
    ELSE NULL
  END AS entity_name
FROM lss_events e
WHERE e.resolved = FALSE
  AND e.severity IN ('WARNING', 'ERROR', 'CRITICAL')
ORDER BY e.severity DESC, e.lss_value DESC, e.created_at DESC;

-- Parameter provenance health
CREATE VIEW parameter_provenance_health AS
SELECT
  p.id,
  p.name,
  p.value,
  p.cited_value,
  p.level,
  c.title AS citation_title,
  c.verified AS citation_verified,
  CASE
    WHEN p.cited_value IS NULL THEN 'NO_CITATION'
    WHEN c.id IS NULL THEN 'CITATION_MISSING'
    WHEN NOT c.verified THEN 'CITATION_UNVERIFIED'
    WHEN ABS(p.value - p.cited_value) / NULLIF(p.cited_value, 0) > 0.2 THEN 'DRIFTED'
    ELSE 'HEALTHY'
  END AS provenance_status,
  ABS(p.value - p.cited_value) / NULLIF(p.cited_value, 0) AS drift_ratio
FROM parameters p
LEFT JOIN citations c ON p.citation_id = c.id
ORDER BY provenance_status DESC, drift_ratio DESC NULLS LAST;

-- Claims requiring review
CREATE VIEW claims_pending_review AS
SELECT
  c.id,
  c.claim_text,
  c.severity,
  c.confidence,
  c.source_agent,
  c.created_at,
  CASE
    WHEN c.citation_id IS NULL THEN 'NO_CITATION'
    WHEN NOT c.verified THEN 'UNVERIFIED'
    WHEN c.review_status = 'FLAGGED' THEN 'FLAGGED'
    ELSE 'PENDING'
  END AS review_priority
FROM claims c
WHERE c.review_status IN ('PENDING', 'FLAGGED')
  OR (c.verified = FALSE AND c.severity IN ('CORE_ASSUMPTION', 'ARCHITECTURAL_DECISION'))
ORDER BY
  CASE review_priority
    WHEN 'FLAGGED' THEN 1
    WHEN 'UNVERIFIED' THEN 2
    WHEN 'NO_CITATION' THEN 3
    ELSE 4
  END,
  c.created_at DESC;

-- Memory health dashboard
CREATE VIEW memory_health_dashboard AS
SELECT
  level,
  COUNT(*) FILTER (WHERE status = 'HEALTHY') AS healthy_count,
  COUNT(*) FILTER (WHERE status = 'WARNING') AS warning_count,
  COUNT(*) FILTER (WHERE status = 'ERROR') AS error_count,
  AVG(metric_value) FILTER (WHERE metric_type = 'UPDATE_FREQUENCY') AS avg_update_frequency,
  MAX(metric_value) FILTER (WHERE metric_type = 'STALENESS') AS max_staleness,
  AVG(metric_value) FILTER (WHERE metric_type = 'COMPRESSION_RATIO') AS avg_compression_ratio
FROM memory_health
WHERE measured_at >= NOW() - INTERVAL '24 hours'
GROUP BY level
ORDER BY level;

-- ============================================================================
-- Functions
-- ============================================================================

-- Calculate drift between current and cited values
CREATE OR REPLACE FUNCTION calculate_parameter_drift(param_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  drift NUMERIC;
BEGIN
  SELECT ABS(p.value - p.cited_value) / NULLIF(p.cited_value, 0)
  INTO drift
  FROM parameters p
  WHERE p.id = param_id;

  RETURN COALESCE(drift, 0);
END;
$$ LANGUAGE plpgsql;

-- Get unverified claims by severity
CREATE OR REPLACE FUNCTION get_unverified_claims(severity_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  claim_text TEXT,
  severity TEXT,
  confidence NUMERIC,
  source_agent TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.claim_text, c.severity, c.confidence, c.source_agent, c.created_at
  FROM claims c
  WHERE c.verified = FALSE
    AND (severity_filter IS NULL OR c.severity = severity_filter)
  ORDER BY
    CASE c.severity
      WHEN 'CORE_ASSUMPTION' THEN 1
      WHEN 'ARCHITECTURAL_DECISION' THEN 2
      WHEN 'PARAMETER_JUSTIFICATION' THEN 3
      WHEN 'PASSING_MENTION' THEN 4
      WHEN 'METADATA' THEN 5
    END,
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get LSS events above threshold
CREATE OR REPLACE FUNCTION get_lss_alerts(severity_filter TEXT DEFAULT 'WARNING')
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  entity_type TEXT,
  lss_value NUMERIC,
  severity TEXT,
  context TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.event_type, e.entity_type, e.lss_value, e.severity, e.context, e.created_at
  FROM lss_events e
  WHERE e.resolved = FALSE
    AND e.severity >= severity_filter
  ORDER BY
    CASE e.severity
      WHEN 'CRITICAL' THEN 1
      WHEN 'ERROR' THEN 2
      WHEN 'WARNING' THEN 3
      ELSE 4
    END,
    e.lss_value DESC,
    e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grants (adjust based on actual roles)
-- ============================================================================

-- Create roles
-- CREATE ROLE citation_platform_app;
-- CREATE ROLE citation_platform_readonly;

-- Grant permissions
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO citation_platform_app;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO citation_platform_readonly;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO citation_platform_app;

-- ============================================================================
-- Sample Data (for development only)
-- ============================================================================

-- Uncomment for local dev
-- INSERT INTO citations (doi, title, authors, publication_year, publication_venue, citation_format, raw_citation, verified, verification_source, verification_confidence)
-- VALUES
--   ('10.1126/science.abq7747', 'The Alignment Problem from a Deep Learning Perspective', ARRAY['Ngo, Richard', 'Chan, Lawrence', 'Mindermann, Sören'], 2024, 'Science', 'APA', 'Ngo et al. (2024). The Alignment Problem from a Deep Learning Perspective. Science.', TRUE, 'DOI', 0.95);

COMMENT ON TABLE parameters IS 'Simulation parameters with provenance tracking and LSS monitoring';
COMMENT ON TABLE parameter_history IS 'Immutable audit trail of all parameter changes';
COMMENT ON TABLE citations IS 'Peer-reviewed citations from academic literature';
COMMENT ON TABLE claims IS 'Claims extracted from agent reasoning requiring verification';
COMMENT ON TABLE lss_events IS 'Learning Surprise Signal events for drift/anomaly detection';
COMMENT ON TABLE grading_results IS 'Automated grading results for student assignments';
COMMENT ON TABLE memory_health IS 'Nested learning level health metrics';
COMMENT ON TABLE tool_calls IS 'L0: Micro-memories of individual tool calls';
COMMENT ON TABLE tasks IS 'L1: Consolidated task memories from tool calls';
COMMENT ON TABLE learnings IS 'L2: Patterns and learnings extracted from tasks';
COMMENT ON TABLE guidelines IS 'L3: High-level guidelines consolidated from learnings';
