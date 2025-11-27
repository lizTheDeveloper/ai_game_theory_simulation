--
-- PostgreSQL database dump
--

\restrict lq0cXpkDymH2D3oD8eZVSCmMcqkgElCmKfDdWTae8vjYZZdSf7obRzJhsg2fC5u

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_metrics; Type: TABLE; Schema: public; Owner: marcus_app
--

CREATE TABLE public.agent_metrics (
    id integer NOT NULL,
    agent_id character varying(50) NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value double precision NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agent_metrics OWNER TO marcus_app;

--
-- Name: agent_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: marcus_app
--

CREATE SEQUENCE public.agent_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.agent_metrics_id_seq OWNER TO marcus_app;

--
-- Name: agent_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: marcus_app
--

ALTER SEQUENCE public.agent_metrics_id_seq OWNED BY public.agent_metrics.id;


--
-- Name: agent_states; Type: TABLE; Schema: public; Owner: marcus_app
--

CREATE TABLE public.agent_states (
    agent_id character varying(50) NOT NULL,
    reputation double precision DEFAULT 0.5 NOT NULL,
    total_citations integer DEFAULT 0 NOT NULL,
    detected_violations integer DEFAULT 0 NOT NULL,
    current_behavior character varying(50),
    memory_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    exploration_rate double precision DEFAULT 0.2 NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT exploration_range CHECK (((exploration_rate >= (0)::double precision) AND (exploration_rate <= (1)::double precision))),
    CONSTRAINT reputation_range CHECK (((reputation >= (0)::double precision) AND (reputation <= (1)::double precision)))
);


ALTER TABLE public.agent_states OWNER TO marcus_app;

--
-- Name: citation_analyses; Type: TABLE; Schema: public; Owner: marcus_app
--

CREATE TABLE public.citation_analyses (
    id integer NOT NULL,
    source character varying(255) NOT NULL,
    text_hash character varying(64) NOT NULL,
    mean_integrity double precision NOT NULL,
    consensus double precision NOT NULL,
    behavior_distribution jsonb NOT NULL,
    recommendations jsonb NOT NULL,
    num_agents integer NOT NULL,
    latency_ms integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT consensus_range CHECK (((consensus >= (0)::double precision) AND (consensus <= (1)::double precision))),
    CONSTRAINT integrity_range CHECK (((mean_integrity >= (0)::double precision) AND (mean_integrity <= (1)::double precision)))
);


ALTER TABLE public.citation_analyses OWNER TO marcus_app;

--
-- Name: citation_analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: marcus_app
--

CREATE SEQUENCE public.citation_analyses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.citation_analyses_id_seq OWNER TO marcus_app;

--
-- Name: citation_analyses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: marcus_app
--

ALTER SEQUENCE public.citation_analyses_id_seq OWNED BY public.citation_analyses.id;


--
-- Name: citation_tasks; Type: TABLE; Schema: public; Owner: marcus_app
--

CREATE TABLE public.citation_tasks (
    id integer NOT NULL,
    task_id character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    document jsonb NOT NULL,
    result jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    CONSTRAINT status_values CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.citation_tasks OWNER TO marcus_app;

--
-- Name: citation_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: marcus_app
--

CREATE SEQUENCE public.citation_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.citation_tasks_id_seq OWNER TO marcus_app;

--
-- Name: citation_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: marcus_app
--

ALTER SEQUENCE public.citation_tasks_id_seq OWNED BY public.citation_tasks.id;


--
-- Name: learning_history; Type: TABLE; Schema: public; Owner: marcus_app
--

CREATE TABLE public.learning_history (
    id integer NOT NULL,
    agent_id character varying(50) NOT NULL,
    episode integer NOT NULL,
    reward double precision NOT NULL,
    loss double precision,
    epsilon double precision NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.learning_history OWNER TO marcus_app;

--
-- Name: learning_history_id_seq; Type: SEQUENCE; Schema: public; Owner: marcus_app
--

CREATE SEQUENCE public.learning_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.learning_history_id_seq OWNER TO marcus_app;

--
-- Name: learning_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: marcus_app
--

ALTER SEQUENCE public.learning_history_id_seq OWNED BY public.learning_history.id;


--
-- Name: agent_metrics id; Type: DEFAULT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.agent_metrics ALTER COLUMN id SET DEFAULT nextval('public.agent_metrics_id_seq'::regclass);


--
-- Name: citation_analyses id; Type: DEFAULT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.citation_analyses ALTER COLUMN id SET DEFAULT nextval('public.citation_analyses_id_seq'::regclass);


--
-- Name: citation_tasks id; Type: DEFAULT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.citation_tasks ALTER COLUMN id SET DEFAULT nextval('public.citation_tasks_id_seq'::regclass);


--
-- Name: learning_history id; Type: DEFAULT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.learning_history ALTER COLUMN id SET DEFAULT nextval('public.learning_history_id_seq'::regclass);


--
-- Data for Name: agent_metrics; Type: TABLE DATA; Schema: public; Owner: marcus_app
--

COPY public.agent_metrics (id, agent_id, metric_name, metric_value, "timestamp") FROM stdin;
\.


--
-- Data for Name: agent_states; Type: TABLE DATA; Schema: public; Owner: marcus_app
--

COPY public.agent_states (agent_id, reputation, total_citations, detected_violations, current_behavior, memory_state, exploration_rate, "timestamp") FROM stdin;
agent-0	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-1	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-2	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-3	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-4	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-5	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-6	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-7	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
agent-8	0.5	0	0	\N	{"recent_citations": [], "violation_history": []}	0.2	2025-11-22 07:00:37.155261
\.


--
-- Data for Name: citation_analyses; Type: TABLE DATA; Schema: public; Owner: marcus_app
--

COPY public.citation_analyses (id, source, text_hash, mean_integrity, consensus, behavior_distribution, recommendations, num_agents, latency_ms, "timestamp") FROM stdin;
\.


--
-- Data for Name: citation_tasks; Type: TABLE DATA; Schema: public; Owner: marcus_app
--

COPY public.citation_tasks (id, task_id, status, document, result, created_at, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: learning_history; Type: TABLE DATA; Schema: public; Owner: marcus_app
--

COPY public.learning_history (id, agent_id, episode, reward, loss, epsilon, "timestamp") FROM stdin;
\.


--
-- Name: agent_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: marcus_app
--

SELECT pg_catalog.setval('public.agent_metrics_id_seq', 1, false);


--
-- Name: citation_analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: marcus_app
--

SELECT pg_catalog.setval('public.citation_analyses_id_seq', 1, false);


--
-- Name: citation_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: marcus_app
--

SELECT pg_catalog.setval('public.citation_tasks_id_seq', 1, false);


--
-- Name: learning_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: marcus_app
--

SELECT pg_catalog.setval('public.learning_history_id_seq', 1, false);


--
-- Name: agent_metrics agent_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.agent_metrics
    ADD CONSTRAINT agent_metrics_pkey PRIMARY KEY (id);


--
-- Name: agent_states agent_states_pkey; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.agent_states
    ADD CONSTRAINT agent_states_pkey PRIMARY KEY (agent_id);


--
-- Name: citation_analyses citation_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.citation_analyses
    ADD CONSTRAINT citation_analyses_pkey PRIMARY KEY (id);


--
-- Name: citation_tasks citation_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.citation_tasks
    ADD CONSTRAINT citation_tasks_pkey PRIMARY KEY (id);


--
-- Name: citation_tasks citation_tasks_task_id_key; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.citation_tasks
    ADD CONSTRAINT citation_tasks_task_id_key UNIQUE (task_id);


--
-- Name: learning_history learning_history_pkey; Type: CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.learning_history
    ADD CONSTRAINT learning_history_pkey PRIMARY KEY (id);


--
-- Name: idx_agent_reputation; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_agent_reputation ON public.agent_states USING btree (reputation DESC);


--
-- Name: idx_agent_states_agent_time; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_agent_states_agent_time ON public.agent_states USING btree (agent_id, "timestamp" DESC);


--
-- Name: idx_agent_states_behavior; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_agent_states_behavior ON public.agent_states USING btree (current_behavior);


--
-- Name: idx_agent_states_reputation; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_agent_states_reputation ON public.agent_states USING btree (reputation DESC);


--
-- Name: idx_agent_timestamp; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_agent_timestamp ON public.agent_states USING btree ("timestamp" DESC);


--
-- Name: idx_analysis_hash; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_analysis_hash ON public.citation_analyses USING btree (text_hash);


--
-- Name: idx_analysis_integrity; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_analysis_integrity ON public.citation_analyses USING btree (mean_integrity);


--
-- Name: idx_analysis_source; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_analysis_source ON public.citation_analyses USING btree (source);


--
-- Name: idx_analysis_timestamp; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_analysis_timestamp ON public.citation_analyses USING btree ("timestamp" DESC);


--
-- Name: idx_citation_analyses_consensus_filter; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_citation_analyses_consensus_filter ON public.citation_analyses USING btree (consensus) WHERE (consensus < (0.5)::double precision);


--
-- Name: idx_citation_analyses_integrity_filter; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_citation_analyses_integrity_filter ON public.citation_analyses USING btree (mean_integrity) WHERE (mean_integrity < (0.5)::double precision);


--
-- Name: idx_citation_analyses_latency_perf; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_citation_analyses_latency_perf ON public.citation_analyses USING btree (latency_ms DESC);


--
-- Name: idx_citation_analyses_source_time; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_citation_analyses_source_time ON public.citation_analyses USING btree (source, "timestamp" DESC);


--
-- Name: idx_citation_analyses_timestamp; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_citation_analyses_timestamp ON public.citation_analyses USING btree ("timestamp" DESC);


--
-- Name: idx_learning_agent; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_learning_agent ON public.learning_history USING btree (agent_id, episode);


--
-- Name: idx_memory_gin; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_memory_gin ON public.agent_states USING gin (memory_state);


--
-- Name: idx_metrics_agent_time; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_metrics_agent_time ON public.agent_metrics USING btree (agent_id, "timestamp" DESC);


--
-- Name: idx_metrics_name; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_metrics_name ON public.agent_metrics USING btree (metric_name);


--
-- Name: idx_task_created; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_task_created ON public.citation_tasks USING btree (created_at DESC);


--
-- Name: idx_task_status; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_task_status ON public.citation_tasks USING btree (status);


--
-- Name: idx_tasks_created; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_tasks_created ON public.citation_tasks USING btree (created_at DESC);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: marcus_app
--

CREATE INDEX idx_tasks_status ON public.citation_tasks USING btree (status);


--
-- Name: agent_metrics agent_metrics_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.agent_metrics
    ADD CONSTRAINT agent_metrics_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agent_states(agent_id) ON DELETE CASCADE;


--
-- Name: learning_history learning_history_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: marcus_app
--

ALTER TABLE ONLY public.learning_history
    ADD CONSTRAINT learning_history_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agent_states(agent_id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO marcus_readonly;


--
-- Name: TABLE agent_metrics; Type: ACL; Schema: public; Owner: marcus_app
--

GRANT SELECT ON TABLE public.agent_metrics TO marcus_readonly;


--
-- Name: TABLE agent_states; Type: ACL; Schema: public; Owner: marcus_app
--

GRANT SELECT ON TABLE public.agent_states TO marcus_readonly;


--
-- Name: TABLE citation_analyses; Type: ACL; Schema: public; Owner: marcus_app
--

GRANT SELECT ON TABLE public.citation_analyses TO marcus_readonly;


--
-- Name: TABLE citation_tasks; Type: ACL; Schema: public; Owner: marcus_app
--

GRANT SELECT ON TABLE public.citation_tasks TO marcus_readonly;


--
-- Name: TABLE learning_history; Type: ACL; Schema: public; Owner: marcus_app
--

GRANT SELECT ON TABLE public.learning_history TO marcus_readonly;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: marcus_app
--

ALTER DEFAULT PRIVILEGES FOR ROLE marcus_app IN SCHEMA public GRANT SELECT ON TABLES  TO marcus_readonly;


--
-- PostgreSQL database dump complete
--

\unrestrict lq0cXpkDymH2D3oD8eZVSCmMcqkgElCmKfDdWTae8vjYZZdSf7obRzJhsg2fC5u

