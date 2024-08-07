PGDMP                      |            mentiro    16.2    16.2 m    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16397    mentiro    DATABASE     }   CREATE DATABASE mentiro WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Pakistan.1252';
    DROP DATABASE mentiro;
                postgres    false            �            1259    25457    answers    TABLE     3  CREATE TABLE public.answers (
    id integer NOT NULL,
    question_id integer,
    options jsonb[],
    created_by integer,
    is_active boolean DEFAULT true,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.answers;
       public         heap    postgres    false            �            1259    25456    answers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.answers_id_seq;
       public          postgres    false    228            �           0    0    answers_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.answers_id_seq OWNED BY public.answers.id;
          public          postgres    false    227            �            1259    25521    assessments    TABLE     %  CREATE TABLE public.assessments (
    id integer NOT NULL,
    assessment_name character varying(100),
    company_id integer,
    tests jsonb[],
    job_role_id integer,
    work_arrangement_id integer,
    job_location_id integer,
    assessment_time integer,
    shareablelink character varying(255),
    uniquelink character varying(255),
    created_by integer,
    is_active boolean DEFAULT true,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.assessments;
       public         heap    postgres    false            �            1259    25520    assessments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.assessments_id_seq;
       public          postgres    false    234            �           0    0    assessments_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;
          public          postgres    false    233            �            1259    25558 
   candidates    TABLE     L  CREATE TABLE public.candidates (
    id integer NOT NULL,
    first_name character varying,
    last_name character varying,
    email character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.candidates;
       public         heap    postgres    false            �            1259    25557    candidates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.candidates_id_seq;
       public          postgres    false    236            �           0    0    candidates_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;
          public          postgres    false    235            �            1259    25420 
   categories    TABLE     6  CREATE TABLE public.categories (
    id integer NOT NULL,
    category_name character varying NOT NULL,
    created_by integer,
    is_active boolean DEFAULT true,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.categories;
       public         heap    postgres    false            �            1259    25419    categories_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.categories_id_seq;
       public          postgres    false    224            �           0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
          public          postgres    false    223            �            1259    25482 	   companies    TABLE     �  CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(100),
    website character varying(100),
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    is_active boolean DEFAULT true,
    stripe_customer_id character varying(255),
    plan_id character varying(255)
);
    DROP TABLE public.companies;
       public         heap    postgres    false            �            1259    25481    companies_id_seq    SEQUENCE     �   CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.companies_id_seq;
       public          postgres    false    230            �           0    0    companies_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;
          public          postgres    false    229            �            1259    25076    job_locations    TABLE     i   CREATE TABLE public.job_locations (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
 !   DROP TABLE public.job_locations;
       public         heap    postgres    false            �            1259    25075    job_locations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.job_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.job_locations_id_seq;
       public          postgres    false    218            �           0    0    job_locations_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.job_locations_id_seq OWNED BY public.job_locations.id;
          public          postgres    false    217            �            1259    25067 	   job_roles    TABLE     e   CREATE TABLE public.job_roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
    DROP TABLE public.job_roles;
       public         heap    postgres    false            �            1259    25066    job_roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.job_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.job_roles_id_seq;
       public          postgres    false    216            �           0    0    job_roles_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.job_roles_id_seq OWNED BY public.job_roles.id;
          public          postgres    false    215            �            1259    25437 	   questions    TABLE     "  CREATE TABLE public.questions (
    id integer NOT NULL,
    question_text character varying NOT NULL,
    question_type character varying,
    difficulty_level character varying,
    categories integer[],
    created_by integer,
    is_active boolean DEFAULT true,
    is_custom boolean DEFAULT false,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT questions_difficulty_level_check CHECK (((difficulty_level)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['MCQS'::character varying, 'true_false'::character varying])::text[])))
);
    DROP TABLE public.questions;
       public         heap    postgres    false            �            1259    25436    questions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.questions_id_seq;
       public          postgres    false    226            �           0    0    questions_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;
          public          postgres    false    225            �            1259    25572    results    TABLE       CREATE TABLE public.results (
    id integer NOT NULL,
    candidate_id integer,
    test_id integer,
    questions jsonb[],
    score integer,
    assessment_id integer,
    company_id integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.results;
       public         heap    postgres    false            �            1259    25571    results_id_seq    SEQUENCE     �   CREATE SEQUENCE public.results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.results_id_seq;
       public          postgres    false    238            �           0    0    results_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.results_id_seq OWNED BY public.results.id;
          public          postgres    false    237            �            1259    25499    tests    TABLE     v  CREATE TABLE public.tests (
    id integer NOT NULL,
    test_name character varying(100),
    test_description text,
    categories integer[],
    company_id integer,
    created_by integer,
    is_active boolean DEFAULT true,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.tests;
       public         heap    postgres    false            �            1259    25498    tests_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.tests_id_seq;
       public          postgres    false    232            �           0    0    tests_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;
          public          postgres    false    231            �            1259    25402    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying,
    last_name character varying,
    email character varying,
    is_email_verified boolean DEFAULT false,
    phone character varying,
    is_phone_verified boolean DEFAULT false,
    password character varying,
    permissions boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_employee boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token character varying,
    reset_token_expiry timestamp without time zone
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    25401    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    222            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    221            �            1259    25085    work_arrangements    TABLE     m   CREATE TABLE public.work_arrangements (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);
 %   DROP TABLE public.work_arrangements;
       public         heap    postgres    false            �            1259    25084    work_arrangements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.work_arrangements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.work_arrangements_id_seq;
       public          postgres    false    220            �           0    0    work_arrangements_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.work_arrangements_id_seq OWNED BY public.work_arrangements.id;
          public          postgres    false    219            �           2604    25460 
   answers id    DEFAULT     h   ALTER TABLE ONLY public.answers ALTER COLUMN id SET DEFAULT nextval('public.answers_id_seq'::regclass);
 9   ALTER TABLE public.answers ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    228    227    228            �           2604    25524    assessments id    DEFAULT     p   ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);
 =   ALTER TABLE public.assessments ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    234    233    234            �           2604    25561    candidates id    DEFAULT     n   ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);
 <   ALTER TABLE public.candidates ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    236    235    236            �           2604    25423    categories id    DEFAULT     n   ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
 <   ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    223    224            �           2604    25485    companies id    DEFAULT     l   ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);
 ;   ALTER TABLE public.companies ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    229    230    230            �           2604    25079    job_locations id    DEFAULT     t   ALTER TABLE ONLY public.job_locations ALTER COLUMN id SET DEFAULT nextval('public.job_locations_id_seq'::regclass);
 ?   ALTER TABLE public.job_locations ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218            �           2604    25070    job_roles id    DEFAULT     l   ALTER TABLE ONLY public.job_roles ALTER COLUMN id SET DEFAULT nextval('public.job_roles_id_seq'::regclass);
 ;   ALTER TABLE public.job_roles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215    216            �           2604    25440    questions id    DEFAULT     l   ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);
 ;   ALTER TABLE public.questions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    226    226            �           2604    25575 
   results id    DEFAULT     h   ALTER TABLE ONLY public.results ALTER COLUMN id SET DEFAULT nextval('public.results_id_seq'::regclass);
 9   ALTER TABLE public.results ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    237    238    238            �           2604    25502    tests id    DEFAULT     d   ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);
 7   ALTER TABLE public.tests ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    231    232    232            �           2604    25405    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    221    222            �           2604    25088    work_arrangements id    DEFAULT     |   ALTER TABLE ONLY public.work_arrangements ALTER COLUMN id SET DEFAULT nextval('public.work_arrangements_id_seq'::regclass);
 C   ALTER TABLE public.work_arrangements ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    219    220            �          0    25457    answers 
   TABLE DATA           n   COPY public.answers (id, question_id, options, created_by, is_active, created_date, updated_date) FROM stdin;
    public          postgres    false    228   �       �          0    25521    assessments 
   TABLE DATA           �   COPY public.assessments (id, assessment_name, company_id, tests, job_role_id, work_arrangement_id, job_location_id, assessment_time, shareablelink, uniquelink, created_by, is_active, created_date, updated_date) FROM stdin;
    public          postgres    false    234   8�       �          0    25558 
   candidates 
   TABLE DATA           i   COPY public.candidates (id, first_name, last_name, email, is_active, created_at, updated_at) FROM stdin;
    public          postgres    false    236   ��       ~          0    25420 
   categories 
   TABLE DATA           j   COPY public.categories (id, category_name, created_by, is_active, created_date, updated_date) FROM stdin;
    public          postgres    false    224   #�       �          0    25482 	   companies 
   TABLE DATA           �   COPY public.companies (id, name, website, created_date, updated_date, created_by, is_active, stripe_customer_id, plan_id) FROM stdin;
    public          postgres    false    230   ��       x          0    25076    job_locations 
   TABLE DATA           1   COPY public.job_locations (id, name) FROM stdin;
    public          postgres    false    218   u�       v          0    25067 	   job_roles 
   TABLE DATA           -   COPY public.job_roles (id, name) FROM stdin;
    public          postgres    false    216   ��       �          0    25437 	   questions 
   TABLE DATA           �   COPY public.questions (id, question_text, question_type, difficulty_level, categories, created_by, is_active, is_custom, created_date, updated_date) FROM stdin;
    public          postgres    false    226   �       �          0    25572    results 
   TABLE DATA           �   COPY public.results (id, candidate_id, test_id, questions, score, assessment_id, company_id, started_at, completed_at, updated_at) FROM stdin;
    public          postgres    false    238   �       �          0    25499    tests 
   TABLE DATA           �   COPY public.tests (id, test_name, test_description, categories, company_id, created_by, is_active, created_date, updated_date) FROM stdin;
    public          postgres    false    232   )�       |          0    25402    users 
   TABLE DATA           �   COPY public.users (id, first_name, last_name, email, is_email_verified, phone, is_phone_verified, password, permissions, is_active, is_employee, created_at, updated_at, reset_token, reset_token_expiry) FROM stdin;
    public          postgres    false    222   �       z          0    25085    work_arrangements 
   TABLE DATA           5   COPY public.work_arrangements (id, name) FROM stdin;
    public          postgres    false    220   e�       �           0    0    answers_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.answers_id_seq', 96, true);
          public          postgres    false    227            �           0    0    assessments_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.assessments_id_seq', 8, true);
          public          postgres    false    233            �           0    0    candidates_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.candidates_id_seq', 3, true);
          public          postgres    false    235            �           0    0    categories_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.categories_id_seq', 3, true);
          public          postgres    false    223            �           0    0    companies_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.companies_id_seq', 8, true);
          public          postgres    false    229            �           0    0    job_locations_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.job_locations_id_seq', 196, true);
          public          postgres    false    217            �           0    0    job_roles_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.job_roles_id_seq', 1, false);
          public          postgres    false    215            �           0    0    questions_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.questions_id_seq', 96, true);
          public          postgres    false    225            �           0    0    results_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.results_id_seq', 5, true);
          public          postgres    false    237            �           0    0    tests_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.tests_id_seq', 4, true);
          public          postgres    false    231            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 4, true);
          public          postgres    false    221            �           0    0    work_arrangements_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.work_arrangements_id_seq', 3, true);
          public          postgres    false    219            �           2606    25467    answers answers_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.answers DROP CONSTRAINT answers_pkey;
       public            postgres    false    228            �           2606    25531    assessments assessments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_pkey;
       public            postgres    false    234            �           2606    25570    candidates candidates_email_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_email_key UNIQUE (email);
 I   ALTER TABLE ONLY public.candidates DROP CONSTRAINT candidates_email_key;
       public            postgres    false    236            �           2606    25568    candidates candidates_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.candidates DROP CONSTRAINT candidates_pkey;
       public            postgres    false    236            �           2606    25430    categories categories_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public            postgres    false    224            �           2606    25492    companies companies_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.companies DROP CONSTRAINT companies_pkey;
       public            postgres    false    230            �           2606    25083 $   job_locations job_locations_name_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.job_locations
    ADD CONSTRAINT job_locations_name_key UNIQUE (name);
 N   ALTER TABLE ONLY public.job_locations DROP CONSTRAINT job_locations_name_key;
       public            postgres    false    218            �           2606    25081     job_locations job_locations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.job_locations
    ADD CONSTRAINT job_locations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.job_locations DROP CONSTRAINT job_locations_pkey;
       public            postgres    false    218            �           2606    25074    job_roles job_roles_name_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_name_key UNIQUE (name);
 F   ALTER TABLE ONLY public.job_roles DROP CONSTRAINT job_roles_name_key;
       public            postgres    false    216            �           2606    25072    job_roles job_roles_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.job_roles DROP CONSTRAINT job_roles_pkey;
       public            postgres    false    216            �           2606    25450    questions questions_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_pkey;
       public            postgres    false    226            �           2606    25581    results results_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.results DROP CONSTRAINT results_pkey;
       public            postgres    false    238            �           2606    25509    tests tests_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.tests DROP CONSTRAINT tests_pkey;
       public            postgres    false    232            �           2606    25418    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    222            �           2606    25416    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    222            �           2606    25092 ,   work_arrangements work_arrangements_name_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.work_arrangements
    ADD CONSTRAINT work_arrangements_name_key UNIQUE (name);
 V   ALTER TABLE ONLY public.work_arrangements DROP CONSTRAINT work_arrangements_name_key;
       public            postgres    false    220            �           2606    25090 (   work_arrangements work_arrangements_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.work_arrangements
    ADD CONSTRAINT work_arrangements_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.work_arrangements DROP CONSTRAINT work_arrangements_pkey;
       public            postgres    false    220            �           2606    25468    answers answers_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 I   ALTER TABLE ONLY public.answers DROP CONSTRAINT answers_created_by_fkey;
       public          postgres    false    228    4803    222            �           2606    25473     answers answers_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);
 J   ALTER TABLE ONLY public.answers DROP CONSTRAINT answers_question_id_fkey;
       public          postgres    false    4807    226    228            �           2606    25547 '   assessments assessments_company_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
 Q   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_company_id_fkey;
       public          postgres    false    234    230    4811            �           2606    25552 '   assessments assessments_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 Q   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_created_by_fkey;
       public          postgres    false    234    4803    222            �           2606    25542 ,   assessments assessments_job_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_job_location_id_fkey FOREIGN KEY (job_location_id) REFERENCES public.job_locations(id);
 V   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_job_location_id_fkey;
       public          postgres    false    4795    234    218            �           2606    25532 (   assessments assessments_job_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id);
 R   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_job_role_id_fkey;
       public          postgres    false    234    4791    216            �           2606    25537 0   assessments assessments_work_arrangement_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_work_arrangement_id_fkey FOREIGN KEY (work_arrangement_id) REFERENCES public.work_arrangements(id);
 Z   ALTER TABLE ONLY public.assessments DROP CONSTRAINT assessments_work_arrangement_id_fkey;
       public          postgres    false    220    234    4799            �           2606    25431 %   categories categories_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 O   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_created_by_fkey;
       public          postgres    false    224    4803    222            �           2606    25493 #   companies companies_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 M   ALTER TABLE ONLY public.companies DROP CONSTRAINT companies_created_by_fkey;
       public          postgres    false    230    4803    222            �           2606    25451 #   questions questions_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 M   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_created_by_fkey;
       public          postgres    false    4803    222    226            �           2606    25592 "   results results_assessment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);
 L   ALTER TABLE ONLY public.results DROP CONSTRAINT results_assessment_id_fkey;
       public          postgres    false    4815    238    234            �           2606    25582 !   results results_candidate_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);
 K   ALTER TABLE ONLY public.results DROP CONSTRAINT results_candidate_id_fkey;
       public          postgres    false    4819    238    236            �           2606    25597    results results_company_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
 I   ALTER TABLE ONLY public.results DROP CONSTRAINT results_company_id_fkey;
       public          postgres    false    230    4811    238            �           2606    25587    results results_test_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id);
 F   ALTER TABLE ONLY public.results DROP CONSTRAINT results_test_id_fkey;
       public          postgres    false    4813    232    238            �           2606    25510    tests tests_company_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
 E   ALTER TABLE ONLY public.tests DROP CONSTRAINT tests_company_id_fkey;
       public          postgres    false    230    4811    232            �           2606    25515    tests tests_created_by_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
 E   ALTER TABLE ONLY public.tests DROP CONSTRAINT tests_created_by_fkey;
       public          postgres    false    232    4803    222            �   F  x��\mo�F���+�~�;�!�}�BQ�M܃{y�8�އ %Q/������Y��kR���c��� ��������3�CQD������7i��(�dR�/��.�ɷ�X�����/ ��H�r���y�'���2�=���o�=$og�q��$��k�Iy/ii���E�O�e���a�]�DՈ&���Ҁ�U#�CjS�����'?A��T��
�PL�s�kڻn�`�V�,�
>'��ZfR�5X�� 0٘v/�J&�2���K�sf�.Weqi5FN6F.��S��+E�2�|ګ	��f���D#*BC�����=�=>stiz\����!Մ�.�%�.s^�$[UA]�f�&`�x������ 0ͧ�$�� ;�����e\�I��Y�J��
n�ir���7�����2��'�X�7�y-4+�)�f ���'�FD���R�+�|6v�\e\^K�ufET������.�wY�k<M��Ĺ��{���>�{L`�{�W��EP&Yrلp���7����\}.���Q���#�C-(3��i��TL�8I��C>�Ƴ�Yo|��yRWA�J&)į`��2^-�ǸLb_��Ef�:�tP��ʁ���2)��ظ-"F��'�s]dN�LZ!Fs�@8B���A�HB�0=����u�+�쀮{S����x���(�mJ�B�2D�&��l��"�#z2�|�u5�)���=��#����ՌXJY�ÓГ��ï��BF4'���@�*D}��#v��>m2�/G��Ei�-�q�%�|~zzɱ�"�|��u�A�r����u�5�o��%�U0���Z�����:��8qr-4o��a��� ���'�$��2jW��B�o����1�T�H�o�L-�N���+U㤂R�N'=&�#.B%�P�� z���j�6���ZTP��<۰�u���쀈mO@Y���F�&[�H�=m�'�w��K$_����2���*������ڙ6�氷���ێEf}e�h��3��6���$	��Zu��a!z2g;�3�I��}�ȳ��)�i����n6�:Ca՛��xW�o�F��r�^KoS�y��"���ۡs!����HYX-q�l��um��_���m�yaS�8�ݢ��ǯwc�|�w}n*��*�U�N݂�&�aӍ�E9�s(��͎{e���6]�e2M�ê8~���J��t��f�#��}n��.V���49""�s�&m.�E��"c��6�6<ö���G����JMzL��lb���.�kV�,��-V�묾G$)mh���a���5�HXNO�=fP��ZFm�g���f�?g�$��塞����-����H����aoqдP�ɐi�x�(Å0���u��H� ��m��V/�����B�2��Sڇ^�����9��M|�6~�����jf	P�}�[n��5U>h�hD��nt l7���m�no+�t��*3��3�pM��� �ps�Sz�|�����" 
f����~��Q�s�;huۃy�z�e�O�oom�� ^����÷h�V~B�V�����v*!s$����ϳ����ͅ�/�^��?�s�o_�����^�ۈ�P)��0������@I�;��X�L��ܒ�w����cS�Wp��^�P�M�:�q��w��a��'���� ;�!^'��;��$��"�n��f
���m��v��J��aI��&�C�ʛ0�m�����ɽ���T�PF2R���"��GDBX6FhD;� >����P�9"r!�)�>����_:.m2��J���q��vX�e32!n�z���T w],-׍봚�6�o���,��Z@H�<^��昐�iR;�q���4�t�$�!"���h��r!�9�>�Ө�Ì�X�FBC4㝌�@P�S\=��>�#����7\C��>\�iܧ߼mB����gk.��B�K~��~�~ɴ��=����,�� &���an�'K��44�P� �G�͒A�B�9���aA��%�BR@�1�x�a�e1� ��#BCE�����CR�BPb(ńl��.�Gb�A*P�:3����r O=H%���搃Ugo9���d����:
�S��ǧ�꧓�}�l���$5=	�񰧑ϑ���\#�Լ�� �4��:fg>��LD�D=��aOc��wڭc�``,&D��k�%A�d���iz���eXxe_ta\�nzr ,)�O�Tw�o��T��ڞ*%i${ ����R}�S�G���4�'�E��i�q������aɑ|�z�q)0@d��VT�@X
$�ƥ�ƥ����#J�W�ԭ��oBXJ$=�b� �~OnH>����ݺB2ʽl۞�}.�KH��klmof-�-�W�{���r��co[&������%����E�����?�]�q�)iX�$U���wdw[6�#5�\&u��_)I��(��.��Br؁ PH��W#b�l;�R#9�QG�l.���� 9�QG��P%�]����v�B6��s�q�k+�԰G�>���/q@��Ej؃i�T��Y*A"�aŐ���QH�Pq�i�W]+�԰�~���fX��q!�R�~WO���5*��}�J"u$�?�ȑT������:��|���4�4]�W@/I�[:?��ɦD���~��׬�x҃�^<[g]YW\e�mp�J#���8{y����c8��k�����!�/����s�E��^��Aʧ������/=��mQ��2���ܯ�|^�����p۾N�l?HA
睍�@XEH����������������.��
�����e���U��ྊ��mws!�	�>-h�1�&H@�t[����F�$�^��2���\�r"�=+���inʰٮۿ�q���E�-�����?s���S�E�~v!�)�>�牍�~6��yY���[��j��i<=�؟=�e�NB��ꜯ��i��mv��E:}�S{>�+��
\�wI��~I��C�|����;�ʢ�ΐ�:�ʅ��H{~��,�gx͋RMK>΃ޞ{G��f�jO�<����vVt���h�, $m'&�x�$�����9�Aش��7M��~�@ĳ}�l+�'� ��!�"�9�r!��>�^F����3�$���_)m�ƥ�$k��.�![�SK����2������ʗ�9Bξ@��=�6�<4
L���������5#!BN�6���@Xk�}ʁ|�'��m���*��"Kb_#��#G;eLC͘&�f�a!�Cl�_�>{�������o>�����g?����ޯ
?qv}��%T�k
�Eu�T�6���q�se�Ē�.��^j��j=^�U�?zvG^ڐ�/uOZ�ޓ�����F&�a�%"��}_�$��&���;c���Iy]Y�w�Un��~Qq~g�9|הR�f.�!N��[���	%�Z�	�a#�v�Q�G���uJ�F"3t+�*�RK��:.��Bf��;I����F�$�B�hd�>����\���ac��+��l�GG�31�&B��x<]و�PN;G�.�#��S��WЕ�PH�;m\�E��Gx���j&��U݄p�Pt�����4a�9#t�C�c�1�?�8      �   Z  x��X�N�@]���b[H|��x��tQuYuA�.J�v�!�C�Pʿ���.ꃖ��x�3���2��l\�S�sv��U6,'�T��ݻ=:ګ��>.�f�j�o~_Κ��W˽/����CZ��[F�D�B�F@� � �� &@ �ܠ��ܠ��ܢ9,�#�s �:ʢ�,��"J,��"J,�$\|]�v��q2ʖ�͏weZ���O�~suOY'��x����'�b0(Ng��f	�}U�T�,�˓����Q�����h�j6���0�Ñ`#�����<M�yYձ���L�~RUYU��q�v\���ȞDkI��:�"?�@��"b�h�8������Vwn󙺹-�����ъ٨����l�]�d�����j7�{Jj��dS���]7�����s��o(��*1��E�"Z���8�=]�}B����h9BG1<
�Ĉ'FD1b�U!!���T�T����l�����9���z�6H��w�b2\JkC���EV����>�b�\	��7dW�I$!	}�$$��$��D�HBIH"�)4�B*4�FGit��G�TB\iĕF\iĕ�v{���7����Y�f#4�����zz^ޓ}��x]zK��6�ѿ*�?!�g=����S��&�pUr]j��]��@/�_w,���H۫4e�E{�Y�L�
zDY��h3���?t�����䯫~W���_M���jr�]ДC�^�F�� �Q������-���O��]����w���WH�-Y��M^̾���f�rLԳ�
U��H���u�"�E��`����H�`>��h��f˘��1���yE0�v�"�E������s���,�h-�0sOE/!Z�w��<�;W�      �   q   x�}�1
�@k����V�<$�a�`����'�|�`�a�����[;_7��>����w�I�6�ZF`в\�������ů�M���!�T�(�.�ԑ�q��ְ�(~
3�D�D�      ~   a   x�3�v��4�,�4202�50�54T00�24�26ӳ0232��#�e��X��Z�����S=#KsKS<R\Ɯ��)��0�3�0�4���W� �;){      �   �   x���A
�0��uz�^�03�$&k�z�n�V�V�zz[Ј�Q�?y_a�Ķ\v�!�gQ-�	�	b	��y@I &��8���EAb�%��>���P��6���|B�03�I$��s	���<���8�E�K�ʢɥ��64���A�H�SK�M�07c��!V��u�Mɰ���_�"�QVd_o��T2�7��[�CV���)=�JEq���      x     x�MV�v�6]_��U�H��&���8��5e�4�����I@	+�����]�8��q���˺���V�D�=w==�dd*Ά�P�P.�Lk�#Y uv Y̺��i�srߒ�ę�>�5���x%��4;X��!,�ې��q*Ω��&gi�怦�US/�B�)j-�Jq�r�b�i?ʸf��x�
���$��%�8��~��������;�ξ��	��y�cXwtԃL`�y��L`����ǢO4Y��,{�j���ml��b�Ɛƍmq(M+g-��B��L\ rRt����L��v~3�Lsq�S+��p]� �����7|o<Z��d0n���mX��#����A��|��u� +2�7���	�3~��v���j�#Lo���)�G5ڭ������>Gs��`Wf%t�H�Ef���]o����j�юڰ�|����y,.�yv2O�ew��2O��54�.�����i�H�]ymn�ťӳcX��i�\�y	���FGo�G�!z��9����w2����k�c�Z|�ߵ,VX+�"����E"��S#� ��ĕ��c����A��김�R\9��l�(����W#q#����2>���z�������)S�4"Wf�5�w�2��A!dY��
ޖ��6\fe��5�P�k�AV+^�*ƺ�q=9R��Rq=�p�U&��9=U�㓅�b]˨7t��>�EU�eЬōvz�0�z%n��:7��A�N�-�>���}Xg�V�o�:���[Y�Vo��%C�_W (�Y�iV�����{Z8f%n�O�����uGӖ��@{�x�©��V�*��*g�U
3/����0D�ǋ�*lz���r}5S�����>�;� �}�Ck_�	k(heA�A'gOT��op�zp���~xN�6�[(i�u�!���kqG���]���bq�v4 %@hSwz��N��o�BI���;d�R	� �XP��w��}tc��bp�"��jC���C��� v_�?�@󱸧�e����{؄s`B 5�IU��h�e�3�D�p�q�~�&�/N��R�+~&8�,�w;h�q��{���x}�A �I3W8���K6A�~
	>`�s�`�э��)̌;��yT�/�~�'�I�2��.3����K ÆF��5�A̜6H2ذ!�����{lo�� #6�[�9
y/6\'�Pc�A�3�öW�zX!6ZatG�
�����;d�P�/�h�ef��,��W� �q
�
Vl@��iZa#9m���ȍgֈ���.�te�ttK����IΠ��px�l��U�W�z>.��7�A�k�{>�\�w�����k2�%�`�uO�t:k�1�d�E�\[̪̹F#�~%��C�Ԇ,�톂F-��I|'�t�ѯPy S�������+(Fp�c��X��j`��h��ڐ��r���/������Z�рoO[�-&�g��u���K����+ �'24p4��s�v�g肉�P=G�! )OZ͈<p&�V#���m�r1��7��+��)�O�      v   p  x�}�I{�8��ʯ�)�^�P$x�{&�Ֆ��=�\`�Ц������ b�����+��B��^���/_n��k�.j��e��,���F�x��wJ�T%�Z�K��je��f�<�r��R�RF�Z���y+��f#���'/-��H.k��'�9�	�S�h�dū䁗[<����Wb'��z���o*������~��>y|}�%���!�j�S�j�o���ʀ\�V��]�3��#ʡ��a]:�<m���3R���Yd�:�Y�"����bݧ��h��{b�'Q
���������%B���g�XZcH>�l$�+�mE��Bq�o%��S��~��n��P�Kt6�Z���������ⅰ �j'�h�i˦�HBy�Qd�T�0`�j+�p�A�Wu�z/P���
��0N8�vCC�_QU��Tn�ϲGU��>�TK�z�M)*3�Hq�3�M��N`�pd�b!}6��j{�x{�����f3E�ˎ��#�U;��\f��)H�l)Wj��R��H�o��^��l)�3Yl����p�Z~F[ռ1!�H]�Zt��F�!�L������9�ϴ�����}�ڝ)��h�QƮ�����8��[h�n�K~+=c��^��U�r���G��9�':Lm?�2z�g��q��3��Fb_�h�=�l�צ�%�qhå�-�GʷA�w�U�E'7M�:�]1�{��X�ݸ=�������/���GO�q-��k�j�%�fl���'�oB�0U�OH����荪Nn��#��w�K���	_����)�Uhz��­����e����`��G5����V�i�VC�G���Q�t�<i4)��>��![�pX��"��d���Tې��?�9Y���Z�m��&{��fi�=�Q˯4`���2} �#�:D;�"IY$�d�Ed_�W��S���GIK��ؽ�o-g'�CX���;<-�N;,�:�F�O��2�����{�5�~�e K�����2�v3I���5=;Q�Ƴ,N�g�7�u;�/�U�	̂�}�]�<�/���G��-��΂l~j���O�oh��6~*H���v�8��򼓯�,;�}*}�nk''i�?�ɫ)�[�*�Gǝ;�:e�9!&���:w�r�7�prǛJ*�;�j+�k �Y�p�ǘ<uƛ�]ba�>�Vn�t����3�T�C�d�����3��1Җ�?����J��ҭY�d6/oDfj�@c����g&ӻ�u�����8���Q��[�C��e��+B�$��&��xe�:/����]�Ha�1��۹�x�F��5zu7|�x�lw�FI-z��^D��_�´g"o��6�x�U���͍��Z%��L�z7���mdEbLV/�>����s��E����t��Aln�K���RYv&B7v�Aƈѭ�E��Hi	э�f���Y3�"�9��yy)k�SN�we/�d
�����b9�| �=��D��*��l��5���0��K��+��s �<<"�
�~�K�1��3�z+h��}&������\��#qL.ү�~�i�E>����w�%�-�g~PC��F�n)VU��~t�ΉÛ~����5����{t�}��h�C�E
3��^ӌv�9�h]���}P�9��~ȳ�J)���Ձ�ZZ������916�趺5�Eo���^�e��R�� �/y�����}9���2}��lr��ۛ�g>��~����bg�98���wL��:�z��y�l�s�m��%�+#��A�W�B�+A{�� �G���5r���n%mVԡ�z5��7a�t�6����"mn5�PL�yq1����*��S����#ug���Բ���<t�j5TAp�q�;2������Vh�@���!�4�m�b�-x׹��K(N�|D#��^��1�A� |GO���;:|MH����L��`7�GCʽx�&V��8׹ ���O��Co�#����Q9�~O|�!�<��+�{"��?}�<�de�S��q$���fۗ+ �5�yP��[k�sf�W0�V��5֒	&��u�������d�䁶�F@?�����}p��e���8r���
�UP���N-��.㯩r��u5��z���PK�$��z;T�����z��B��6@�v@�[�h葰�|�>��l W�P9�
��Kg]jdz'�}%���Y��=ݯ}� �wÎ7���f��q�z���x�X�$0X[��c��<z��e0���8�����u
��yhu��rp�>96blFz���9\����_���%Ӻl����[�ߑu6�,6�4g��F��'%�|�4b�̣7�3j�+�n
���G��h�<ל��t�0@�6?��w����^�/���/w�u61;���f N+��޴�}P�~�@�8;!0$�2�:�狁0W�℃,Ww�h��d��J��X��B�'$9��Rd����^8��w�N��� l 
ڮ����'�8хhʀ��]�,����U�R�{F��'�w���eT�@Cc�bNڡ�N��8������t��&� ~O��!�H����� ��R�3�#��<�'��@zG��;�1���f�2�aM;:���rk:����v[�<bm��L��L�E&D�4���;�R8�>��X8�90]�iH�2W�]pE� o�Ϡ�y���\��N�hʀh��>G~Y�8��,���[��^ {�lЁ��6�Px�'{�����2 �����f{�?��3p�W��Ry{�K(u����S�r8V�Գ@mD�*_�&��t������}R9����C��@N_�K�p`,�Z4]९JѹA�|���T���6p}[n�a�tq�O@e<s���SZ�T��C=Ti�+>�o�u���=�oY7�{a�[}���=Pe�f^�HS3#���%棁���Y����혥������<)} �e6�5o*�hcΎ~ꙍ��n���Zr"��0�&��8Mga������X�j�pmG��4ŀI���D��_ ��l̛��_�O����h�b��yl��"#`�К?&�Xco������_�$#Z��������X ���&���$6�{�%��gs�d�fU �`������A��ˇ�!���      �   �  x��Zko�����
-�&8oR�P�#Od7M�h��@1�Fa�����N���{��="%��l�e!����}�32��sk�h�l�~�ST7�\EkW�m���Ϸ3k�����fb���3�0q��J�D̩�sS��J �fo���˻:2����a���`�x�T���)j�B@=*��Z@��o��Q��Ѿ�w�z���j�j�u��������D
��6�S��ʲ^� "b��s����O�����j���}��zm������4E��3p(m�͗�<�}e�M������d.dL�f�@D�e��7e����ҧ����~j&$��y��L1ʳ����&�	�*��+Lǡ��ަ��s�c�S�� D���滽������Q�\�8cZ�^� "��6o����hk�}T[S-��-7yi��V�S�`5<��f�!K|�$��f��7�2l�zWGm��G�.�p$W��./7S��y��J������[��{���7�䮌���J����r��<�SJ%���z�v�����m�����r�����ч��1��v�9h��Z�WD�ߚҕ��������q���ޖ0z����X�����u}��ˌ�
S�S� B�콩�l���A��HV�}�:�e��y	�3��m �)�X
B(���P1{gwnS�=�y-�08�W��BKU������m�92 ��8>A�����ٴ4�a^�㗃�,f���FD�qtb���P&�].�尯�0C.2�._���y2�*�I�m�"�|�V��=sg\���Ηb�9��Z�^� "4=�R��9%"��$��2�m�"4;W�*V�}�RXXAI,e"��6!���ް�ya�k��a�{=h�E�o�r[��J��4a���C��FYm�.���&;��:=��e��NA���$��"�];�����Ne����h���ؑ1SY�z�@��A�T�rsӘ����@(*
���!D�x�8���9�����C��3ɜ�+묧iB�0yq��-?�)a�\rh��1B��{�K_A������YV���ݡh�}qTT�R?�,8��'o�{���C�g�=�eʵT���!D��a�B�\	a+[�{�Q���8Ԩ	k ��7�Y���j`���ȃ|9�MJͻ�,�t�)��?ד2nZY��Z��ѯ�
'wo+�T���-T��+<����M�)t,3�z�1�ˎF*zf�LQ�\+	rH�f�ԭP9wS�5�*�;Z��5�C�9��	dN��r�{'@�'�7p���ť�mxo��)�l�`�b�$&�%�E�g��˳�I��Yv%�W�I"R�D8�l��1�A��X'Z�� g�/;*z�l��=#B���nvLT��UI�$�uWs.G��Q!)�^p����"\Mv�}'w��3	�f�]�!D��}����++�,�{��6��c�d{�f�w�-�Ͼ̭�b`�NT�h���R�6�a �Y�-��7��LJ��MQ`��ٮ�|���wl<��K 1��_�l�(�R��W���"�w�i�`�+�*٫� "����i��a 	T�&K �m��
�%y���7o����Zl���������5�Ͻ�ERP�퐓*M� D�k�G��(�S!�L "�\	��#=fBf���DD6��cdP(�4�: �L��[��0��u��"�3}z�k4�z�Ή� �9��o���#5�!"?���"�a$Π�{�@D�>�?�
M��p���"R�$�_���7��usd���T�\«KXTb "R]���
���|�6E�kb��!����>D�5�O�/�`kJP(p�%>�lكs��ˮqxٟ%2�ͯ"���L��Bg���!D�r0�&�1xh�)��]�x����	�����WS(�4fR��� �����m�e~��쭩���m�i�]V���$���Ќ��v$��!���kN��so�PQ�/*���b@�Wnl�6���NG�X�<� D�}����
� �]�^�=���c�z��g�v��3�V��ʛB�ߩ�����!��컏�<R�P�v�0�� bwRH�+�º�B�=�oE��k�ka�ݝ�l���'�&<_\F�O�,U�8��"J��Tؽ�R�E�*����;b�(�9h���X��p~��ч�>B��a止۟������]g��7DTz��2�9��]�`��	}p������Bi��
"��ʮ�y{{W?9�eeѮ�h�3'=�{,�1|���W��UBD'�d`Pm����;�����2�ݝ�M��+z^�A�&��q|w�r�f��f�ב����I�_���ӔÏ �.o�t���"S���n��f�V�ri�x�5�Y8<(޽+���@h�����u��;k$W��V1-���|H�C"o���s���K�d ���I�iڝ�!D����}��w1Hʥ[�M�F�(aduR�-�Q�����G�ԷN�B�<Q}'BD��k8Z��<wڙ����0������BD_�4f�?}����@���:�z:2�Hzu�����R�R�f�ժ;lC��48���x{~��G�p`o`u�D���!DR6��+��G�q��⑁��EѺ�=�Hʃ�U����;\�k�{s%���Jc�`�t�B6ͭ�듾�0�Af֐��Ww(����(<���c��e��ۋ���Z{�˼��y��u��9�H*�<��i/�a�n�FN	J�K��� Iչ&<Sz��7��f����r8:�}�/V�9Q�K���:���{Wnܻ7���q��L�,�@���a�D�c���$L�B2��;�H���;�=�}� ,�ӵG��U���8���"S��	!�f��}[A�4���M��nV���
�-��d
6O��y{ "Y�쫞�8g��ݧ�]q�ɘƁQ���{� �ѧ����g�ɴ�3?+�iw����,T��z������!��42�3�\��D�B��)�      �     x�ՓMj�0���)�׉�_��'0��z�MB��.��^%]l�ԐMw�Fzz�	1���u����ُ��Թ�kJ1\��8���c�{����\���g���j�A�V4��u���x_�������bVv^|(��e�E̢�AE���L6z�;�J&���E���S�������[xֽ<g>u��9�#Wx�������r��<���2޽ @Ɇg�Q�\
B��B1����d�i^j��5���O��f#`��Y�Y�ӀLi9.������w�Z���^       �   �   x����
�0F盧Ȯ�76�8���.�-B�&N�[šC�:��9p�!�7;����~mR������F����琢Mͻ�?j�|{�NۅO\�4$ I���@��xSz"�l�
3���+3�ap2��P�T���yt��R���9��ALú�g�?cUcQ���I�L�A�(co��$      |   l  x���Io�@�3���:̮�ZD[�c��e���4ʯ/�=��j2K޼�|O+d*����׵VA��6V$aB�4OE</"X����Ҋ\_���L�SD��xg�c��H�i��r�`X������|c�i	�B/�V!��
�r�U37_l�Jg��� �^��� �ڷN+ǵ-;ɺ�4��{�y�#�z�tz����`������2��<h�Vb���[}�$����V�.�E�U�ju<�+��N#��D���S�����v���[ia�EY�?��ꪥ�Z� �=�c��ܞ��Q ��}f�R�c�o��8sVp���|kM�c�Ⱥ3�9��U!�����+v
���,�!      z   (   x�3������K�2�J��/I�2���L*�L����� ���     