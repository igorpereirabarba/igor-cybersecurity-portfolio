const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// -----------------------------------------------------------------------------
// Scroll progress + active dock state
// -----------------------------------------------------------------------------
const progressBar = document.querySelector('.scroll-progress span');
const dockLinks = [...document.querySelectorAll('.dock-item')];
const sections = dockLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? scrollY / max : 0;
  if (progressBar) progressBar.style.width = `${pct * 100}%`;

  let active = sections[0]?.id;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= innerHeight * 0.46) active = section.id;
  });
  dockLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// -----------------------------------------------------------------------------
// Scroll reveals
// -----------------------------------------------------------------------------
const revealObserver = !prefersReducedMotion && 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
  : null;

function registerReveal(root = document) {
  root.querySelectorAll?.('.reveal-group').forEach(el => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  });
}
registerReveal();

// -----------------------------------------------------------------------------
// Premium cursor / magnetic interaction system
// Restores the green follower ring around the normal mouse pointer and keeps all
// cards, spotlights and magnetic controls synchronized to the same coordinates.
// Uses pointer events directly instead of media-query gating so desktop Chrome,
// touch-capable laptops and mixed-input devices all behave consistently.
// -----------------------------------------------------------------------------
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let pointerIsMouse = false;
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let ringRAF = null;

if (dot && ring) {
  // Stronger, unmistakable Awwwards-style follower.
  Object.assign(ring.style, {
    width: '42px',
    height: '42px',
    border: '1.5px solid rgba(135,255,202,.88)',
    boxShadow: '0 0 18px rgba(135,255,202,.22), inset 0 0 14px rgba(135,255,202,.05)',
    background: 'rgba(135,255,202,.025)',
    transition: 'width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1), background .28s ease, border-color .28s ease, box-shadow .28s ease, opacity .2s ease'
  });
  Object.assign(dot.style, {
    width: '5px',
    height: '5px',
    background: '#87ffca',
    boxShadow: '0 0 16px #87ffca'
  });

  const animateFollower = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    ringRAF = requestAnimationFrame(animateFollower);
  };
  animateFollower();

  window.addEventListener('pointermove', event => {
    // Mouse and pen get the visual follower; touch remains native and uncluttered.
    if (event.pointerType === 'touch') return;
    pointerIsMouse = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.classList.add('pointer-active');
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    // Cursor-synced ambient movement gives the whole page a subtle tactile feel.
    const nx = mouseX / innerWidth - 0.5;
    const ny = mouseY / innerHeight - 0.5;
    document.documentElement.style.setProperty('--cursor-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${mouseY}px`);
    document.querySelectorAll('.ambient').forEach((el, i) => {
      const strength = [9, -7, 5][i] || 5;
      el.style.marginLeft = `${nx * strength}px`;
      el.style.marginTop = `${ny * strength}px`;
    });
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    document.body.classList.remove('pointer-active', 'pointer-hover');
  });

  // One delegated hover system also works for dynamically injected content.
  document.addEventListener('pointerover', event => {
    if (!pointerIsMouse && event.pointerType === 'touch') return;
    const interactive = event.target.closest('a, button, .work-card, .feature-project, .skill-zone, .credential, .experience-item, .lab-experience-card');
    if (!interactive) return;
    document.body.classList.add('pointer-hover');
    Object.assign(ring.style, {
      width: '64px',
      height: '64px',
      background: 'rgba(135,255,202,.075)',
      borderColor: 'rgba(135,255,202,1)',
      boxShadow: '0 0 26px rgba(135,255,202,.30), inset 0 0 18px rgba(135,255,202,.08)'
    });
  });

  document.addEventListener('pointerout', event => {
    const fromInteractive = event.target.closest?.('a, button, .work-card, .feature-project, .skill-zone, .credential, .experience-item, .lab-experience-card');
    if (!fromInteractive) return;
    const toInteractive = event.relatedTarget?.closest?.('a, button, .work-card, .feature-project, .skill-zone, .credential, .experience-item, .lab-experience-card');
    if (toInteractive) return;
    document.body.classList.remove('pointer-hover');
    Object.assign(ring.style, {
      width: '42px',
      height: '42px',
      background: 'rgba(135,255,202,.025)',
      borderColor: 'rgba(135,255,202,.88)',
      boxShadow: '0 0 18px rgba(135,255,202,.22), inset 0 0 14px rgba(135,255,202,.05)'
    });
  });
}

