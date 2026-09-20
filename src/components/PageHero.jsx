import "./PageHero.css";

export default function PageHero({ eyebrow, title, subtitle, image }) {
  const text = (
    <div className="container">
      {eyebrow && <span className="eyebrow eyebrow--light">{eyebrow}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );

  if (image) {
    return (
      <section className="page-hero page-hero--banner">
        <div className="page-hero__banner">
          <img src={image} alt="Alpha Edge IT Solutions" loading="eager" />
          <div className="page-hero__banner-scrim" />
          {text}
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero bg-dot-pattern">
      <div className="page-hero__glow" />
      {text}
    </section>
  );
}
