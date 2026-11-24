# Post-Deployment Owner Action Plan

**Site:** https://arvindthevar.vercel.app  
**Owner:** Arvind Thevar  
**Role:** IT Infrastructure Trainer & Systems Engineer  
**Contact:** +91 88888 29652 | arvindthaver@gmail.com  
**Address:** Office No-2, First Floor, Kanchawala Avenue, College Rd, near BYK College, Kulkarni Baug, Nashik, Maharashtra 422005

This checklist outlines the manual tasks required by Arvind to maximize search visibility, claim ownership in search engines, connect analytics, and establish local search dominance in Nashik and nationwide.

---

## 🚨 Critical (Day 1 — Immediate Post-Deployment)

### 1. Google Search Console (GSC) Verification
- [ ] Go to [Google Search Console](https://search.google.com/search-console).
- [ ] Add Property: Enter `https://arvindthevar.vercel.app` (URL prefix) or use Domain Property if you have a custom domain.
- [ ] Verification Options:
  - **Option A (HTML Tag - Easiest for Vercel subdomain):** Copy the verification token (e.g., `google-site-verification=XYZ123`). In Vercel Project Settings > Environment Variables, add `VITE_GOOGLE_SITE_VERIFICATION=XYZ123` and trigger a redeploy.
  - **Option B (DNS TXT):** If using a custom domain, add the TXT record in your domain registrar's DNS management.
- [ ] **Submit Sitemap:** Once verified, navigate to **Sitemaps** on the left menu, enter `sitemap.xml`, and click **Submit**. Confirm that all 18 indexable URLs are discovered.

### 2. Bing Webmaster Tools
- [ ] Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
- [ ] Sign in with your Microsoft or Google account.
- [ ] Click **Import from Google Search Console** (fastest method — imports ownership and sitemap automatically in 1 click).
- [ ] Alternatively, copy the Bing verification code and set `VITE_BING_SITE_VERIFICATION` in Vercel environment variables.

### 3. Custom Domain Setup (Recommended: `arvindthevar.com` or `arvindthevar.in`)
- [ ] **Purchase Domain:** Buy `arvindthevar.com` or `arvindthevar.in` on Namecheap, Cloudflare Registrar, or GoDaddy.
- [ ] **Add to Vercel:** In Vercel > Project > Settings > **Domains**, enter your custom domain.
- [ ] **Configure DNS Records:**
  - `A` Record: `@` -> `76.76.21.21`
  - `CNAME` Record: `www` -> `cname.vercel-dns.com`
- [ ] **Set Canonical 301 Redirect:** Configure Vercel so `arvindthevar.vercel.app` permanently 301-redirects to your custom domain.
- [ ] **Update Single Source of Truth:** Change line 13 in `src/config/site.ts` to your new domain (or set `VITE_SITE_URL=https://arvindthevar.com` in Vercel Environment Variables). Sitemaps, canonicals, and Schema.org will update automatically on next build!

---

## 📈 High Priority (Week 1)

### 4. Google Business Profile (GBP) — Nashik Local SEO
Because local students and professionals search for *"Red Hat Linux training in Nashik"* and *"Cisco CCNA classes near me"*, a Google Business Profile is critical:
- [ ] Go to [Google Business Profile](https://business.google.com/).
- [ ] Create/claim profile with exact **NAP (Name, Address, Phone)** matching website Schema.org:
  - **Business Name:** Arvind Thevar — IT Infrastructure Training
  - **Category:** Training Centre / Computer Training School / Educational Consultant
  - **Address:** Office No-2, First Floor, Kanchawala Avenue, College Rd, near BYK College, Kulkarni Baug, Nashik, Maharashtra 422005
  - **Phone:** +91 88888 29652
  - **Website:** `https://arvindthevar.vercel.app` (or custom domain)
- [ ] Add photos of the lab workspace, Cisco networking rack, server equipment, and classroom sessions.
- [ ] Request postcard or video verification from Google.

### 5. Google Analytics 4 (GA4) Setup
- [ ] Create a GA4 property at [analytics.google.com](https://analytics.google.com/).
- [ ] Create a Web Data Stream and copy the **Measurement ID** (format: `G-XXXXXXXXXX`).
- [ ] In Vercel Project Settings > Environment Variables, add:
  ```
  VITE_GA_ID = G-XXXXXXXXXX
  ```
- [ ] Redeploy project. GA4 will track page views and custom conversion events (`enquiry_form_submit`, `phone_click`, `email_click`, `whatsapp_click`).

### 6. Social Profiles & Consistency Check
Confirm active links and matching branding on all profiles:
- [ ] **LinkedIn:** https://www.linkedin.com/in/arvind-thevar-9a87719a/ (ensure headline matches: *IT Trainer & IT Infrastructure Professional*)
- [ ] **Instagram:** https://www.instagram.com/arvindthevar
- [ ] **Facebook:** https://www.facebook.com/arvind.thevar.90
- [ ] **WhatsApp Business:** Set up WhatsApp Business on `+91 88888 29652` with catalog links to the website course pages.

---

## 🛡️ Medium Priority (Month 1 & Ongoing)

### 7. Student Review Collection Pipeline
- [ ] Generate your Google Review short link from your Google Business Profile dashboard.
- [ ] Send the link to past students who completed RHEL, CCNA, or AWS batches.
- [ ] When students post genuine reviews with keywords like *"hands-on Red Hat Linux lab"*, *"RHCSA pass"*, or *"CCNA routing troubleshooting"*, Google's local algorithm significantly boosts map pack rankings.
- [ ] Encourage students to also leave LinkedIn Recommendations.

### 8. Indian Education Directories & Local Citations
List the training center on leading Indian education portals with identical NAP details:
- [ ] **UrbanPro:** Register as an individual tutor / institute in Nashik for Linux & Cisco Networking.
- [ ] **Justdial:** Create a listing under *Computer Hardware & Networking Training Institutes in Nashik*.
- [ ] **Sulekha:** Add listing for *IT Infrastructure & Red Hat Certification Training*.
- [ ] **Superprof India:** Create an instructor profile highlighting 15+ years experience.

### 9. Content Cadence & Freshness
- [ ] **Batch Updates:** When new batch dates are scheduled, update `INITIAL_UPCOMING_BATCHES` in `src/data/portfolioData.ts`.
- [ ] **Technical Lab Articles:** Publish 1 new troubleshooting case study per month in `BLOGS` in `src/data/portfolioData.ts`. Articles on real industrial troubleshooting (e.g. *Troubleshooting OSPF neighbor adjacency errors*, *Resolving SELinux permission denials on Nginx*) drive high-intent organic traffic.
- [ ] **GSC Monitoring:** Check Google Search Console every 2 weeks for:
  - Indexed page count (should show all 18 pages indexed).
  - Search queries driving impressions and clicks.
  - Any 404 or mobile usability errors.

---

## 📝 Code Placeholders & TODO Items for Owner

The following items are ready in code and can be customized with specific details as they become available:

| File Location | Item Description | Action Needed |
| :--- | :--- | :--- |
| `src/config/site.ts` (Line 13) | `SITE_URL` | Update to your custom domain once purchased (e.g., `https://arvindthevar.com`). |
| `src/data/portfolioData.ts` (Lines 80-120) | `INITIAL_UPCOMING_BATCHES` | Update upcoming batch start dates, timings (weekday/weekend), and seats. |
| `src/data/coursesData.ts` | Course Fees & Batch Timings | Currently marked with practical exam objectives. Add specific batch pricing and schedules if you wish to display them publicly. |
| `src/components/ContactSection.tsx` | Form Destination Backend | The consultation form currently logs submissions and triggers GA4 conversion tracking. To receive emails directly, connect a form endpoint such as Formspree, Formkeep, or EmailJS. |
| Environment Variables (`.env.local` or Vercel) | `VITE_GA_ID` | Add your real Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`). |
| Environment Variables (`.env.local` or Vercel) | `VITE_GOOGLE_SITE_VERIFICATION` | Add your Search Console token for automated meta tag verification. |
| Environment Variables (`.env.local` or Vercel) | `VITE_BING_SITE_VERIFICATION` | Add your Bing Webmaster token. |
