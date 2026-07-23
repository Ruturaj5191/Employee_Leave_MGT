-- accounts_user
CREATE TABLE public.accounts_user (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    role character varying(10) NOT NULL,
    annual_leave_quota integer NOT NULL,
    date_joined_company date,
    manager_id bigint,
    CONSTRAINT accounts_user_annual_leave_quota_check CHECK ((annual_leave_quota >= 0))
);

-- accounts_user_groups
CREATE TABLE public.accounts_user_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);

-- accounts_user_user_permissions
CREATE TABLE public.accounts_user_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);

-- auth_group
CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);

-- auth_group_permissions
CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);

-- auth_permission
CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);

-- django_admin_log
CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);

-- django_content_type
CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);

-- django_migrations
CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);

-- django_session
CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);

-- leaves_leave
CREATE TABLE public.leaves_leave (
    id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL,
    status character varying(10) NOT NULL,
    applied_at timestamp with time zone NOT NULL,
    decided_at timestamp with time zone,
    decision_note text NOT NULL,
    decided_by_id bigint,
    employee_id bigint NOT NULL
);

-- token_blacklist_blacklistedtoken
CREATE TABLE public.token_blacklist_blacklistedtoken (
    id bigint NOT NULL,
    blacklisted_at timestamp with time zone NOT NULL,
    token_id bigint NOT NULL
);

-- token_blacklist_outstandingtoken
CREATE TABLE public.token_blacklist_outstandingtoken (
    id bigint NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    user_id bigint,
    jti character varying(255) NOT NULL
);
