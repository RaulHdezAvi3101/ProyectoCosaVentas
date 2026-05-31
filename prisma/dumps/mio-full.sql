--
-- PostgreSQL database dump
--

\restrict RFr1B1V6ckJEXKsfOzKovodxYYtKesuVTG7OcpMya6i0bJw0VnjdixUwqmoerHq

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: mio
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO mio;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: mio
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: mio
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'draft',
    'active',
    'live',
    'locked',
    'sold'
);


ALTER TYPE public."ListingStatus" OWNER TO mio;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: mio
--

CREATE TYPE public."UserRole" AS ENUM (
    'user'
);


ALTER TYPE public."UserRole" OWNER TO mio;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ClaimAttempt; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."ClaimAttempt" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "userId" text NOT NULL,
    "phrasePreview" text NOT NULL,
    "isWinner" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClaimAttempt" OWNER TO mio;

--
-- Name: Listing; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    slug text NOT NULL,
    "sellerId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "priceCents" integer NOT NULL,
    currency text DEFAULT 'MXN'::text NOT NULL,
    category text NOT NULL,
    condition text NOT NULL,
    "imageUrls" text[],
    status public."ListingStatus" DEFAULT 'active'::public."ListingStatus" NOT NULL,
    "firstToClaim" boolean DEFAULT false NOT NULL,
    "claimPhraseHash" text,
    "phraseHidden" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Listing" OWNER TO mio;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "reservationId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paidAt" timestamp(3) without time zone
);


ALTER TABLE public."Order" OWNER TO mio;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "winnerId" text NOT NULL,
    "lockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentDeadlineAt" timestamp(3) without time zone NOT NULL,
    "releasedAt" timestamp(3) without time zone,
    "bullJobId" text
);


ALTER TABLE public."Reservation" OWNER TO mio;

--
-- Name: SellerProfile; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."SellerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    tier text DEFAULT 'nuevo'::text NOT NULL,
    sales integer DEFAULT 0 NOT NULL,
    "positiveRate" double precision DEFAULT 0 NOT NULL,
    "onTimeShipping" double precision DEFAULT 0 NOT NULL,
    "memberSince" text NOT NULL
);


ALTER TABLE public."SellerProfile" OWNER TO mio;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "userAgent" text,
    ip text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public."Session" OWNER TO mio;

--
-- Name: User; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "displayName" text NOT NULL,
    handle text NOT NULL,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'user'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "legacyGuestId" text
);


ALTER TABLE public."User" OWNER TO mio;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mio
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mio;

