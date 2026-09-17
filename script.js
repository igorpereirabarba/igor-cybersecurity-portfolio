const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches || 'onmousemove' in window;

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Scroll progress + active dock section.
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

// Staggered reveal.
const revealGroups = document.querySelectorAll('.reveal-group');
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  revealGroups.forEach(el => revealObserver.observe(el));
} else {
  revealGroups.forEach(el => el.classList.add('is-visible'));
}

// Cursor + magnetic interaction.
if (finePointer && !prefersReducedMotion) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    document.body.classList.add('pointer-active');
    if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });

  const follow = () => {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  };
  follow();

  document.querySelectorAll('a, button, .work-card, .skill-zone, .credential').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('pointer-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('pointer-hover'));
  });

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('.spotlight-card, .cta').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  document.querySelectorAll('.tilt').forEach(el => {
    const strength = Number(el.dataset.tiltStrength || 4);
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1100px) rotateX(${py * -strength}deg) rotateY(${px * strength}deg) translateZ(0)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// Ambient parallax.
if (!prefersReducedMotion) {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  window.addEventListener('scroll', () => {
    parallaxEls.forEach(el => {
      const speed = Number(el.dataset.parallax || 0);
      el.style.transform = `translate3d(0, ${scrollY * speed / 100}px, 0)`;
    });
  }, { passive: true });
}

// Project case studies.
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
modal?.addEventListener('click', e => { if (e.target === modal) closeCaseStudy(); });
modal?.addEventListener('close', () => document.body.classList.remove('modal-open'));

// Live content refinements.
const primaryEmail = 'igorpereirabarbas@outlook.com';
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
  link.href = `mailto:${primaryEmail}`;
  const strong = link.querySelector('strong');
  if (strong && /@/.test(strong.textContent)) strong.textContent = primaryEmail;
});

// Replace unsupported incident-volume claims with a professional operations summary.
const terminalStats = document.querySelector('.terminal-stats');
if (terminalStats) {
  terminalStats.innerHTML = '<div><strong>3.9</strong><span>GPA</span></div><div><strong>77%</strong><span>Degree</span></div><div><strong>Multi</strong><span>Ticket + Project Work</span></div><div><strong>4×</strong><span>President\'s List</span></div>';
}
const expCounter = document.querySelector('.experience-counter');
if (expCounter) {
  expCounter.innerHTML = '<strong>Endpoint Ops</strong><span>ticket resolution · device deployments<br>printer configuration · onsite projects</span>';
}
const impactGrid = document.querySelector('.current-role .impact-grid');
if (impactGrid) {
  impactGrid.innerHTML = '<div><strong>Deploy</strong><span>Windows laptops, desktops, monitors and endpoint peripherals</span></div><div><strong>Support</strong><span>printers, scanners, network connectivity, Intune and user incidents</span></div>';
}

// Mark completed Cisco Networking Academy certificates as earned.
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

// Add hands-on home lab experience to the professional experience timeline.
const experienceStream = document.querySelector('.experience-stream');
if (experienceStream && !document.getElementById('home-lab-experience')) {
  const lab = document.createElement('article');
  lab.className = 'experience-item reveal-group home-lab-role is-visible';
  lab.id = 'home-lab-experience';
  lab.innerHTML = `
    <div class="experience-date reveal-item">2026 — PRESENT</div>
    <div class="experience-body">
      <div class="experience-company reveal-item">CYBERSECURITY HOME LAB <span>02</span></div>
      <h3 class="reveal-item">Security Operations & Infrastructure Lab<br><span>Independent Hands-On Experience</span></h3>
      <p class="reveal-item">Build and operate an isolated security lab spanning Windows, Ubuntu and Kali Linux. Centralize Windows and Sysmon telemetry in Splunk, investigate authentication and network activity, administer Linux services and permissions, practice endpoint hardening, vulnerability-management workflows and Python-based security automation.</p>
      <div class="experience-tags reveal-item"><span>Splunk</span><span>Sysmon</span><span>Windows Event Logs</span><span>Ubuntu</span><span>Kali Linux</span><span>Python</span><span>Wireshark</span><span>Nmap</span><span>MITRE ATT&CK</span></div>
      <div class="impact-grid reveal-item"><div><strong>Detect</strong><span>failed-logon activity, endpoint telemetry and investigation workflows</span></div><div><strong>Build</strong><span>Linux services, permissions, automation scripts and documented security labs</span></div></div>
    </div>`;
  const first = experienceStream.firstElementChild;
  if (first) first.insertAdjacentElement('afterend', lab); else experienceStream.appendChild(lab);
}
