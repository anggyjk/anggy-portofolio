import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Statistics from "./components/Statistics";
import Projects from "./components/Projects";
import ProjectModal from "./components/ProjectModal";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";
import NameTicker from "./components/NameTicker";
import BackToTop from "./components/BackToTop";
import SwordCursor from "./components/SwordCursor";
import SectionDivider from "./components/SectionDivider";

export default function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grain">
      <a className="skip-link" href="#main">Lewati ke konten</a>
      <ScrollProgress />
      <CursorGlow />
      <SwordCursor />
      <Navbar />
      <main id="main">
        <Hero />
        <SectionDivider />
        <About />
        <Statistics />
        <NameTicker text="ANZY KURNIAWAN" />
        <Projects onSelect={setSelected} />
        <Skills />
        <NameTicker text="LET'S WORK TOGETHER" reverse />
        <Contact />
        <SectionDivider />
      </main>
      <Footer />
      <BackToTop />
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