// Pointer-synced spotlights for cards and CTAs.
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const spotlight = event.target.closest('.spotlight-card, .cta, .work-card, .feature-project, .lab-experience-card');
  if (spotlight) {
    const rect = spotlight.getBoundingClientRect();
    spotlight.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    spotlight.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }
}, { passive: true });

// Magnetic pull. Event delegation keeps it working after DOM injections.
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const el = event.target.closest('.magnetic');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  el.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  el.style.setProperty('--my', `${event.clientY - rect.top}px`);
});

document.addEventListener('pointerout', event => {
  const el = event.target.closest?.('.magnetic');
  if (el && !event.relatedTarget?.closest?.('.magnetic')) el.style.transform = '';
});

// 3D card tilt.
document.querySelectorAll('.tilt').forEach(el => {
  const strength = Number(el.dataset.tiltStrength || 4);
  el.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${py * -strength}deg) rotateY(${px * strength}deg) translateZ(0)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

// Ambient scroll parallax remains disabled for reduced-motion users.
if (!prefersReducedMotion) {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', () => {
    parallaxEls.forEach(el => {
      const speed = Number(el.dataset.parallax || 0);
      el.style.transform = `translate3d(0, ${scrollY * speed / 100}px, 0)`;
    });
  }, { passive: true });
}

