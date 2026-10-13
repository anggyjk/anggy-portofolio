# ANGGY — Portfolio (dark anime cinematic)

Portofolio pribadi React + Vite: tema dark anime, futuristik, minimalis, sinematik.

## Menjalankan

```powershell
cd C:\Users\anggy\anggy-portfolio
npm install
npm run dev
```

Buka http://localhost:5173

## Build production

```powershell
npm run build
```

## Kustomisasi (wajib sebelum publish)

| Yang diganti | File |
|---|---|
| Nama, email, GitHub, Instagram | `src/data/site.js` |
| Angka statistik (saat ini placeholder) | `src/data/site.js` → `stats` |
| Daftar skill | `src/data/site.js` → `skills` |
| Proyek + link demo/source | `src/data/projects.js` |
| Ilustrasi karakter | `src/assets/character.svg` |
| Thumbnail proyek | `src/assets/*.svg` |
| File CV | `public/CV-Anggy.pdf` |

## Struktur

```
anggy-portfolio/
├── index.html
├── public/CV-Anggy.pdf
└── src/
    ├── main.jsx, App.jsx, index.css
    ├── data/site.js, data/projects.js
    ├── assets/character.svg + 4 thumbnail svg
    └── components/Navbar, Hero, About, Statistics,
        Projects, ProjectModal, Skills, Contact,
        Footer, Reveal, CursorGlow
```
