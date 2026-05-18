/* ════════════════════════════════════════════════════════════════
   Elitez — Admin / intel auth gate  (canonical, project-agnostic)
   ----------------------------------------------------------------
   Drop-in Supabase email-OTP gate for any admin/ or intel/ page.
   Self-contained: no logo files, no fonts, no per-repo asset paths.

   Wiring — add these two tags before </body> on every gated page:

     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
     <script src="assets/js/auth-gate.js"></script>

   It locks the page behind a full-screen OTP overlay until a
   Supabase session exists, and exposes window._sbReady (a Promise
   resolving to the signed-in client) and window._sb.

   Sign-ups are restricted to elitez.asia / dhc.com.sg by a
   "Before User Created" Postgres hook on the shared Supabase auth
   project (suehogmzjspagcsrqvsw). Email-OTP is delivered via
   Resend SMTP.

   NOTE: on static pages whose data is baked into the HTML, this
   gate hides the rendered view but not the page source. Moving
   that data into Supabase (RLS-gated) is a separate, planned
   effort — until then treat the gate as access control for the
   UI, not as confidentiality for the embedded data.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://suehogmzjspagcsrqvsw.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZWhvZ216anNwYWdjc3JxdnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDgxMTAsImV4cCI6MjA5NDA4NDExMH0.mJHp1pemwzpSJsAUA0ZO8owY7qeDf2EzwxfUq_B1rTw';

  var resolveReady;
  window._sbReady = new Promise(function (res) { resolveReady = res; });

  if (!window.supabase || !window.supabase.createClient) {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.textContent =
        'Auth library failed to load. Check your connection and reload, or contact derrick@elitez.asia.';
    });
    return;
  }

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
  });
  window._sb = sb;

  // ── Tiny DOM builder (no HTML-string setters — XSS-safe) ────
  function mk(tag, props) {
    var n = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (k === 'text') n.textContent = props[k];
        else if (k === 'html') { /* deliberately unsupported */ }
        else n.setAttribute(k, props[k]);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return n;
  }

  // ── Styles — Elitez navy (#003a70) + orange (#F26522) accent ──
  var css = '\
#ez-auth-overlay{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;\
background:radial-gradient(ellipse at 50% 0%,#0a4a86 0%,#003a70 45%,#00264a 100%);\
font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:24px}\
#ez-auth-overlay *{box-sizing:border-box}\
.ez-card{width:100%;max-width:400px;background:rgba(0,30,60,.78);border:1px solid rgba(255,255,255,.12);\
border-radius:16px;padding:38px 34px;box-shadow:0 24px 60px rgba(0,0,0,.45)}\
.ez-mark{font-size:12px;letter-spacing:3px;color:#F26522;text-transform:uppercase;font-weight:700;margin-bottom:24px}\
.ez-card h1{font-size:21px;color:#fff;margin:0 0 6px;letter-spacing:.2px;font-weight:600}\
.ez-card p.sub{font-size:13px;color:rgba(220,232,245,.62);margin:0 0 24px;line-height:1.55}\
.ez-card label{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(220,232,245,.7);margin-bottom:8px}\
.ez-card input{width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);\
border-radius:9px;color:#fff;font-size:15px;outline:none;transition:border-color .15s}\
.ez-card input:focus{border-color:#F26522}\
.ez-card input::placeholder{color:rgba(220,232,245,.32)}\
#ez-otp{letter-spacing:7px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px}\
.ez-btn{width:100%;margin-top:18px;padding:13px;background:#F26522;color:#fff;border:none;border-radius:9px;\
font-weight:700;font-size:14px;cursor:pointer;letter-spacing:.3px;transition:opacity .15s}\
.ez-btn:hover{opacity:.9}.ez-btn:disabled{opacity:.5;cursor:not-allowed}\
.ez-link{margin-top:14px;background:none;border:none;color:rgba(220,232,245,.55);font-size:12px;cursor:pointer;\
text-decoration:underline;padding:0}\
.ez-err{color:#ff8a7a;font-size:12.5px;margin-top:12px;min-height:16px;line-height:1.4}\
.ez-echo{color:#F26522;font-weight:600}\
.ez-foot{margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);\
font-size:11px;color:rgba(220,232,245,.45);line-height:1.55}\
.ez-foot b{color:rgba(220,232,245,.7);font-weight:600}\
body.ez-gate-locked>*:not(#ez-auth-overlay):not(script){display:none!important}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Overlay DOM ─────────────────────────────────────────────
  var emailInput = mk('input', { id: 'ez-email', type: 'email', autocomplete: 'email', placeholder: 'you@elitez.asia' });
  var sendBtn = mk('button', { class: 'ez-btn', id: 'ez-send' }, 'Send code');
  var err1 = mk('div', { class: 'ez-err', id: 'ez-err1' });
  var stageEmail = mk('div', { id: 'ez-stage-email' },
    mk('h1', { text: 'Restricted access' }),
    mk('p', { class: 'sub' }, 'Elitez admin workspace. Sign in with your Elitez email — a 6-digit code will be sent to you.'),
    mk('label', { for: 'ez-email', text: 'Work email' }),
    emailInput, sendBtn, err1
  );

  var echo = mk('span', { class: 'ez-echo', id: 'ez-echo' });
  var otpInput = mk('input', { id: 'ez-otp', type: 'text', inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code', placeholder: '••••••' });
  var verifyBtn = mk('button', { class: 'ez-btn', id: 'ez-verify' }, 'Verify & enter');
  var err2 = mk('div', { class: 'ez-err', id: 'ez-err2' });
  var backBtn = mk('button', { class: 'ez-link', id: 'ez-back' }, '← Use a different email');
  var stageOtp = mk('div', { id: 'ez-stage-otp', style: 'display:none' },
    mk('h1', { text: 'Enter code' }),
    mk('p', { class: 'sub' }, 'A 6-digit code was sent to ', echo, '. It expires in a few minutes.'),
    mk('label', { for: 'ez-otp', text: 'Verification code' }),
    otpInput, verifyBtn, err2, backBtn
  );

  var foot = mk('div', { class: 'ez-foot' },
    'Access limited to elitez.asia and dhc.com.sg. Issues? Contact ',
    mk('b', { text: 'derrick@elitez.asia' }), '.'
  );

  var mark = mk('div', { class: 'ez-mark', text: 'Elitez · Admin' });
  var card = mk('div', { class: 'ez-card' }, mark, stageEmail, stageOtp, foot);
  var overlay = mk('div', { id: 'ez-auth-overlay' }, card);

  function whenBody(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  whenBody(function () {
    document.body.classList.add('ez-gate-locked');
    document.body.appendChild(overlay);
    wire();
  });

  function unlock() {
    if (document.body) document.body.classList.remove('ez-gate-locked');
    if (overlay.parentNode) overlay.remove();
    resolveReady(sb);
  }

  // Already-signed-in users skip the form entirely.
  sb.auth.getSession().then(function (r) { if (r.data && r.data.session) unlock(); });
  sb.auth.onAuthStateChange(function (_e, session) { if (session) unlock(); });

  // ── Form wiring ─────────────────────────────────────────────
  function wire() {
    var pendingEmail = '';

    function show(stage) {
      stageEmail.style.display = stage === 'email' ? '' : 'none';
      stageOtp.style.display = stage === 'otp' ? '' : 'none';
    }

    sendBtn.addEventListener('click', async function () {
      var email = (emailInput.value || '').trim().toLowerCase();
      err1.textContent = '';
      if (!email || email.indexOf('@') < 1) { err1.textContent = 'Enter a valid email address.'; return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      var res = await sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
      sendBtn.disabled = false; sendBtn.textContent = 'Send code';
      if (res.error) {
        var m = (res.error.message || '').toLowerCase();
        err1.textContent = (m.indexOf('restrict') > -1 || m.indexOf('authoriz') > -1 || m.indexOf('domain') > -1 || m.indexOf('403') > -1)
          ? 'This email domain is not authorized for admin access.'
          : (res.error.message || 'Could not send the code. Try again.');
        return;
      }
      pendingEmail = email;
      echo.textContent = email;
      show('otp');
      otpInput.focus();
    });

    verifyBtn.addEventListener('click', async function () {
      var token = (otpInput.value || '').trim();
      err2.textContent = '';
      if (!/^\d{6}$/.test(token)) { err2.textContent = 'Enter the 6-digit code.'; return; }
      verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying…';
      var res = await sb.auth.verifyOtp({ email: pendingEmail, token: token, type: 'email' });
      verifyBtn.disabled = false; verifyBtn.textContent = 'Verify & enter';
      if (res.error) { err2.textContent = res.error.message || 'Invalid or expired code.'; return; }
      unlock();
    });

    backBtn.addEventListener('click', function () {
      err1.textContent = ''; err2.textContent = ''; otpInput.value = '';
      show('email');
      emailInput.focus();
    });

    emailInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendBtn.click(); });
    otpInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') verifyBtn.click(); });
  }
})();