// -----------------------------------------------------------------------------
// Project case studies
// -----------------------------------------------------------------------------
const projectData = {
  soc: {
    kicker: 'CASE 01 / SECURITY MONITORING',
    title: 'SOC Monitoring & Detection Lab',
    summary: 'A complete home-SOC signal path from controlled event generation to centralized collection, SPL investigation, dashboarding and incident documentation.',
    objective: 'Create a repeatable environment that simulates junior-SOC work instead of learning tools in isolation: ingest telemetry, generate suspicious activity, detect it, investigate context and document a conclusion.',
    tools: 'Ubuntu · Splunk Enterprise · Splunk Universal Forwarder · Windows 10/11 · Sysmon · Kali Linux · SPL · VirtualBox · Wireshark · Nmap',
    workflow: 'Windows produces Security and Sysmon telemetry → Universal Forwarder sends data to the Ubuntu Splunk server on TCP 9997 → controlled failed-login and network events are generated → SPL isolates Event ID 4625 activity → surrounding telemetry is reviewed → findings are documented.',
    outcome: 'Searchable endpoint telemetry, a working failed-logon detection use case, a Splunk dashboard, MITRE ATT&CK T1110 mapping and reproducible investigation notes.'
  },
  automation: {
    kicker: 'CASE 02 / SECURITY AUTOMATION',
    title: 'Failed-Login Alerting & Incident Automation',
    summary: 'Python automation for repetitive SOC triage that keeps human judgment in the loop while standardizing how suspicious login activity is surfaced and reported.',
    objective: 'Reduce repetitive counting and formatting so an analyst can spend more time assessing whether activity is benign, misconfigured or malicious.',
    tools: 'Python · CSV / structured log data · threshold logic · Windows Event ID 4625 · MITRE ATT&CK',
    workflow: 'Read failed-login records → group relevant activity → apply a five-or-more-failures threshold → write an alert → generate a structured report containing an incident ID, status, severity, evidence and MITRE mapping.',
    outcome: 'Consistent analyst-ready incident output, including HIGH severity examples mapped to T1110, while preserving the underlying evidence required for review.'
  },
  phishing: {
    kicker: 'CASE 03 / EMAIL SECURITY',
    title: 'Python Phishing Email Detector',
    summary: 'An explainable phishing-triage project designed to show why a message was flagged rather than produce an opaque yes/no answer.',
    objective: 'Turn common social-engineering indicators into a transparent triage workflow that could later be extended with reputation and enrichment sources.',
    tools: 'Python · email headers/content · URL parsing · sender-domain comparison · keyword/risk heuristics',
    workflow: 'Parse message fields → inspect sender/domain relationships → extract and evaluate links → look for urgency or pressure language → flag attachment indicators → produce human-readable reasons for review.',
    outcome: 'A growing analyst-oriented phishing detector emphasizing explainability, evidence and extensibility over black-box classification.'
  },
  vulnerability: {
    kicker: 'CASE 04 / VULNERABILITY MANAGEMENT',
    title: 'Vulnerability Management Lab',
    summary: 'A remediation-focused lab that treats scanning as the beginning of the work, not the deliverable.',
    objective: 'Practice the real vulnerability-management loop across isolated Windows and Linux assets: identify exposure, prioritize intelligently, remediate, validate and communicate residual risk.',
    tools: 'Windows · Ubuntu · Kali Linux · Nmap · CVSS · configuration hardening · patching',
    workflow: 'Discover hosts/services → record finding and evidence → evaluate severity plus asset context/exploitability → patch or harden → rescan → compare before/after evidence → record residual risk or follow-up.',
    outcome: 'Repeatable vulnerability records that show prioritization, remediation decisions and proof that changes actually reduced exposure.'
  },
  linux: {
    kicker: 'CASE 05 / SYSTEMS ADMINISTRATION',
    title: 'Linux Server Administration Lab',
    summary: 'Hands-on Ubuntu administration built around operating a real lab service instead of isolated command memorization.',
    objective: 'Build infrastructure depth behind security operations by owning the host, service, network identity, permissions, logging and recovery considerations of a working Ubuntu server.',
    tools: 'Ubuntu · Linux CLI · users/groups · permissions · services · SSH · logging · firewall controls · Splunk · VirtualBox',
    workflow: 'Configure the host and network → operate services → manage users/groups and filesystem permissions → inspect logs → validate reachability/listening ports → troubleshoot by layer → document changes and recovery steps.',
    outcome: 'A functioning Ubuntu-based Splunk server plus a repeatable administration and troubleshooting process that separates host, network, service and ingestion issues.'
  },
  network: {
    kicker: 'CASE 06 / NETWORK + ENDPOINT DEFENSE',
    title: 'Network Security & Windows Hardening',
    summary: 'Labs connecting network fundamentals to endpoint defense and security investigation so traffic, identity and host telemetry are understood together.',
    objective: 'Strengthen practical understanding of how hosts communicate, how exposure is discovered and how Windows controls and telemetry change the defensive picture.',
    tools: 'TCP/IP · DHCP · DNS · VLAN/NAT · subnetting · Wireshark · Nmap · Windows Firewall · BitLocker · Event Viewer · Sysmon',
    workflow: 'Build and troubleshoot network paths → inspect packet behavior → perform authorized host/service discovery → apply firewall, patching, permission and account controls → validate logging and endpoint visibility.',
    outcome: 'Stronger packet-level reasoning, attack-surface awareness and endpoint-hardening practice that directly supports SOC alert investigation.'
  },
  workflow: {
    kicker: 'CASE 07 / INCIDENT RESPONSE THINKING',
    title: 'Incident Investigation Walkthrough',
    summary: 'A structured investigation sequence for repeated authentication failures that distinguishes finding an event from deciding whether it is actually an incident.',
    objective: 'Practice evidence-based triage and escalation using the same disciplined sequence each time rather than jumping from one log line to a conclusion.',
    tools: 'Splunk · Windows Security Event Logs · Sysmon · network telemetry · incident documentation',
    workflow: 'Validate source/host/time/event → establish scope → look for successful logons and related events → correlate endpoint/network context → test benign explanations → determine containment/escalation need → document evidence and recommendation.',
    outcome: 'Concise investigation notes another analyst could follow, including rationale for false-positive classification or escalation.'
  }
};

const modal = document.getElementById('caseModal');
const modalEls = {
  kicker: document.getElementById('modalKicker'),
  title: document.getElementById('modalTitle'),
  summary: document.getElementById('modalSummary'),
  objective: document.getElementById('modalObjective'),
  tools: document.getElementById('modalTools'),
  workflow: document.getElementById('modalWorkflow'),
  outcome: document.getElementById('modalOutcome')
};
let lastTrigger = null;

