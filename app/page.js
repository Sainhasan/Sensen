import ContactForm from "@/components/ContactForm";

const services = [
  {
    icon: "01",
    title: "Belajar Web",
    description:
      "Bimbingan dasar HTML, CSS, JavaScript, React, dan Next.js dengan alur yang ramah untuk pemula.",
  },
  {
    icon: "02",
    title: "Pembuatan Website",
    description:
      "Landing page, portfolio, profil usaha, sampai website sederhana yang siap dipakai dan mudah dikembangkan.",
  },
  {
    icon: "03",
    title: "Konsultasi Project",
    description:
      "Diskusi kebutuhan, estimasi fitur, struktur halaman, dan langkah teknis sebelum project mulai dibangun.",
  },
];

const projects = [
  {
    label: "Portfolio",
    title: "Website Personal",
    description: "Profil online yang menampilkan cerita, layanan, project, dan jalur kontak yang jelas.",
  },
  {
    label: "Service",
    title: "Landing Page Jasa",
    description: "Halaman promosi layanan dengan CTA, ringkasan benefit, dan form inquiry.",
  },
  {
    label: "Learning",
    title: "Materi Belajar Web",
    description: "Susunan materi latihan untuk memahami frontend dari dasar sampai deploy.",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="navbar navbar-expand-lg sticky-top topbar">
        <div className="container py-2">
          <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#home">
            <span className="brand-mark">P</span>
            Portfolio
          </a>
          <div className="d-flex gap-3 small fw-semibold">
            <a className="text-decoration-none" href="#services">
              Layanan
            </a>
            <a className="text-decoration-none" href="#projects">
              Project
            </a>
            <a className="text-decoration-none" href="#contact">
              Kontak
            </a>
          </div>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="container py-5">
          <div className="row align-items-center g-5 py-lg-5">
            <div className="col-lg-7">
              <p className="section-kicker mb-3">Web developer portfolio</p>
              <h1 className="hero-title mb-4">Halo, aku bantu bikin web yang jelas dan enak dipakai.</h1>
              <p className="hero-copy mb-4">
                Ini tempat untuk kenalan, lihat layanan, dan ngobrol soal kebutuhan web. Bisa untuk belajar,
                minta estimasi fee, atau diskusi project yang ingin kamu bangun.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a className="btn btn-primary px-4 py-2" href="#contact">
                  Hubungi Aku
                </a>
                <a className="btn btn-outline-dark px-4 py-2" href="#projects">
                  Lihat Project
                </a>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="profile-visual" aria-label="Ilustrasi profil portfolio">
                <span className="profile-initial">P</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" id="services">
        <div className="row mb-4">
          <div className="col-lg-7">
            <p className="section-kicker mb-2">Layanan</p>
            <h2 className="section-title">Bisa bantu dari belajar sampai website siap online.</h2>
          </div>
        </div>
        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-4" key={service.title}>
              <article className="service-card">
                <span className="service-icon">{service.icon}</span>
                <h3 className="h5 fw-bold">{service.title}</h3>
                <p className="muted mb-0">{service.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5" id="projects">
        <div className="row mb-4">
          <div className="col-lg-7">
            <p className="section-kicker mb-2">Project</p>
            <h2 className="section-title">Contoh arah pekerjaan yang bisa dikembangkan.</h2>
          </div>
        </div>
        <div className="row g-4">
          {projects.map((project) => (
            <div className="col-md-4" key={project.title}>
              <article className="project-card">
                <div className="project-thumb">{project.label}</div>
                <h3 className="h5 fw-bold">{project.title}</h3>
                <p className="muted mb-0">{project.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5" id="contact">
        <div className="row g-4 align-items-start">
          <div className="col-lg-5">
            <p className="section-kicker mb-2">Kontak</p>
            <h2 className="section-title">Ceritain kebutuhanmu, nanti aku balas lewat email.</h2>
            <p className="muted mt-3">
              Form ini akan menyimpan inquiry ke database dan mengirim notifikasi email. Cocok untuk request
              belajar, estimasi jasa web, atau diskusi kerja sama.
            </p>
          </div>
          <div className="col-lg-7">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2 small muted">
          <span>© {new Date().getFullYear()} Portfolio Pribadi</span>
          <span>Built with Next.js, Bootstrap, Supabase, and Resend.</span>
        </div>
      </footer>
    </main>
  );
}
