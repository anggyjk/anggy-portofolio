// ===== Data identitas — EDIT DI SINI =====
// Ganti nilai di bawah dengan data asli Anda.

export const site = {
  name: "Anzy Kurniawan",
  brand: "ANZY",
  role: "Creative Developer / Front-End Developer",
  tagline:
    "Mahasiswa Informatika yang merancang pengalaman web sinematik — gelap, tajam, dan hidup.",
  email: "anggyjogokurniawan@webmail.umm.ac.id",
  github: "https://github.com/anggyjk",
  instagram: "https://instagram.com/zyknwn_",
  cvFile: "/CV-Anggy.pdf", // file di folder public/. Jika dihapus, tombol CV otomatis disembunyikan.
  year: new Date().getFullYear(),
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Works", href: "#works" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// PENTING: angka di bawah adalah PLACEHOLDER agar statistik bisa tampil.
// Ganti dengan angka asli Anda, atau hapus item yang belum ada datanya.
export const stats = [
  { value: 12, suffix: "+", label: "Projects" },
  { value: 8, suffix: "", label: "Technologies" },
  { value: 20, suffix: "+", label: "Experiments" },
  { value: 3, suffix: "", label: "Years Learning" },
];

export const skills = [
  { name: "HTML", note: "Semantic & accessible markup" },
  { name: "CSS", note: "Modern layout, animation" },
  { name: "JavaScript", note: "ES2023, DOM, async" },
  { name: "React", note: "Hooks, Vite, SPA" },
  { name: "Java", note: "OOP & kampus projects" },
  { name: "UI/UX Design", note: "Wireframe → hi-fi" },
  { name: "Git", note: "Branching & collaboration" },
  { name: "Responsive", note: "Mobile-first layouts" },
];