function openCaseStudy(key, trigger) {
  const data = projectData[key];
  if (!modal || !data) return;
  lastTrigger = trigger || null;
  Object.entries(modalEls).forEach(([name, el]) => { if (el) el.textContent = data[name]; });
  const repoLink = document.getElementById('modalRepoLink');
  if (repoLink && trigger?.dataset?.repo) repoLink.href = trigger.dataset.repo;
  modal.showModal();
  document.body.classList.add('modal-open');
}

function closeCaseStudy() {
  if (!modal) return;
  modal.close();
  document.body.classList.remove('modal-open');
  lastTrigger?.focus();
}

document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => openCaseStudy(button.dataset.project, button));
});
document.querySelector('.modal-close')?.addEventListener('click', closeCaseStudy);
modal?.addEventListener('click', event => { if (event.target === modal) closeCaseStudy(); });
modal?.addEventListener('close', () => document.body.classList.remove('modal-open'));

// -----------------------------------------------------------------------------
// Portfolio content refinements
// -----------------------------------------------------------------------------
const primaryEmail = 'igorpereirabarbas@outlook.com';
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
  link.href = `mailto:${primaryEmail}`;
  const strong = link.querySelector('strong');
  if (strong && /@/.test(strong.textContent)) strong.textContent = primaryEmail;
});

// Keep structured profile data aligned with the public contact address.
const structuredProfile = document.querySelector('script[type="application/ld+json"]');
if (structuredProfile) {
  try {
    const data = JSON.parse(structuredProfile.textContent);
    data.email = `mailto:${primaryEmail}`;
    structuredProfile.textContent = JSON.stringify(data);
  } catch (_) {}
}

// Professional operations language instead of a fixed weekly incident count.
const terminalStats = document.querySelector('.terminal-stats');
if (terminalStats) {
  terminalStats.innerHTML = '<div><strong>3.9</strong><span>GPA</span></div><div><strong>77%</strong><span>Degree</span></div><div><strong>OPS</strong><span>Tickets + Projects</span></div><div><strong>4×</strong><span>President\'s List</span></div>';
}
const expCounter = document.querySelector('.experience-counter');
if (expCounter) {
  expCounter.innerHTML = '<strong>Endpoint Ops</strong><span>ticket resolution · device deployments<br>printer configuration · onsite projects</span>';
}
const impactGrid = document.querySelector('.current-role .impact-grid');
if (impactGrid) {
  impactGrid.innerHTML = '<div><strong>Deploy</strong><span>Windows laptops, desktops, monitors and endpoint peripherals</span></div><div><strong>Support</strong><span>printers, scanners, network connectivity, Intune and user incidents</span></div>';
}

// Completed Cisco Networking Academy certificates.
document.querySelectorAll('.credential').forEach(card => {
  const heading = card.querySelector('h3');
  if (heading && heading.textContent.includes('Junior Cybersecurity Analyst')) {
    const state = card.querySelector('.cred-state');
    const icon = card.querySelector('b');
    if (state) {
      state.textContent = 'EARNED';
      state.classList.remove('training', 'studying');
      state.classList.add('earned');
    }
    if (icon) icon.textContent = '✓';
  }
});

