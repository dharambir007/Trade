import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ==================================================================
   Styles — scoped under .tm-page, injected once (single file)
   ================================================================== */
const LANDING_STYLES = `
.tm-page *,
.tm-page *::before,
.tm-page *::after { box-sizing: border-box; }

.tm-page {
  --bg: #05070b;
  --panel: rgba(255,255,255,.04);
  --border: rgba(255,255,255,.08);
  --border-2: rgba(255,255,255,.16);
  --text: #e9eef7;
  --muted: #8b97ab;
  --accent: #00e5a0;
  --accent-2: #38bdf8;
  --accent-3: #a78bfa;
  --radius: 20px;
  --shadow: 0 24px 60px -30px rgba(0,0,0,.9);

  position: relative;
  isolation: isolate;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.55;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.tm-page h1, .tm-page h2, .tm-page h3, .tm-page p { margin: 0; }
.tm-page a { color: inherit; text-decoration: none; }
.tm-page button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.tm-page svg { display: block; }
.tm-page img { max-width: 100%; display: block; }

/* ---------- ambient background ---------- */
.tm-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%);
}

.tm-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
  opacity: .5;
}
.tm-orb--1 {
  width: min(520px, 80vw); height: min(520px, 80vw);
  top: -160px; left: -140px;
  background: radial-gradient(circle, rgba(0,229,160,.40), transparent 70%);
  animation: tmFloat 16s ease-in-out infinite;
}
.tm-orb--2 {
  width: min(560px, 85vw); height: min(560px, 85vw);
  top: -100px; right: -180px;
  background: radial-gradient(circle, rgba(56,189,248,.34), transparent 70%);
  animation: tmFloat 20s ease-in-out infinite reverse;
}
.tm-orb--3 {
  width: min(460px, 70vw); height: min(460px, 70vw);
  bottom: 2%; left: 38%;
  background: radial-gradient(circle, rgba(167,139,250,.22), transparent 70%);
  animation: tmFloat 24s ease-in-out infinite;
}
@keyframes tmFloat {
  0%, 100% { transform: translate3d(0,0,0) scale(1); }
  50%      { transform: translate3d(26px,-34px,0) scale(1.08); }
}

/* ---------- layout ---------- */
.tm-container {
  width: min(1180px, 100% - 2.5rem);
  margin-inline: auto;
  position: relative;
  z-index: 2;
}
@media (max-width: 520px) {
  .tm-container { width: min(1180px, 100% - 1.75rem); }
}

/* ---------- scroll reveal ---------- */
.tm-reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity .8s cubic-bezier(.2,.7,.3,1), transform .8s cubic-bezier(.2,.7,.3,1);
  will-change: opacity, transform;
}
.tm-reveal.tm-in { opacity: 1; transform: none; }
.tm-reveal.tm-d1 { transition-delay: .08s; }
.tm-reveal.tm-d2 { transition-delay: .16s; }
.tm-reveal.tm-d3 { transition-delay: .24s; }
.tm-reveal.tm-d4 { transition-delay: .32s; }

/* ---------- navbar ---------- */
.tm-nav {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(5,7,11,.72);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-bottom: 1px solid var(--border);
}
.tm-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 74px;
}
.tm-logo {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  font-weight: 700;
  font-size: 1.08rem;
  letter-spacing: -.025em;
  white-space: nowrap;
}
.tm-logo__mark {
  width: 34px; height: 34px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: .95rem;
  font-weight: 800;
  color: #04140e;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 10px 26px -10px rgba(0,229,160,.85);
  flex-shrink: 0;
}
.tm-logo em {
  font-style: normal;
  background: linear-gradient(100deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tm-nav__links {
  display: flex;
  align-items: center;
  gap: 1.9rem;
}
.tm-nav__link {
  position: relative;
  font-size: .92rem;
  color: var(--muted);
  transition: color .22s ease;
  padding: .25rem 0;
}
.tm-nav__link::after {
  content: "";
  position: absolute;
  left: 0; bottom: -3px;
  width: 0; height: 1.5px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width .3s cubic-bezier(.2,.7,.3,1);
}
.tm-nav__link:hover { color: var(--text); }
.tm-nav__link:hover::after { width: 100%; }

.tm-nav__auth { display: flex; align-items: center; gap: 1.35rem; }

/* ---------- buttons ---------- */
.tm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: .93rem;
  letter-spacing: -.01em;
  padding: .72rem 1.3rem;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .22s ease, box-shadow .3s ease,
              background .3s ease, border-color .3s ease, color .22s ease;
}
.tm-btn--primary {
  background: linear-gradient(135deg, var(--accent), #22d3ee);
  color: #04140e;
  box-shadow: 0 14px 34px -18px rgba(0,229,160,.95);
}
.tm-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 46px -18px rgba(0,229,160,1);
}
.tm-btn--ghost {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border-2);
  color: var(--text);
}
.tm-btn--ghost:hover {
  transform: translateY(-2px);
  border-color: rgba(0,229,160,.5);
  background: rgba(0,229,160,.08);
}
.tm-btn--lg { padding: .95rem 1.65rem; font-size: 1rem; }
.tm-btn__arrow {
  display: inline-block;
  transition: transform .3s cubic-bezier(.2,.7,.3,1);
}
.tm-btn:hover .tm-btn__arrow { transform: translateX(4px); }

/* ---------- burger + mobile menu ---------- */
.tm-burger {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 42px; height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-2);
  background: rgba(255,255,255,.03);
  flex-shrink: 0;
}
.tm-burger span {
  display: block;
  width: 18px; height: 2px;
  border-radius: 2px;
  background: var(--text);
  transition: transform .3s cubic-bezier(.2,.7,.3,1), opacity .2s ease;
}
.tm-burger.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.tm-burger.is-open span:nth-child(2) { opacity: 0; }
.tm-burger.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

.tm-mobile {
  display: none;
  overflow: hidden;
  max-height: 0;
  border-bottom: 1px solid transparent;
  background: rgba(5,7,11,.97);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition: max-height .42s cubic-bezier(.2,.7,.3,1), border-color .3s ease;
}
.tm-mobile.is-open { max-height: 440px; border-bottom-color: var(--border); }
.tm-mobile__inner {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  padding: .9rem 0 1.4rem;
}
.tm-mobile__link {
  padding: .8rem .2rem;
  font-size: 1rem;
  color: var(--muted);
  border-bottom: 1px solid rgba(255,255,255,.05);
  transition: color .2s ease;
}
.tm-mobile__link:hover { color: var(--text); }
.tm-mobile__cta { margin-top: .85rem; }

/* ---------- hero ---------- */
.tm-hero {
  position: relative;
  z-index: 2;
  padding: clamp(3rem, 7vw, 6rem) 0 clamp(2.5rem, 5vw, 4rem);
}
.tm-hero__grid {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}

.tm-badge {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  padding: .45rem .95rem .45rem .8rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.03);
  font-size: .79rem;
  color: #b8c4d6;
  letter-spacing: .005em;
}
.tm-live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 rgba(0,229,160,.55);
  animation: tmPulse 2.2s infinite;
  flex-shrink: 0;
}
@keyframes tmPulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,229,160,.55); }
  70%  { box-shadow: 0 0 0 9px rgba(0,229,160,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,229,160,0); }
}

.tm-hero__title {
  margin-top: 1.5rem;
  font-size: clamp(2.3rem, 5.6vw, 4.05rem);
  line-height: 1.04;
  letter-spacing: -.042em;
  font-weight: 800;
}
.tm-gradient-text {
  background: linear-gradient(100deg, var(--accent) 0%, var(--accent-2) 48%, var(--accent-3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tm-hero__desc {
  margin-top: 1.35rem;
  max-width: 33rem;
  font-size: clamp(1rem, 1.6vw, 1.07rem);
  line-height: 1.72;
  color: var(--muted);
}
.tm-hero__actions {
  margin-top: 2.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: .85rem;
}
.tm-hero__note {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: .55rem;
  font-size: .81rem;
  color: #6f7c90;
}
.tm-hero__note b { color: var(--accent); font-size: .6rem; line-height: 1; }

/* ---------- glass card ---------- */
.tm-glass {
  position: relative;
  background: linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
}

/* ---------- market card ---------- */
.tm-market {
  padding: 1.35rem 1.35rem 1.15rem;
  animation: tmCardFloat 7s ease-in-out infinite;
  overflow: hidden;
}
.tm-market::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(140deg, rgba(0,229,160,.45), transparent 40%, transparent 60%, rgba(56,189,248,.35));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: .75;
}
@keyframes tmCardFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

.tm-market__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.tm-market__label {
  font-size: .68rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
.tm-market__price {
  margin-top: .3rem;
  font-size: clamp(1.5rem, 3.4vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -.03em;
}
.tm-market__change {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .34rem .68rem;
  border-radius: 999px;
  font-size: .8rem;
  font-weight: 700;
  color: var(--accent);
  background: rgba(0,229,160,.1);
  border: 1px solid rgba(0,229,160,.25);
  white-space: nowrap;
}
.tm-market__change span { font-size: .85rem; line-height: 1; }

.tm-chart {
  position: relative;
  margin: 1.1rem 0 .2rem;
  height: 190px;
  border-radius: 14px;
  background: radial-gradient(ellipse 70% 90% at 50% 110%, rgba(0,229,160,.09), transparent 70%);
  overflow: hidden;
}
.tm-chart svg { width: 100%; height: 100%; }
.tm-chart__line {
  stroke-dasharray: 1250;
  stroke-dashoffset: 1250;
  animation: tmDraw 2.4s cubic-bezier(.4,0,.2,1) .35s forwards;
}
@keyframes tmDraw { to { stroke-dashoffset: 0; } }

.tm-chart__label {
  position: absolute;
  right: .6rem;
  font-size: .63rem;
  font-weight: 600;
  letter-spacing: .04em;
  color: #5d6a7e;
  padding: .1rem .35rem;
  border-radius: 5px;
  background: rgba(5,7,11,.65);
}
.tm-chart__label--1 { top: 26%; }
.tm-chart__label--2 { top: 48%; }
.tm-chart__label--3 { top: 70%; }

.tm-timeframes {
  display: flex;
  gap: .35rem;
  margin-top: .35rem;
  flex-wrap: wrap;
}
.tm-timeframes span {
  flex: 1 1 auto;
  text-align: center;
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .04em;
  color: var(--muted);
  padding: .38rem .3rem;
  border-radius: 8px;
  transition: background .25s ease, color .25s ease;
  cursor: default;
}
.tm-timeframes span:hover { color: var(--text); background: rgba(255,255,255,.05); }
.tm-timeframes span.is-active {
  color: #04140e;
  background: linear-gradient(135deg, var(--accent), #22d3ee);
  box-shadow: 0 8px 20px -12px rgba(0,229,160,.95);
}

.tm-prediction {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.tm-prediction small {
  display: block;
  font-size: .66rem;
  letter-spacing: .13em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
.tm-prediction strong {
  display: block;
  margin-top: .25rem;
  font-size: 1rem;
  letter-spacing: .01em;
  color: var(--accent);
}
.tm-confidence {
  text-align: right;
}
.tm-confidence__value {
  display: block;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -.03em;
  background: linear-gradient(100deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1.1;
}

/* ---------- stats strip ---------- */
.tm-stats {
  position: relative;
  z-index: 2;
  padding: clamp(1.6rem, 4vw, 2.3rem) 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,.012);
}
.tm-stats__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1.2rem, 4vw, 2.8rem);
  flex-wrap: wrap;
}
.tm-stat { text-align: center; min-width: 6.5rem; }
.tm-stat strong {
  display: block;
  font-size: clamp(1.05rem, 2.2vw, 1.25rem);
  font-weight: 800;
  letter-spacing: -.02em;
  background: linear-gradient(100deg, #ffffff, #9fb2c9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tm-stat span {
  display: block;
  margin-top: .28rem;
  font-size: .76rem;
  color: var(--muted);
  letter-spacing: .03em;
}
.tm-stats__divider {
  width: 1px;
  height: 38px;
  background: linear-gradient(180deg, transparent, var(--border-2), transparent);
}

/* ---------- sections ---------- */
.tm-section {
  position: relative;
  z-index: 2;
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
  scroll-margin-top: 90px;
}
.tm-heading {
  max-width: 42rem;
  margin: 0 auto clamp(2.2rem, 4.5vw, 3.2rem);
  text-align: center;
}
.tm-tag {
  display: inline-block;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--accent);
  padding: .38rem .85rem;
  border-radius: 999px;
  border: 1px solid rgba(0,229,160,.22);
  background: rgba(0,229,160,.07);
}
.tm-heading h2 {
  margin-top: 1.1rem;
  font-size: clamp(1.7rem, 4vw, 2.65rem);
  line-height: 1.16;
  letter-spacing: -.035em;
  font-weight: 800;
}
.tm-heading p {
  margin-top: .95rem;
  font-size: 1rem;
  line-height: 1.72;
  color: var(--muted);
}

/* ---------- features ---------- */
.tm-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
  gap: 1.25rem;
}
.tm-feature {
  padding: 1.7rem 1.5rem 1.6rem;
  transition: transform .35s cubic-bezier(.2,.7,.3,1), border-color .35s ease, box-shadow .35s ease;
}
.tm-feature:hover {
  transform: translateY(-6px);
  border-color: rgba(0,229,160,.32);
  box-shadow: 0 30px 60px -32px rgba(0,229,160,.55);
}
.tm-feature__icon {
  width: 50px; height: 50px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  color: var(--accent);
  background: linear-gradient(150deg, rgba(0,229,160,.16), rgba(56,189,248,.08));
  border: 1px solid rgba(0,229,160,.22);
  margin-bottom: 1.15rem;
  transition: transform .35s cubic-bezier(.2,.7,.3,1);
}
.tm-feature:hover .tm-feature__icon { transform: scale(1.08) rotate(-4deg); }
.tm-feature h3 {
  font-size: 1.12rem;
  font-weight: 700;
  letter-spacing: -.02em;
}
.tm-feature p {
  margin-top: .6rem;
  font-size: .93rem;
  line-height: 1.7;
  color: var(--muted);
}

/* ---------- steps ---------- */
.tm-steps {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 1rem;
  align-items: stretch;
}
.tm-step {
  position: relative;
  padding: 1.7rem 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.012));
  transition: transform .35s cubic-bezier(.2,.7,.3,1), border-color .35s ease;
}
.tm-step:hover { transform: translateY(-5px); border-color: rgba(56,189,248,.3); }
.tm-step__num {
  display: inline-block;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -.05em;
  line-height: 1;
  background: linear-gradient(140deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: .9;
}
.tm-step h3 {
  margin-top: .85rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -.02em;
}
.tm-step p {
  margin-top: .5rem;
  font-size: .91rem;
  line-height: 1.65;
  color: var(--muted);
}
.tm-steps__line {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(20px, 4vw, 64px);
}
.tm-steps__line::before {
  content: "";
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,229,160,.45), transparent);
}

/* ---------- CTA ---------- */
.tm-cta {
  position: relative;
  overflow: hidden;
  padding: clamp(2rem, 5vw, 3.2rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  text-align: left;
}
.tm-cta::before {
  content: "";
  position: absolute;
  top: -60%; right: -10%;
  width: 420px; height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,229,160,.22), transparent 68%);
  filter: blur(30px);
  pointer-events: none;
}
.tm-cta__body { position: relative; max-width: 34rem; }
.tm-cta h2 {
  margin-top: 1rem;
  font-size: clamp(1.5rem, 3.4vw, 2.2rem);
  line-height: 1.18;
  letter-spacing: -.035em;
  font-weight: 800;
}
.tm-cta p {
  margin-top: .8rem;
  color: var(--muted);
  font-size: .97rem;
  line-height: 1.7;
}
.tm-cta__action { position: relative; flex-shrink: 0; }

/* ---------- footer ---------- */
.tm-footer {
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--border);
  padding: 2.2rem 0;
  background: rgba(255,255,255,.012);
}
.tm-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.tm-footer__brand p {
  margin-top: .55rem;
  font-size: .86rem;
  color: var(--muted);
}
.tm-footer__copy {
  font-size: .8rem;
  color: #5f6c80;
}

/* ==================================================================
   RESPONSIVE
   ================================================================== */
@media (max-width: 1024px) {
  .tm-nav__links { gap: 1.4rem; }
  .tm-nav__auth { gap: 1rem; }
}

@media (max-width: 900px) {
  .tm-nav__links { display: none; }
  .tm-burger { display: flex; }
  .tm-mobile { display: block; }

  .tm-hero__grid { grid-template-columns: 1fr; gap: 3rem; }
  .tm-hero { padding-top: clamp(2.25rem, 6vw, 3.5rem); }
  .tm-hero__desc { max-width: none; }
  .tm-market { animation: none; }

  .tm-steps { grid-template-columns: 1fr; gap: 1rem; }
  .tm-steps__line { display: none; }

  .tm-cta { flex-direction: column; align-items: flex-start; text-align: left; }
  .tm-cta__action { width: 100%; }
  .tm-cta__action .tm-btn { width: 100%; }
}

@media (max-width: 720px) {
  .tm-stats__inner {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.35rem 1rem;
  }
  .tm-stats__divider { display: none; }
  .tm-stat { min-width: 0; }
  .tm-chart { height: 165px; }
}

@media (max-width: 520px) {
  .tm-page { font-size: 15px; }
  .tm-nav__inner { height: 66px; }
  .tm-logo { font-size: 1rem; }
  .tm-logo__mark { width: 30px; height: 30px; border-radius: 10px; font-size: .85rem; }

  .tm-hero__actions { flex-direction: column; align-items: stretch; }
  .tm-hero__actions .tm-btn { width: 100%; }

  .tm-heading { text-align: left; }
  .tm-heading { margin-inline: 0; }

  .tm-feature { padding: 1.4rem 1.25rem; }
  .tm-market { padding: 1.1rem 1.05rem 1rem; }
  .tm-chart { height: 145px; }
  .tm-timeframes span { font-size: .66rem; padding: .34rem .2rem; }
  .tm-chart__label { font-size: .58rem; }

  .tm-footer__inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .tm-page *,
  .tm-page *::before,
  .tm-page *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  .tm-reveal { opacity: 1 !important; transform: none !important; }
  .tm-chart__line { stroke-dashoffset: 0 !important; }
}
`;

