# Vardhman Website — Company Guide

This guide is written for **Vardhman team members** who need to make changes to the website. No coding knowledge is required for most tasks. Each section explains exactly what to do, step by step.

---

## Table of Contents

1. [Who manages what](#1-who-manages-what)
2. [Accessing the Admin Portals](#2-accessing-the-admin-portals)
3. [Managing Job Postings (Careers)](#3-managing-job-postings-careers)
4. [Managing White Papers / POV Documents](#4-managing-white-papers--pov-documents)
5. [Changing Photos and Images](#5-changing-photos-and-images)
6. [Changing Text on a Page](#6-changing-text-on-a-page)
7. [Changing the Styling / Appearance](#7-changing-the-styling--appearance)
8. [Updating the Product Catalog](#8-updating-the-product-catalog)
9. [Adding a New Page](#9-adding-a-new-page)
10. [Updating the Search Results](#10-updating-the-search-results)
11. [Pushing Code and Redeploying the Website](#11-pushing-code-and-redeploying-the-website)
12. [Who to Contact for Help](#12-who-to-contact-for-help)

---

## 1. Who Manages What

| What you want to change | How |
|------------------------|-----|
| Job postings | Admin portal — no coding needed |
| White papers / PDF documents | Admin portal — no coding needed |
| Photos and images | Replace image files — needs developer |
| Text on pages | Edit template files — needs developer |
| Colors, fonts, layout | Edit CSS files — needs developer |
| Product catalog | Edit one JSON file — needs developer |
| Add a brand new page | Needs developer |
| Push updates live | Git + server restart — needs developer |

The two admin portals (Careers and POV) are designed for non-technical use. Everything else requires someone with basic coding knowledge or your developer.

---

## 2. Accessing the Admin Portals

The website has two separate admin panels — one for job postings and one for documents/white papers. They are password-protected and accessible from the live website.

### Careers Admin
- **URL**: `https://yourwebsite.com/careers/admin/login`
- Use this to: add jobs, edit jobs, remove jobs

### POV (White Papers) Admin
- **URL**: `https://yourwebsite.com/pov/admin/login`
- Use this to: upload white papers (PDFs), edit their descriptions, remove them

> **To get the admin passwords**, contact your website developer. The passwords are stored securely in the server configuration.

> **Sessions last 24 hours** — you will be logged out automatically after 24 hours and will need to log in again.

---

## 3. Managing Job Postings (Careers)

### How to Add a New Job

1. Go to `https://yourwebsite.com/careers/admin/login`
2. Enter your password and click **Login**
3. You will see the dashboard listing all current jobs
4. Click **Add New Job**
5. Fill in the form:
   - **Job Title** — e.g., "Senior Electronics Engineer"
   - **Department** — e.g., "R&D", "Operations"
   - **Location** — e.g., "Delhi, India"
   - **Job Type** — Full-time, Part-time, Contract
   - **Description** — Paste the full job description here
   - **Requirements** — Skills and qualifications needed
6. Click **Submit / Save**
7. The job will immediately appear on the public Careers page

### How to Edit an Existing Job

1. Log in to the Careers admin
2. Find the job in the dashboard list
3. Click **Edit** next to it
4. Make your changes
5. Click **Save**

### How to Remove a Job

1. Log in to the Careers admin
2. Find the job in the dashboard list
3. Click **Delete** next to it
4. Confirm the deletion

> Deleted jobs cannot be recovered. Make sure you want to remove it before confirming.

---

## 4. Managing White Papers / POV Documents

The **POV** (Point of View) section of the website is where you publish white papers, technical documents, and research PDFs.

### How to Upload a New Document

1. Go to `https://yourwebsite.com/pov/admin/login`
2. Enter your password and click **Login**
3. Click **Add New POV**
4. Fill in the form:
   - **Title** — Name of the document
   - **Description** — A short summary of what the document covers
   - **Author / Source** — Who wrote it
   - **Upload PDF** — Click to select and upload the PDF file from your computer
5. Click **Submit / Save**
6. The document will appear on the public POV page with a download link

### How to Edit a Document's Details

1. Log in to the POV admin
2. Find the document in the dashboard
3. Click **Edit**
4. Update the title, description, or other text fields
5. Click **Save**

> If you need to replace the PDF file itself, delete the entry and create a new one with the updated file.

### How to Remove a Document

1. Log in to the POV admin
2. Find the document in the dashboard
3. Click **Delete**
4. Confirm the deletion

---

## 5. Changing Photos and Images

Images are stored as files inside the project. To change a photo, you replace the image file with a new one that has the **exact same filename**.

### Where Images Are Stored

All images are inside the `public/images/` folder, organized by section:

| Folder | What it contains |
|--------|-----------------|
| `public/images/about/` | Photos on the About page (team, facility, etc.) |
| `public/images/director/` | Director / management headshots |
| `public/images/home/` | Images on the Homepage |
| `public/images/products/` | Product photos |
| `public/images/airport/` | Airfield lighting product images |
| `public/images/solutions/` | Case study images |
| `public/images/caseStudies/` | Airport project photos (Calicut, Palam, Ayodhya) |
| `public/images/clients/` | Client company logos |
| `public/images/certificates/` | Certification images |
| `public/images/training/` | Training program images |

### How to Replace a Photo

1. Find the image file you want to replace by browsing the folder above
2. Note the exact filename (e.g., `director1.jpg`)
3. Prepare your new image — **resize it to the same dimensions as the original** for best results
4. **Rename your new image to exactly the same filename** as the one you are replacing (e.g., rename it to `director1.jpg`)
5. Copy the new file into the same folder, replacing the old one
6. Push the changes to the server (see Section 11)

> **Important**: The filename must be identical — same name, same extension (`.jpg`, `.png`, etc.). If the name is different, the website will show a broken image.

> **Tip**: To check the current dimensions of an image, right-click it on Windows → Properties → Details.

### If You Need to Add a Brand New Image (Not Replacing)

This requires a developer because the image also needs to be referenced in the page template or product data. Contact your developer.

### Converting Images to WebP (Faster Loading)

The website loads faster when images are in **WebP format** — a modern format that makes image files 25–35% smaller without any visible quality difference. After you add or replace any images, you should run the converter.

**How to convert (one double-click):**

1. Open the project folder on your computer
2. Find the file called **`CONVERT TO WEBP.bat`**
3. Double-click it
4. A black window will appear and show the progress — wait for it to finish
5. When it says **"Done!"**, press any key to close it

That's it. The original `.jpg` / `.png` files are kept — nothing is deleted. The converter simply creates an additional `.webp` version of each image alongside the original.

> **When to run it:** Any time you add or replace images on the website, run the converter once before pushing the changes live.

> **First time only:** The first time you run it, it will install a small helper tool automatically. This may take about a minute and requires an internet connection.

---

## 6. Changing Text on a Page

Text content is written inside **template files** (`.ejs` files) inside the `views/` folder. You need someone with basic coding access to edit these.

### Which File Controls Which Page

| Page you see | File to edit |
|-------------|-------------|
| Home page | `views/home.ejs` |
| About page | `views/about.ejs` |
| Contact page | `views/contact.ejs` |
| News page | `views/news.ejs` |
| Navigation bar (top menu) | `views/partials/header.ejs` |
| Footer | `views/partials/footer.ejs` |
| Product listing page | `views/products/index.ejs` |
| Individual product page | `views/products/product.ejs` |
| Solutions / Case Studies listing | `views/solutions/index.ejs` |
| Individual case study | `views/solutions/solution.ejs` |
| Careers listing | `views/careers/index.ejs` |
| POV / White papers listing | `views/pov/index.ejs` |

### How to Edit Text (with developer help)

1. Open the relevant `.ejs` file listed above in a text editor (VS Code works well)
2. Use **Ctrl + F** to search for the text you want to change
3. Edit the text directly — avoid touching any code that looks like `<% ... %>` or `<%= ... %>` as those are dynamic parts
4. Save the file
5. Push the changes (see Section 11)

---

## 7. Changing the Styling / Appearance

Styling (colors, fonts, spacing, layout) is controlled by CSS files inside `public/css/`. Each page has its own CSS file.

### Which CSS File Controls Which Page

| Page | CSS file |
|------|---------|
| Home page | `public/css/home.css` |
| About page | `public/css/about.css` |
| Product listing | `public/css/products.css` |
| Individual product | `public/css/product.css` |
| Category page | `public/css/category.css` |
| Careers page | `public/css/careers.css` |
| POV page | `public/css/pov.css` |
| Admin panel | `public/css/admin.css` |
| Case studies | `public/css/case-studies.css` |
| Navigation bar | `public/css/navbar.css` |

### How to Change a Color (Example)

1. Open the CSS file for the page you want to change
2. Use **Ctrl + F** to search for the current color code (e.g., `#003366` or `blue`)
3. Replace it with your desired color — use a color name (`navy`) or hex code (`#003366`)
4. Save and push the changes (see Section 11)

> **Finding color codes**: Use Google's color picker — search "color picker" and you can copy the hex code of any color.

---

## 8. Updating the Product Catalog

All product information — names, descriptions, categories, specifications, and datasheet links — is stored in one file:

**`data/products.json`**

This is a structured text file. Each product entry looks like this:

```
{
  "id": "apron-flood-light",
  "name": "Apron Flood Light",
  "description": "High-intensity LED flood lighting for aircraft apron areas...",
  "category": "Airfield Ground Lights",
  "sector": "airport",
  "image": "/images/airport/AFL.jpg",
  "specs": {
    "wattage": "150W",
    "voltage": "230V AC"
  }
}
```

### How to Edit a Product

1. Open `data/products.json` in VS Code or any text editor
2. Use **Ctrl + F** to search for the product name
3. Edit the text values (name, description, specs, etc.)
4. Make sure you do **not** delete any of the `"` quote marks, `:` colons, or `{ }` braces — the format must stay intact
5. Save the file and push (see Section 11)

### How to Add a New Product

Copy an existing product entry from the JSON file, paste it after the last entry (before the closing `]`), update all the fields, and make sure to separate it from the previous entry with a comma.

### How to Upload a New Datasheet (PDF)

1. Place the PDF file inside `data/downloads/`
2. Update the product entry in `products.json` to reference it:
   ```
   "downloads": ["/downloads/your-file.pdf"]
   ```

> **Tip**: If you are unsure whether the JSON format is still valid after editing, paste the file contents into [jsonlint.com](https://jsonlint.com) — it will tell you if anything is broken.

---

## 9. Adding a New Page

Adding a completely new page to the website requires a developer. Here is what they will need to do:

1. Create a new route file in `routes/`
2. Create a new template file in `views/`
3. Create a CSS file in `public/css/`
4. Register the route in `index.js`
5. Add the page link to the navigation in `views/partials/header.ejs`
6. Add the page content to the search index at `public/data/test.json`

Provide your developer with:
- The page URL you want (e.g., `/gallery`)
- The page content (text, images, layout description)
- Any design reference or mockup

---

## 10. Updating the Search Results

The website search reads from a file called `public/data/test.json`. When new pages or products are added, this file must be updated manually so the new content appears in search results.

A developer needs to open `public/data/test.json` and add a new entry for each new piece of content in this format:

```json
{
  "title": "Page or Product Name",
  "description": "Short summary of what this content is about",
  "url": "/path/to/page"
}
```

If you add a new product, job posting, or page and users cannot find it in search, ask your developer to update this file.

---

## 11. Pushing Code and Redeploying the Website

After any file change (images, text, CSS, JSON), the changes must be pushed to the server for them to appear on the live website. This is done using **Git**.

### Prerequisites

- Git must be installed on your computer
- You must have access to the project repository
- You must have SSH or HTTPS access to push to the repository

### Step-by-Step: Push Changes and Redeploy

Open a terminal (Command Prompt or PowerShell on Windows) in the project folder and run:

```bash
# Step 1: Check what files you changed
git status

# Step 2: Stage your changes (add specific files)
git add public/images/director/director1.jpg
# OR to add everything at once:
git add .

# Step 3: Write a short description of what you changed
git commit -m "Updated director photo and product descriptions"

# Step 4: Push to the remote repository
git push origin main
```

### After Pushing

Depending on how the server is set up, you may also need to:

1. SSH into the server
2. Navigate to the project folder
3. Pull the latest code: `git pull origin main`
4. Restart the application:
   ```bash
   npm start
   # or if using a process manager like PM2:
   pm2 restart all
   ```

> If the server is set up with **automatic deployment** (e.g., connected to the repository via a webhook), pushing to the `main` branch may trigger a redeploy automatically. Ask your developer whether this is configured.

### What Not to Do

- **Do not edit files directly on the server** without also updating them in the repository — the next deployment will overwrite your server changes.
- **Do not delete the `out/sessions/` folder** while the server is running — it stores active user sessions.
- **Do not modify the `.env` file** on your local machine and push it — it contains live credentials.

---

## 12. Who to Contact for Help

For changes that require a developer (text edits, new pages, product catalog, deployment), reach out to:

**Developer**: Aryan
**Contact**: aryankansal15@gmail.com

When contacting, please describe:
1. Which page or section you want to change
2. What exactly needs to change (be specific — attach a screenshot if possible)
3. Any new content you want added (text, images, PDFs)

The more detail you provide, the faster the change can be made.

---

## Quick Reference Card

| Task | Who | Where |
|------|-----|-------|
| Add / edit / remove a job posting | Anyone (Admin Portal) | `/careers/admin/login` |
| Upload / remove a white paper | Anyone (Admin Portal) | `/pov/admin/login` |
| Replace a photo | Developer | `public/images/` |
| Change page text | Developer | `views/*.ejs` |
| Change colors / layout | Developer | `public/css/*.css` |
| Add / edit a product | Developer | `data/products.json` |
| Add a new page | Developer | Multiple files |
| Update search index | Developer | `public/data/test.json` |
| Push changes live | Developer | Git + server |