// -----------------------------------------------------------------------------
// Dedicated Home Lab Experience section
// -----------------------------------------------------------------------------
const projectsSection = document.getElementById('projects');
if (projectsSection && !document.getElementById('home-lab-experience')) {
  const labSection = document.createElement('section');
  labSection.id = 'home-lab-experience';
  labSection.className = 'section-shell home-lab-experience';
  labSection.innerHTML = `
    <div class="shell">
      <div class="section-intro reveal-group is-visible">
        <div class="section-index reveal-item">02 — HOME LAB EXPERIENCE</div>
        <h2 class="section-title reveal-item">Built by doing.<br><span>Tested in my own lab.</span></h2>
        <p class="section-copy reveal-item">Independent hands-on cybersecurity experience across security monitoring, Linux administration, endpoint hardening, network analysis, incident investigation, vulnerability management and security automation.</p>
      </div>
      <div class="home-lab-grid">
        <a class="lab-experience-card spotlight-card magnetic" href="https://github.com/igorpereirabarba/home-soc-lab" target="_blank" rel="noopener">
          <small>01 / SECURITY OPERATIONS</small><h3>SOC Monitoring & Detection</h3><p>Centralized Windows and Sysmon telemetry in Splunk, investigated failed-authentication activity, built SPL searches and mapped behavior to MITRE ATT&CK.</p><span>Splunk · Sysmon · Event 4625 · T1110 ↗</span>
        </a>
        <a class="lab-experience-card spotlight-card magnetic" href="https://github.com/igorpereirabarba/linux-server-administration" target="_blank" rel="noopener">
          <small>02 / INFRASTRUCTURE</small><h3>Linux Server Administration</h3><p>Operate an Ubuntu server, configure SSH, manage users/groups and permissions, validate services, networking and controlled shared resources.</p><span>Ubuntu · SSH · systemctl · permissions ↗</span>
        </a>
        <a class="lab-experience-card spotlight-card magnetic" href="https://github.com/igorpereirabarba/network-security-windows-hardening" target="_blank" rel="noopener">
          <small>03 / ENDPOINT + NETWORK</small><h3>Hardening & Traffic Analysis</h3><p>Practice packet analysis, host discovery, Windows security controls, firewall review, logging, patching and endpoint visibility.</p><span>Wireshark · Nmap · Windows · Sysmon ↗</span>
        </a>
        <a class="lab-experience-card spotlight-card magnetic" href="https://github.com/igorpereirabarba/security-log-automation" target="_blank" rel="noopener">
          <small>04 / AUTOMATION</small><h3>Security Automation</h3><p>Use Python to process failed-login records, apply detection thresholds and generate structured analyst alerts and incident reports.</p><span>Python · detection logic · reporting ↗</span>
        </a>
      </div>
    </div>`;
  projectsSection.insertAdjacentElement('afterend', labSection);

  // Self-contained visual layer so the new section matches the existing design
  // without replacing the site's original stylesheet architecture.
  const style = document.createElement('style');
  style.textContent = `
    .home-lab-experience{overflow:hidden;background:linear-gradient(180deg,rgba(9,11,24,.15),rgba(9,11,24,.72),rgba(5,6,17,.2));border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}
    .home-lab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:54px}
    .lab-experience-card{--mx:50%;--my:50%;position:relative;min-height:275px;padding:30px;border:1px solid rgba(255,255,255,.11);border-radius:26px;background:linear-gradient(145deg,rgba(18,22,42,.72),rgba(8,10,22,.48));backdrop-filter:blur(20px);text-decoration:none;overflow:hidden;transition:border-color .35s ease,box-shadow .45s cubic-bezier(.22,1,.36,1),background .35s ease}
    .lab-experience-card:before{content:'';position:absolute;inset:0;background:radial-gradient(380px circle at var(--mx) var(--my),rgba(135,255,202,.12),transparent 52%);opacity:.18;transition:opacity .3s ease;pointer-events:none}
    .lab-experience-card:hover{border-color:rgba(135,255,202,.33);box-shadow:0 26px 70px rgba(0,0,0,.3),0 0 0 1px rgba(135,255,202,.03) inset}
    .lab-experience-card:hover:before{opacity:1}
    .lab-experience-card small{position:relative;color:#87ffca;font:500 .65rem/1 DM Mono,monospace;letter-spacing:.11em}
    .lab-experience-card h3{position:relative;margin:42px 0 14px;font:600 clamp(1.45rem,2.2vw,2.2rem)/1 Space Grotesk,sans-serif;letter-spacing:-.04em}
    .lab-experience-card p{position:relative;margin:0 0 28px;color:#aeb6ce;font-size:.92rem;max-width:560px}
    .lab-experience-card>span{position:absolute;left:30px;bottom:26px;color:#818ba6;font:500 .64rem/1.3 DM Mono,monospace;letter-spacing:.04em}
    @media(max-width:760px){.home-lab-grid{grid-template-columns:1fr}.lab-experience-card{min-height:245px}}
  `;
  document.head.appendChild(style);
}

// Keep experience numbering visually sensible after adding a separate lab section.
document.querySelectorAll('#experience .experience-company span').forEach((el, index) => {
  el.textContent = String(index + 1).padStart(2, '0');
});