/* ==================================================================
   Component
   ================================================================== */
function Landing() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---- scroll reveal ---- */
  useEffect(() => {
    const nodes = document.querySelectorAll(".tm-reveal");

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("tm-in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tm-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  /* ---- close mobile menu on resize to desktop ---- */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{LANDING_STYLES}</style>

      <div className="tm-page">
        {/* ambient background */}
        <div className="tm-orb tm-orb--1" aria-hidden="true" />
        <div className="tm-orb tm-orb--2" aria-hidden="true" />
        <div className="tm-orb tm-orb--3" aria-hidden="true" />

        {/* ================= NAVBAR ================= */}
        <header className="tm-nav">
          <div className="tm-container tm-nav__inner">
            <Link to="/" className="tm-logo" onClick={closeMenu}>
              <span className="tm-logo__mark">↗</span>
              TradeMind&nbsp;<em>AI</em>
            </Link>

            <nav className="tm-nav__links" aria-label="Primary">
              <a href="#features" className="tm-nav__link">Features</a>
              <a href="#how-it-works" className="tm-nav__link">How It Works</a>

              {isAuthenticated ? (
                <Link to="/dashboard" className="tm-btn tm-btn--primary">
                  Dashboard <span className="tm-btn__arrow">→</span>
                </Link>
              ) : (
                <div className="tm-nav__auth">
                  <Link to="/login" className="tm-nav__link">Login</Link>
                  <Link to="/register" className="tm-btn tm-btn--primary">
                    Get Started
                  </Link>
                </div>
              )}
            </nav>

            <button
              type="button"
              className={`tm-burger${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* mobile dropdown */}
          <div className={`tm-mobile${menuOpen ? " is-open" : ""}`}>
            <div className="tm-container tm-mobile__inner">
              <a href="#features" className="tm-mobile__link" onClick={closeMenu}>
                Features
              </a>
              <a href="#how-it-works" className="tm-mobile__link" onClick={closeMenu}>
                How It Works
              </a>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="tm-btn tm-btn--primary tm-mobile__cta"
                  onClick={closeMenu}
                >
                  Dashboard <span className="tm-btn__arrow">→</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="tm-mobile__link" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="tm-btn tm-btn--primary tm-mobile__cta"
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* ================= HERO ================= */}
          <section className="tm-hero">
            <div className="tm-container tm-hero__grid">
              <div>
                <div className="tm-badge tm-reveal">
                  <span className="tm-live-dot" />
                  AI-powered market intelligence
                </div>

                <h1 className="tm-hero__title tm-reveal tm-d1">
                  See the market.
                  <br />
                  <span className="tm-gradient-text">Predict the move.</span>
                </h1>

                <p className="tm-hero__desc tm-reveal tm-d2">
                  Track Indian stocks with live market charts and get AI-powered
                  short-term predictions across multiple timeframes.
                </p>

                <div className="tm-hero__actions tm-reveal tm-d3">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="tm-btn tm-btn--primary tm-btn--lg">
                      Go to Dashboard <span className="tm-btn__arrow">→</span>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="tm-btn tm-btn--primary tm-btn--lg">
                        Start Trading Smarter <span className="tm-btn__arrow">→</span>
                      </Link>
                      <Link to="/login" className="tm-btn tm-btn--ghost tm-btn--lg">
                        Login
                      </Link>
                    </>
                  )}
                </div>

                <div className="tm-hero__note tm-reveal tm-d4">
                  <b>●</b> Market data powered by Yahoo Finance
                </div>
              </div>

              {/* --- market preview card --- */}
              <div className="tm-reveal tm-d2">
                <div className="tm-glass tm-market">
                  <div className="tm-market__top">
                    <div>
                      <p className="tm-market__label">Reliance</p>
                      <h3 className="tm-market__price">₹1,425.30</h3>
                    </div>
                    <div className="tm-market__change">
                      <span>↑</span> 1.24%
                    </div>
                  </div>

                  <div className="tm-chart">
                    <svg viewBox="0 0 600 260" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="tmChartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
                        </linearGradient>
                        <filter id="tmChartGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      <path
                        d="M0 215 C30 200 40 210 65 185 C90 160 105 180 130 145 C155 110 175 145 195 125 C220 102 235 120 260 95 C285 70 300 105 325 82 C350 58 370 72 390 60 C415 48 430 65 450 43 C475 20 490 45 510 28 C535 8 555 22 575 10 C588 4 595 7 600 3 L600 260 L0 260 Z"
                        fill="url(#tmChartFill)"
                      />
                      <path
                        className="tm-chart__line"
                        d="M0 215 C30 200 40 210 65 185 C90 160 105 180 130 145 C155 110 175 145 195 125 C220 102 235 120 260 95 C285 70 300 105 325 82 C350 58 370 72 390 60 C415 48 430 65 450 43 C475 20 490 45 510 28 C535 8 555 22 575 10 C588 4 595 7 600 3"
                        fill="none"
                        stroke="#00e5a0"
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter="url(#tmChartGlow)"
                      />
                    </svg>

                    <div className="tm-chart__label tm-chart__label--1">₹1,350</div>
                    <div className="tm-chart__label tm-chart__label--2">₹1,400</div>
                    <div className="tm-chart__label tm-chart__label--3">₹1,450</div>
                  </div>

                  <div className="tm-timeframes">
                    <span>1D</span>
                    <span>1W</span>
                    <span className="is-active">1M</span>
                    <span>3M</span>
                    <span>1Y</span>
                  </div>

                  <div className="tm-prediction">
                    <div>
                      <small>AI Prediction</small>
                      <strong>BULLISH</strong>
                    </div>
                    <div className="tm-confidence">
                      <span className="tm-confidence__value">82%</span>
                      <small>confidence</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= STATS ================= */}
          <section className="tm-stats">
            <div className="tm-container tm-stats__inner">
              <div className="tm-stat">
                <strong>1m – 1D</strong>
                <span>Multiple timeframes</span>
              </div>
              <div className="tm-stats__divider" />
              <div className="tm-stat">
                <strong>AI</strong>
                <span>Market analysis</span>
              </div>
              <div className="tm-stats__divider" />
              <div className="tm-stat">
                <strong>Live</strong>
                <span>Market monitoring</span>
              </div>
              <div className="tm-stats__divider" />
              <div className="tm-stat">
                <strong>India</strong>
                <span>NSE stocks</span>
              </div>
            </div>
          </section>

          {/* ================= FEATURES ================= */}
          <section id="features" className="tm-section">
            <div className="tm-container">
              <div className="tm-heading tm-reveal">
                <span className="tm-tag">Features</span>
                <h2>Everything you need to read the market.</h2>
                <p>
                  A simple trading interface designed around the information that
                  actually matters.
                </p>
              </div>

              <div className="tm-features">
                <article className="tm-glass tm-feature tm-reveal">
                  <div className="tm-feature__icon">◈</div>
                  <h3>Live Market Charts</h3>
                  <p>
                    Monitor stock price movement using clean, interactive
                    candlestick charts.
                  </p>
                </article>

                <article className="tm-glass tm-feature tm-reveal tm-d1">
                  <div className="tm-feature__icon">◷</div>
                  <h3>Multiple Timeframes</h3>
                  <p>
                    Switch between 1 minute, 3 minute, 5 minute, 10 minute, 15
                    minute and higher intervals.
                  </p>
                </article>

                <article className="tm-glass tm-feature tm-reveal tm-d2">
                  <div className="tm-feature__icon">✦</div>
                  <h3>AI Predictions</h3>
                  <p>
                    Generate short-term market predictions from current market
                    conditions.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* ================= HOW IT WORKS ================= */}
          <section id="how-it-works" className="tm-section">
            <div className="tm-container">
              <div className="tm-heading tm-reveal">
                <span className="tm-tag">How It Works</span>
                <h2>Three steps. No complexity.</h2>
              </div>

              <div className="tm-steps">
                <div className="tm-step tm-reveal">
                  <span className="tm-step__num">01</span>
                  <h3>Select a stock</h3>
                  <p>Search for your favourite NSE stock.</p>
                </div>

                <div className="tm-steps__line" aria-hidden="true" />

                <div className="tm-step tm-reveal tm-d1">
                  <span className="tm-step__num">02</span>
                  <h3>Read the chart</h3>
                  <p>Analyze real market movement across timeframes.</p>
                </div>

                <div className="tm-steps__line" aria-hidden="true" />

                <div className="tm-step tm-reveal tm-d2">
                  <span className="tm-step__num">03</span>
                  <h3>Get a prediction</h3>
                  <p>Click Predict and receive the model's next-move signal.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= CTA ================= */}
          <section className="tm-section" style={{ paddingTop: 0 }}>
            <div className="tm-container">
              <div className="tm-glass tm-cta tm-reveal">
                <div className="tm-cta__body">
                  <span className="tm-tag">Get Started</span>
                  <h2>Your market dashboard starts here.</h2>
                  <p>Create your account and start exploring the platform.</p>
                </div>

                <div className="tm-cta__action">
                  <Link to="/register" className="tm-btn tm-btn--primary tm-btn--lg">
                    Create Account <span className="tm-btn__arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="tm-footer">
          <div className="tm-container tm-footer__inner">
            <div className="tm-footer__brand">
              <Link to="/" className="tm-logo">
                <span className="tm-logo__mark">↗</span>
                TradeMind&nbsp;<em>AI</em>
              </Link>
              <p>Market intelligence for smarter decisions.</p>
            </div>

            <span className="tm-footer__copy">
              © 2026 TradeMind AI. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Landing;