--
-- Data for Name: ClaimAttempt; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."ClaimAttempt" (id, "listingId", "userId", "phrasePreview", "isWinner", "createdAt") FROM stdin;
cmpqduogp000c4pkvnjjowfs6	cmpqdu1a800044pkvh3bqfmc5	seller-1	mi frase clave	t	2026-05-29 03:49:15.481
cmpqdwm3i000p4pkv3fwp4ocy	cmpqdwlnr000j4pkvcrdxjd5x	cmpqdrch600087u6dfbmvjxkx	pikachu sim 2026	t	2026-05-29 03:50:45.726
cmpqe1h9f00124pkvb8qpbvgt	cmpqe181e000w4pkvs2sfw09u	seller-1	mi frase clave	t	2026-05-29 03:54:32.739
cmpqe4v9b001g4pkv6k4007az	cmpqe4rso001d4pkvgb4npoxf	seller-1	1	t	2026-05-29 03:57:10.848
cmpqem7wr001y4pkvylyy7z2f	cmpqelqbj001s4pkv2q7yy6eh	seller-3	123	t	2026-05-29 04:10:40.395
cmpqeqcgx002d4pkv1oblk8cr	cmpqeqbyg00274pkvl16mkbjm	cmpqdrch600087u6dfbmvjxkx	pikachu sim 2026	t	2026-05-29 04:13:52.929
cmpqerf3t002t4pkvgezcydtl	cmpqer126002n4pkv1l7ev97v	seller-4	12345	t	2026-05-29 04:14:43.001
cmpqetivn00374pkvkpztlsu6	cmpqetifq00324pkvqclbax87	cmpqdrch600087u6dfbmvjxkx	pikachu sim 2026	t	2026-05-29 04:16:21.203
cmpqevzrf003k4pkva4zgwe99	cmpqeugqz003e4pkvt16icriq	seller-1	12345	t	2026-05-29 04:18:16.395
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."Listing" (id, slug, "sellerId", title, description, "priceCents", currency, category, condition, "imageUrls", status, "firstToClaim", "claimPhraseHash", "phraseHidden", "createdAt", "updatedAt", quantity) FROM stdin;
cmpqdrcmn000n7u6dcp6zmsph	listing-dunk-panda	seller-2	Nike Dunk Low Retro — Panda	Talla 10 US. Deadstock con etiquetas. Sin probador.	2100000	MXN	Sneakers	Nuevo con etiquetas	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.175	2026-05-29 03:48:03.976	1
cmpqdrcon000p7u6dtvc1629n	listing-prizm-live	seller-1	Caja NBA Prizm 2024 — Hobby (sellada)	Caja hobby sellada. Drop First to Claim en vivo.	5800000	MXN	Deportes	Sellado	{https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop,https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	live	t	$2a$10$oVExegtJE5.IJMb5KiFMOu7cY5rPSywHd8BjWq2ifyqe9Ocpq/Ny2	f	2026-05-29 03:46:40.247	2026-05-29 03:48:04.038	1
cmpqdrcqd000r7u6dkns1vt8u	listing-funko-chase	seller-2	Funko Pop! Chase — Batman (metálico)	Edición chase en caja mint. Frase oculta hasta reclamar.	85000	MXN	Funko	Mint en caja	{https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop}	active	t	$2a$10$vfnzIlTHZ1GyzqMk.LKo.OVj7lxY9iTtOh5wWPbZEnDGUwEY0aYwi	t	2026-05-29 03:46:40.309	2026-05-29 03:48:04.101	1
cmpqdrcqf000t7u6dul0sj8tn	listing-vintage-comic	seller-1	Amazing Spider-Man #300 — NM	Primera aparición de Venom. Encapsulado, sin restauración.	12500000	MXN	Cómics	Near Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.311	2026-05-29 03:48:04.103	1
cmpqdrcqh000v7u6djjqjwyd0	listing-airpods-max	seller-2	AirPods Max — Space Gray	Poco uso, estuche y cable Lightning incluidos.	720000	MXN	Audio	Excelente	{https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.313	2026-05-29 03:48:04.105	1
cmpqdrcs7000z7u6dd5zocooo	listing-sofia-nuevo	seller-3	Lámina Gengar VMAX — primera publicación	Mi primer anuncio en la plataforma. Carta en sleeve desde compra, sin jugar.	95000	MXN	Pokémon	Near Mint	{https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.375	2026-05-29 03:48:04.171	1
cmpqdrcs900117u6d3pwqrdyy	listing-raul-baja-rep	seller-4	iPhone 13 Pro — 256 GB (sin factura)	Funciona bien, batería ~84%. Sin caja original. Precio agresivo por liquidación.	580000	MXN	Tecnología	Usado	{https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.377	2026-05-29 03:48:04.173	1
cmpqe181e000w4pkvs2sfw09u	test4-e181e	seller-3	test4	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$U5l8InzWVbWt1Nq61TtDo.WUBHe6G5Ho4EEt7yLfpFmCbloF1uYH6	f	2026-05-29 03:54:20.787	2026-05-29 03:54:35.052	1
cmpqdwlnr000j4pkvcrdxjd5x	simulacion-agente-03-50-44-dwlnr	seller-1	Simulación agente 03:50:44	Producto publicado por script de simulación (First to Claim).	249900	MXN	Pokémon	Near Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$weW.MUKE4LgK50J3oK8gqObZ352sCCcuxW7cY4QusGHkErFxTZU1y	f	2026-05-29 03:50:45.16	2026-05-29 03:50:46.865	1
cmpqdrciy000b7u6dlapdixu3	live-charizard	seller-1	Charizard Holo 1st Edition — PSA 9	Carta icónica en excelente estado. Incluye case PSA original. Venta First to Claim: envía la frase por mensaje.	1850000	MXN	Pokémon	Graded PSA 9	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop,https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop}	live	t	$2a$10$fCDrrobXHs4VocSQCOTKMeSfwbMdYLk/qkXZ8xR6R1igIMA/aNuZm	f	2026-05-29 03:46:40.042	2026-05-29 03:48:03.837	1
cmpqdrcj1000d7u6dgv1mdmiq	listing-2	seller-2	Jordan 1 Retro High OG — Chicago	Talla 9 US. Caja original. Usado 2 veces.	890000	MXN	Sneakers	Como nuevo	{https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.046	2026-05-29 03:48:03.84	1
cmpqdrckq000f7u6d9gqi52ux	listing-3	seller-2	Mewtwo GX Full Art — Mint	Sin rayones. Sleeve desde día uno.	120000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop}	active	t	$2a$10$.zMYD4nrDwFOn7QW55PzNukcN1L8ESZiGyLpUc8c/1xGJN7ZfeHv.	t	2026-05-29 03:46:40.107	2026-05-29 03:48:03.905	1
cmpqdu1a800044pkvh3bqfmc5	test-1-du1a7	seller-1	test 1	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	live	t	$2a$10$WfT98DGZb54CHFSb098rK.lhtRuPFZ/FK/wWQe3PesrMkkJ1l89uy	f	2026-05-29 03:48:45.44	2026-05-29 04:30:39.738	1
cmpqdrcml000l7u6d3b49l0eu	listing-pikachu-vmax	seller-1	Pikachu VMAX Rainbow — CGC 10	Rainbow rare de Espada y Escudo. Certificado CGC 10 reciente.	3450000	MXN	Pokémon	Graded CGC 10	{https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop}	active	f	\N	f	2026-05-29 03:46:40.173	2026-05-29 03:48:03.974	1
cmpqdrcs5000x7u6dbyuq641c	listing-rolex-style	seller-1	Reloj automático vintage — estilo Submariner	Movimiento automático, cristal zafiro, correa acero.	4500000	MXN	Relojes	Muy bueno	{https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop}	active	t	$2a$10$hNNBnYioxP0cxR802Tzq3.Fj/OCM/kGQMkQjeBRSZThOVxrfxcqwW	f	2026-05-29 03:46:40.373	2026-05-29 03:48:04.168	1
cmpqe41kt00194pkv7bgnkykr	carta-demo-first-to-claim-e41kt	seller-1	Carta demo First to Claim	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	live	f	\N	f	2026-05-29 03:56:32.381	2026-05-29 03:56:32.381	1
cmpqe4hvl001b4pkv7rb0yr78	waht-e4hvl	seller-1	waht?	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	live	f	\N	f	2026-05-29 03:56:53.506	2026-05-29 03:56:53.506	1
cmpqe4rso001d4pkvgb4npoxf	carta-demo-first-to-claim-e4rso	seller-1	Carta demo First to Claim	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$bp7vuKytePxz5w.uC.BgVOTY/e0zPOoEiMnQFQEfW1j64uZ3S3uIm	f	2026-05-29 03:57:06.361	2026-05-29 03:57:48.332	1
cmpqelqbj001s4pkv2q7yy6eh	123-elqbj	cmpqdrch600087u6dfbmvjxkx	123	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$MYuf1/QHAzkoiBZg08bcZ.tOCqyzZq8.dReDMHw0USQFCucsawVv2	f	2026-05-29 04:10:17.6	2026-05-29 04:10:43.639	1
cmpqdrcmf000h7u6dzhgnzifa	listing-locked	seller-1	Booster Box Evolving Skies (sellado)	Caja sellada de fábrica. Ya reclamado en demo.	420000	MXN	Pokémon	Sellado	{https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop}	live	t	$2a$10$aIq.uyh/ULXoCfOByC91fe4MRrRh1ZkJOFsVIKaWbIv58pIgk9hDm	f	2026-05-29 03:46:40.167	2026-05-29 04:30:39.725	1
cmpqeqbyg00274pkvl16mkbjm	simulacion-agente-04-13-51-eqbyg	seller-1	Simulación agente 04:13:51	Producto publicado por script de simulación (First to Claim).	249900	MXN	Pokémon	Near Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$Zm3DttLl52kCTt2ilm5hTuh5qxtjQQR5nR2NesTzgn1O9N9CtN3eO	f	2026-05-29 04:13:52.265	2026-05-29 04:13:53.873	1
cmpqer126002n4pkv1l7ev97v	12345-er125	seller-1	12345	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$7UGHHZRO1a5xaV0xckxPS.LBhdIOHKvLp.cjDz9ShjGHJtj/Bn6Qa	f	2026-05-29 04:14:24.798	2026-05-29 04:14:46.083	1
cmpqetifq00324pkvqclbax87	simulacion-agente-04-16-20-etifq	seller-1	Simulación agente 04:16:20	Producto publicado por script de simulación (First to Claim).	249900	MXN	Pokémon	Near Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$tVhGe8z6JpesnKQ2ctOQ1u1uvmjAKL2wKVp2GCtdnO15T5eo/LIcG	f	2026-05-29 04:16:20.63	2026-05-29 04:16:21.41	1
cmpqeugqz003e4pkvt16icriq	test12345-eugqz	seller-4	test12345	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	sold	t	$2a$10$YW4A3s.w27wsy7D1vbVw/OF5Gmc.pfhRAN4qXkU0Rw12hMW31Fvh6	f	2026-05-29 04:17:05.1	2026-05-29 04:18:19.593	1
cmpqfbwl4003r4pkv3z4b2wii	carta-demo-first-to-claim-fbwl4	seller-1	Carta demo First to Claim	Publicación de prueba desde el flujo de venta.	150000	MXN	Pokémon	Mint	{https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop}	live	f	\N	f	2026-05-29 04:30:38.777	2026-05-29 04:30:38.777	1
cmpqhd1bz0003xklbchj04lq3	1235-hd1by	seller-1	1235	12245	10000	MXN	Coleccionables	Usado	{/uploads/e72b5e6c-8cad-45f0-a831-46a3f08ff307.jpg,/uploads/7d2678c6-8506-4fa0-ad11-ce8d1aec7589.jpg}	live	t	$2a$10$rOwqAhJxc0qaLfFjT5lp5upgsmWbKLHkrxR6WOBE/IG3J2kGeGaDK	f	2026-05-29 05:27:30.815	2026-05-29 05:27:30.815	1
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."Order" (id, "reservationId", status, "createdAt", "paidAt") FROM stdin;
cmpqdwm3j000s4pkvkrvaywwq	cmpqdwm3j000r4pkvojz1a133	paid	2026-05-29 03:50:45.728	2026-05-29 03:50:46.863
cmpqe1h9g00154pkv84uubp4v	cmpqe1h9g00144pkv53y72di5	paid	2026-05-29 03:54:32.741	2026-05-29 03:54:35.049
cmpqe4v9d001j4pkv8m9d2a9w	cmpqe4v9c001i4pkv56gu1fgn	paid	2026-05-29 03:57:10.85	2026-05-29 03:57:48.331
cmpqem7wt00214pkvsnvkvkz6	cmpqem7ws00204pkv2u9bvjzo	paid	2026-05-29 04:10:40.398	2026-05-29 04:10:43.637
cmpqeqch0002g4pkv97x4ziid	cmpqeqcgy002f4pkvc3qkwgnz	paid	2026-05-29 04:13:52.932	2026-05-29 04:13:53.87
cmpqerf3v002w4pkvo92xxbma	cmpqerf3u002v4pkvq59arofg	paid	2026-05-29 04:14:43.003	2026-05-29 04:14:46.08
cmpqetivp003a4pkvzpqmbe9s	cmpqetivo00394pkv0cgiz6c4	paid	2026-05-29 04:16:21.206	2026-05-29 04:16:21.406
cmpqevzrh003n4pkvvcnffyqq	cmpqevzrg003m4pkvpb1bkfs5	paid	2026-05-29 04:18:16.397	2026-05-29 04:18:19.59
cmpqduogr000f4pkvrzcs9r18	cmpqduogq000e4pkvkj6zxf2u	cancelled	2026-05-29 03:49:15.483	\N
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."Reservation" (id, "listingId", "winnerId", "lockedAt", "paymentDeadlineAt", "releasedAt", "bullJobId") FROM stdin;
cmpqeqcgy002f4pkvc3qkwgnz	cmpqeqbyg00274pkvl16mkbjm	cmpqdrch600087u6dfbmvjxkx	2026-05-29 04:13:52.916	2026-05-29 04:43:52.916	\N	cmpqeqcgy002f4pkvc3qkwgnz
cmpqerf3u002v4pkvq59arofg	cmpqer126002n4pkv1l7ev97v	seller-4	2026-05-29 04:14:42.996	2026-05-29 04:44:42.996	\N	cmpqerf3u002v4pkvq59arofg
cmpqdwm3j000r4pkvojz1a133	cmpqdwlnr000j4pkvcrdxjd5x	cmpqdrch600087u6dfbmvjxkx	2026-05-29 03:50:45.723	2026-05-29 04:20:45.723	\N	cmpqdwm3j000r4pkvojz1a133
cmpqetivo00394pkv0cgiz6c4	cmpqetifq00324pkvqclbax87	cmpqdrch600087u6dfbmvjxkx	2026-05-29 04:16:21.197	2026-05-29 04:46:21.197	\N	cmpqetivo00394pkv0cgiz6c4
cmpqe1h9g00144pkv53y72di5	cmpqe181e000w4pkvs2sfw09u	seller-1	2026-05-29 03:54:32.734	2026-05-29 04:24:32.734	\N	cmpqe1h9g00144pkv53y72di5
cmpqevzrg003m4pkvpb1bkfs5	cmpqeugqz003e4pkvt16icriq	seller-1	2026-05-29 04:18:16.388	2026-05-29 04:48:16.388	\N	cmpqevzrg003m4pkvpb1bkfs5
cmpqe4v9c001i4pkv56gu1fgn	cmpqe4rso001d4pkvgb4npoxf	seller-1	2026-05-29 03:57:10.844	2026-05-29 04:27:10.844	\N	cmpqe4v9c001i4pkv56gu1fgn
cmpqdrcmi000j7u6dpc3ierxk	cmpqdrcmf000h7u6dzhgnzifa	cmpqdrch600087u6dfbmvjxkx	2026-05-29 03:44:40.17	2026-05-29 04:18:03.971	2026-05-29 04:30:39.726	cmpqdrcmi000j7u6dpc3ierxk
cmpqduogq000e4pkvkj6zxf2u	cmpqdu1a800044pkvh3bqfmc5	seller-1	2026-05-29 03:49:15.476	2026-05-29 04:19:15.476	2026-05-29 04:30:39.739	cmpqduogq000e4pkvkj6zxf2u
cmpqem7ws00204pkv2u9bvjzo	cmpqelqbj001s4pkv2q7yy6eh	seller-3	2026-05-29 04:10:40.39	2026-05-29 04:40:40.39	\N	cmpqem7ws00204pkv2u9bvjzo
\.


--
-- Data for Name: SellerProfile; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."SellerProfile" (id, "userId", score, tier, sales, "positiveRate", "onTimeShipping", "memberSince") FROM stdin;
cmpqdrcgo00007u6duz5kmaj9	seller-1	942	elite	1247	99.2	97	2022
cmpqdrcgv00017u6dnxyx138c	seller-2	680	trusted	312	96.5	91	2023
cmpqdrch600097u6ddu6hb5t7	cmpqdrch600087u6dfbmvjxkx	0	nuevo	0	0	0	2026
cmpqdrcgx00027u6dbb7gplgn	seller-3	0	nuevo	0	0	0	2026
cmpqdrch000037u6d5vgvpc0l	seller-4	142	low	28	68.4	61	2024
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."Session" (id, "userId", "tokenHash", "userAgent", ip, "expiresAt", "createdAt", "revokedAt") FROM stdin;
cmpqdtoyd00024pkv4ktq98a9	seller-1	ab5299c44bc64b4051457e1c21f328f9f1ce7dd58725a531a17a3d7fab143784	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 03:48:29.461	2026-05-29 03:48:29.462	2026-05-29 03:48:54.108
cmpqdwlli000h4pkvxpri7qzf	seller-1	4a83b45c42a84cca845e101449ea9bfc6f5f120feaba2850e8d911b6f1513551	node	::1	2026-06-05 03:50:45.077	2026-05-29 03:50:45.078	\N
cmpqdwlpw000l4pkvmjbagnwr	cmpqdrch600087u6dfbmvjxkx	0cc4d938287b07c822a098d8c8756f45898f692d0c979e46c4d2dc7ba3bd9d3a	node	::1	2026-06-05 03:50:45.236	2026-05-29 03:50:45.236	\N
cmpqdudd000074pkvle6tjwbi	seller-3	11e64b5c6a3ce5baa01c9cfa54044d71552ffc843dd00e545ce7c066902df70e	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 03:49:01.092	2026-05-29 03:49:01.093	2026-05-29 03:54:24.571
cmpqe1dbc000z4pkvokqdq2jp	seller-1	4f29d774f1c4e7367472f23a3b1c1526824ae43aa759e40f4e085b5567a6ce3f	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 03:54:27.624	2026-05-29 03:54:27.624	2026-05-29 04:09:54.774
cmpqelfqa001q4pkvuf7yj2rw	cmpqdrch600087u6dfbmvjxkx	e2afbf3336424c97cea657a1c86b43ee0fd01862295a605e9c49c778e60cc23d	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 04:10:03.874	2026-05-29 04:10:03.875	2026-05-29 04:10:27.202
cmpqeqbik00254pkvq1aefs5v	seller-1	4dfc830af263a4966e3d64921b6b5348e1f04dd18e9ad804ef84afc074b694ee	node	::1	2026-06-05 04:13:51.692	2026-05-29 04:13:51.693	\N
cmpqeqc0r00294pkvzgughmh9	cmpqdrch600087u6dfbmvjxkx	e6c5f4595c830ee54b2761203e49dd424cf4a3e46fef7fd69f9cbb850d7d89cc	node	::1	2026-06-05 04:13:52.346	2026-05-29 04:13:52.347	\N
cmpqem3ar001v4pkvmvbuutx8	seller-3	0b1e5ef3bae2580cfcea1f39f5da551784fefc3afb5d506e0de887c4e3745ca0	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 04:10:34.419	2026-05-29 04:10:34.419	2026-05-29 04:13:52.844
cmpqeqoa7002l4pkvc614nltk	seller-1	0ccdf15e98a5c6d3a541de1d011e4aae94b7a1c9504bc3d1e84cb0c5c1385eed	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 04:14:08.238	2026-05-29 04:14:08.239	2026-05-29 04:14:26.387
cmpqetid900304pkvxwsmp56i	seller-1	fc739746c82c65b23e857d8a32285a7a9663ec43840b523f0ca968bb4e09434d	node	::1	2026-06-05 04:16:20.54	2026-05-29 04:16:20.541	\N
cmpqetihw00344pkvmi4avim5	cmpqdrch600087u6dfbmvjxkx	cd3c1a5294c1c1dea85fcfe3995fbfe9d26d78fc90bf2aa97ea4edf14319eb49	node	::1	2026-06-05 04:16:20.708	2026-05-29 04:16:20.709	\N
cmpqer6a2002q4pkvqbwy96nv	seller-4	73be6bf620b2e57ac9334a99cdb9660d85abe1f73a9cda6c1101dc50e114e892	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 04:14:31.562	2026-05-29 04:14:31.562	2026-05-29 04:17:10.615
cmpqfp2tt003v4pkv6sqfwod9	seller-1	27137067e9cc809a407c7668ce1920867f3e2c5747947f9bba112259cbe07302	Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0	::ffff:127.0.0.1	2026-06-05 04:40:53.392	2026-05-29 04:40:53.393	\N
cmpqg7ck00001nqv8z7gzebaz	seller-1	a6e90783a236e032fd331ae11dcd2530b28cb030208aa020d2e048e926a456de	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	::ffff:192.168.100.50	2026-06-05 04:55:05.807	2026-05-29 04:55:05.808	\N
cmpqhas720001xklbxzulox5h	seller-1	35bf4c93488af39469e0baf2c291d2f232544a7492d837b3b160812b0c5f9292	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	189.203.187.232	2026-06-05 05:25:45.662	2026-05-29 05:25:45.663	\N
cmpqhesit0005xklb6enrlz9g	cmpqdrch600087u6dfbmvjxkx	cf139c4d742f564b3941caf6b146436de13560c14e1b8af924060d90fa5f2222	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	189.203.187.232	2026-06-05 05:28:52.709	2026-05-29 05:28:52.709	\N
cmpqeuntb003h4pkv6ei2i4bx	seller-1	0dc09d51c4f9758401e884cfdef4401b82524f16863c4514262e4de7efd14854	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 04:17:14.254	2026-05-29 04:17:14.255	2026-05-29 05:32:20.356
cmpqhj8qv000269pak7jzwuyf	seller-1	7139e9f45180cb796cac6609a092dbf479c62659cd06bc0646f576a589be69c7	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-05 05:32:20.359	2026-05-29 05:32:20.359	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public."User" (id, email, "passwordHash", "displayName", handle, "avatarUrl", role, "createdAt", "legacyGuestId") FROM stdin;
seller-3	sofia@local.dev	$2a$10$yqn.jGzvQ/y5b/lzHJYcC.DnoL0054m1Oz5TbvmelleF0d0dec9X2	Sofía Primeras Ventas	@sofia_primeras	https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop	user	2026-05-29 03:46:39.97	guest-d04468d4
cmpqdrch600087u6dfbmvjxkx	comprador@local.dev	$2a$10$yqn.jGzvQ/y5b/lzHJYcC.DnoL0054m1Oz5TbvmelleF0d0dec9X2	Comprador demo	@comprador_demo	\N	user	2026-05-29 03:46:39.978	sim-buyer-guest
seller-4	raul@local.dev	$2a$10$yqn.jGzvQ/y5b/lzHJYcC.DnoL0054m1Oz5TbvmelleF0d0dec9X2	Raúl Outlet Riesgoso	@raul_outlet	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop	user	2026-05-29 03:46:39.972	guest-9898f293
seller-1	maria@local.dev	$2a$10$yqn.jGzvQ/y5b/lzHJYcC.DnoL0054m1Oz5TbvmelleF0d0dec9X2	María Colecciones	@maria_colecciones	https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop	user	2026-05-29 03:46:39.961	guest-571634a9
seller-2	luis@local.dev	$2a$10$yqn.jGzvQ/y5b/lzHJYcC.DnoL0054m1Oz5TbvmelleF0d0dec9X2	Luis TCG	@luis_tcg	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop	user	2026-05-29 03:46:39.967	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mio
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f061221a-e0ff-4565-b19d-c4e3ca161beb	08b26df7822f28677d90ac7b5d01e4304a17ad01384f203b6c0b129021c39eca	2026-05-29 03:46:39.419425+00	20260525035933_init	\N	\N	2026-05-29 03:46:39.373319+00	1
edba5dc7-d671-4632-b5fa-535080ba609e	d89518181efd9af94c2ecbc2912c2201db1800d9ab07e2782accbaeb47f1d4b3	2026-05-29 03:46:39.427148+00	20260525120000_add_legacy_guest_id	\N	\N	2026-05-29 03:46:39.42118+00	1
b22dd5f6-7624-49e3-b7b1-d06a029fc51d	2050b776f3fbcd9d4793df8765f63774bfc912b1c64147abf6508d4b4f8cb294	2026-05-29 03:46:39.441078+00	20260526120000_add_session_model	\N	\N	2026-05-29 03:46:39.42827+00	1
943c66b3-2a85-4ca4-8749-d0d1963af517	638b134d9496fa603dc17a5ba5c0fc4df9b42b0d54e16a8468c9cc2e0a6e0752	2026-05-29 03:46:39.456573+00	20260528120000_user_role_only	\N	\N	2026-05-29 03:46:39.442279+00	1
cfe006e3-867d-448a-a5ee-668ed9abbdcc	22439d3ea7e019efeadae08cc361e4a5b8d98886caddbee13474378445b64394	2026-05-29 04:54:41.679672+00	20260528200000_add_listing_quantity	\N	\N	2026-05-29 04:54:41.671111+00	1
\.


--
-- Name: ClaimAttempt ClaimAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."ClaimAttempt"
    ADD CONSTRAINT "ClaimAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: SellerProfile SellerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ClaimAttempt_listingId_createdAt_idx; Type: INDEX; Schema: public; Owner: mio
--

CREATE INDEX "ClaimAttempt_listingId_createdAt_idx" ON public."ClaimAttempt" USING btree ("listingId", "createdAt");


--
-- Name: Listing_slug_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "Listing_slug_key" ON public."Listing" USING btree (slug);


--
-- Name: Order_reservationId_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "Order_reservationId_key" ON public."Order" USING btree ("reservationId");


--
-- Name: Reservation_listingId_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "Reservation_listingId_key" ON public."Reservation" USING btree ("listingId");


--
-- Name: SellerProfile_userId_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "SellerProfile_userId_key" ON public."SellerProfile" USING btree ("userId");


--
-- Name: Session_tokenHash_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "Session_tokenHash_key" ON public."Session" USING btree ("tokenHash");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: mio
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_handle_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "User_handle_key" ON public."User" USING btree (handle);


--
-- Name: User_legacyGuestId_key; Type: INDEX; Schema: public; Owner: mio
--

CREATE UNIQUE INDEX "User_legacyGuestId_key" ON public."User" USING btree ("legacyGuestId");


--
-- Name: ClaimAttempt ClaimAttempt_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."ClaimAttempt"
    ADD CONSTRAINT "ClaimAttempt_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClaimAttempt ClaimAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."ClaimAttempt"
    ADD CONSTRAINT "ClaimAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_winnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SellerProfile SellerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mio
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: mio
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict RFr1B1V6ckJEXKsfOzKovodxYYtKesuVTG7OcpMya6i0bJw0VnjdixUwqmoerHq

