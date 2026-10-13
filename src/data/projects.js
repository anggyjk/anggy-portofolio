import workScore from "../assets/work-score.svg";
import workGta from "../assets/work-gta.svg";
import workMemory from "../assets/work-memory.svg";
import workPortfolio from "../assets/work-portfolio.svg";

// badge: status khusus, mis. "Sedang Berjalan" untuk project on-going.
// demoUrl / sourceUrl: isi URL asli bila sudah dipublish,
// biarkan null bila belum — tombolnya otomatis disembunyikan.

export const projects = [
  {
    id: "kenangan-kelas",
    no: "01",
    title: "Kenangan Kelas SMA",
    category: "Memorial Website",
    badge: null,
    thumb: workMemory,
    short: "Website kenangan untuk kelas SMA — galeri foto dan cerita bareng.",
    description:
      "Website kenangan yang dibuat untuk kelas waktu SMA: galeri foto bareng, daftar nama teman sekelas, dan momen-momen berkesan selama tiga tahun. Dibuat simpel dan hangat supaya bisa dibuka kapan saja buat nostalgia.",
    tech: ["HTML", "CSS", "JavaScript"],
    demoUrl: null,
    sourceUrl: null,
    year: "2023",
  },
  {
    id: "pentungan-scoreboard",
    no: "02",
    title: "Pentungan Scoreboard",
    category: "Web App — On Going",
    badge: "Sedang Berjalan",
    thumb: workScore,
    short: "Papan skor digital untuk pertandingan — project yang sedang dikerjakan.",
    description:
      "Project yang sedang berjalan: papan skor digital untuk dipakai saat pertandingan. Target fitur: tambah/kurang skor sekali sentuh, timer, nama tim, dan tampilan layar penuh yang terbaca dari jauh.",
    tech: ["React", "Vite", "LocalStorage"],
    demoUrl: null,
    sourceUrl: null,
    year: "2025",
  },
  {
    id: "motion-life-rp",
    no: "03",
    title: "Motion Life RP",
    category: "GTA Roleplay — Player",
    badge: null,
    thumb: workGta,
    short: "Petualangan sebagai warga di server GTA roleplay Motion Life.",
    description:
      "Aktif bermain sebagai player di server GTA roleplay Motion Life: membangun karakter dan cerita sendiri, kerja dan usaha di dalam kota, serta ikut komunitas dan fraksi yang bikin dunia RP terasa hidup.",
    tech: ["FiveM", "GTA V", "Roleplay"],
    demoUrl: null,
    sourceUrl: null,
    year: "2025",
  },
  {
    id: "anzy-portfolio",
    no: "04",
    title: "ANZY Portfolio",
    category: "Portfolio — React 3D",
    badge: null,
    thumb: workPortfolio,
    short: "Website portfolio ini sendiri — sinematik gelap dengan patung 3D.",
    description:
      "Website portfolio ini sendiri: dibangun dengan React + Vite + Three.js. Hero-nya menampilkan patung Lilith 3D dengan halo emas, orbit merah, partikel bara dan kabut, plus efek darah menetes di tiap section. Sumber gambar thumbnail-nya digambar manual sebagai SVG agar ringan.",
    tech: ["React", "Vite", "Three.js"],
    demoUrl: null,
    sourceUrl: null,
    year: "2026",
  },
];
