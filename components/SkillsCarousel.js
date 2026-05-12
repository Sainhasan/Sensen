"use client";

import { useEffect, useRef, useState } from "react";

export default function SkillsCarousel({ skills }) {
  const scrollerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function updateActiveSkill() {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const scrollerBox = scroller.getBoundingClientRect();
    const scrollerCenter = scrollerBox.left + scrollerBox.width / 2;
    const items = Array.from(scroller.querySelectorAll(".skill-pill"));

    const closestIndex = items.reduce((closest, item, index) => {
      const itemBox = item.getBoundingClientRect();
      const itemCenter = itemBox.left + itemBox.width / 2;
      const distance = Math.abs(scrollerCenter - itemCenter);

      if (distance < closest.distance) {
        return { distance, index };
      }

      return closest;
    }, { distance: Number.POSITIVE_INFINITY, index: 0 }).index;

    setActiveIndex(closestIndex);
  }

  function scrollSkills(direction) {
    const scroller = scrollerRef.current;
    const firstItem = scroller?.querySelector(".skill-pill");

    if (!scroller || !firstItem) {
      return;
    }

    const gap = parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
    scroller.scrollBy({
      left: direction * (firstItem.offsetWidth + gap),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    updateActiveSkill();
    window.addEventListener("resize", updateActiveSkill);

    return () => window.removeEventListener("resize", updateActiveSkill);
  }, []);

  return (
    <div className="skills-carousel">
      <button
        aria-label="Geser skill ke kiri"
        className="skill-nav skill-nav-prev"
        onClick={() => scrollSkills(-1)}
        type="button"
      />
      <div className="skills-scroller" onScroll={updateActiveSkill} ref={scrollerRef}>
        {skills.map((skill, index) => (
          <button
            className={`skill-pill${index === activeIndex ? " is-active" : ""}`}
            key={skill}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            {skill}
          </button>
        ))}
      </div>
      <button
        aria-label="Geser skill ke kanan"
        className="skill-nav skill-nav-next"
        onClick={() => scrollSkills(1)}
        type="button"
      />
    </div>
  );
}
