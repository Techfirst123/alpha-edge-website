import { useEffect, useRef, useState } from "react";
import "./StatBar.css";

const DURATION_MS = 1800;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function useCountUp(target, start) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || !Number.isFinite(target)) return;

    let frame;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / DURATION_MS, 1);
      setValue(Math.round(target * easeOutQuart(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  return value;
}

function StatItem({ rawValue, label, start, delay }) {
  // Only count up plain "123" / "123+" style values — things like "24/7"
  // are an idiom, not a quantity, so they're left as static text.
  const match = /^(\d+)(\+?)$/.exec(String(rawValue ?? ""));
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!start) return;
    const t = setTimeout(() => setArmed(true), delay);
    return () => clearTimeout(t);
  }, [start, delay]);

  const counted = useCountUp(target, armed);
  const display = target === null ? rawValue : `${counted}${suffix}`;

  return (
    <div className="stat-bar__item">
      <span className="stat-bar__value">{display}</span>
      <span className="stat-bar__label">{label}</span>
    </div>
  );
}

export default function StatBar({ home }) {
  const stats = [
    { value: `${home.stats_projects}+`, label: "Projects Delivered" },
    { value: `${home.stats_clients}+`, label: "Happy Clients" },
    { value: `${home.stats_years}+`, label: "Years of Experience" },
    { value: home.stats_support, label: "Support Availability" },
  ];

  const ref = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stat-bar" ref={ref}>
      <div className="container stat-bar__grid">
        {stats.map((s, i) => (
          <StatItem key={s.label} rawValue={s.value} label={s.label} start={start} delay={i * 120} />
        ))}
      </div>
    </div>
  );
}
