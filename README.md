# Igor Barbosa — Cybersecurity & IT Portfolio

Static portfolio website built for cybersecurity, SOC/MDR, incident response, endpoint security, Linux/infrastructure, network support and enterprise IT opportunities in Dallas–Fort Worth.

## Highlights

- Responsive, dependency-free HTML/CSS/JavaScript
- GitHub Pages ready (`.nojekyll` included)
- Dallas relocation positioning
- Security Operations / MDR / Incident Response hero positioning
- SOC monitoring and detection lab with Splunk, Sysmon and Windows telemetry
- Failed-login detection (Event ID 4625 / MITRE ATT&CK T1110)
- Python failed-login alerting and incident-report automation
- Python phishing-email detector project
- Vulnerability-management lab
- Linux server-administration lab
- Network security and Windows hardening labs
- Mass General Brigham Digital endpoint-operations experience
- SNHU cybersecurity education, honors and certification progress
- Downloadable cybersecurity and IT-support master résumés

## Deploy to GitHub Pages

1. Create a new public GitHub repository, for example `cybersecurity-portfolio`.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will publish the site at a URL similar to:
   `https://YOUR-USERNAME.github.io/cybersecurity-portfolio/`

Because all links and assets use relative paths, the site works correctly from a repository subpath.

## Local preview

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Personalize before publishing

- Replace or add direct project repository URLs once each project has its own GitHub repo.
- Consider creating a public résumé version without a phone number if you prefer not to expose it in a public GitHub repository. The included PDFs are the current Dallas master résumés.
- Add screenshots to an `assets/screenshots/` directory later if you want visual proof of Splunk dashboards, Linux terminal work, vulnerability rescans or Python output.
- Optional: connect a custom domain after GitHub Pages is live.

## Suggested repository topics

`cybersecurity` `soc` `splunk` `sysmon` `incident-response` `python` `linux` `vulnerability-management` `windows-security` `portfolio`

## File structure

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── .nojekyll
└── assets/
    ├── favicon.svg
    ├── Igor_Barbosa_Cybersecurity_Master_Resume_Dallas.pdf
    └── Igor_Barbosa_IT_Support_Master_Resume_Dallas.pdf
```

## Design system update

The portfolio uses a custom dark interactive design with a floating dock, mouse-reactive spotlight/tilt cards, magnetic controls, scroll-triggered reveals, ambient parallax, animated project previews, and accessible project case-study dialogs. Motion automatically reduces when the visitor enables `prefers-reduced-motion`, and pointer-heavy effects are disabled on touch devices.
