(() => {
  "use strict";

  // Scientific values and definitions verified against the canonical paper:
  // definitions p. 3, study frame pp. 1 and 4, comparison Table 2 p. 9.
  const STUDY = Object.freeze({
    vaccinated: Object.freeze({
      label: "Vaccinated",
      definition: "at least one dose",
      percentage: "17.1%",
      proportion: 0.171
    }),
    unvaccinated: Object.freeze({
      label: "Unvaccinated",
      definition: "no measles vaccine doses",
      percentage: "40.6%",
      proportion: 0.406
    }),
    normalization: "Each vaccination subgroup is shown as 100% for percentage comparison.",
    figureNote: "Human figures are used to visualize proportions. Exact study values are shown numerically."
  });

  const COMPARISONS = Object.freeze({
    vaccine: { labels: ["Vaccinated", "Unvaccinated"], definitions: ["At least 1 dose", "No measles vaccine doses"], badges: ["≥1", "0"], percentages: ["17.1%", "40.6%"] },
    coverage: { labels: ["No chronic disease", "Chronic disease"], definitions: ["All ages", "All ages"], badges: ["−", "+"], percentages: ["10.8%", "5.6%"], metric: "coverage" },
    older: { labels: ["No chronic disease", "Chronic disease"], definitions: ["Over 18 months", "Over 18 months"], badges: ["−", "+"], percentages: ["32.4%", "9.4%"], metric: "coverage" },
    chronic: { labels: ["No chronic disease", "Chronic disease"], definitions: ["None recorded", "Recorded in medical records"], badges: ["−", "+"], percentages: ["34.1%", "64.4%"] }
  });

  const STORY_STATES = Object.freeze({
    NEUTRAL: Object.freeze({
      layout: "neutral",
      groups: [1, 1],
      source: [0, 0],
      values: [0, 0],
      fields: 0,
      normalization: 0,
      legend: 0,
      summary: "One shared study population of 2,064 children hospitalized with confirmed measles."
    }),
    VACCINE_QUESTION: Object.freeze({
      layout: "question",
      groups: [0.68, 0.68],
      source: [0, 0],
      values: [0, 0],
      fields: 0,
      normalization: 0,
      legend: 0,
      summary: "Does vaccination status appear associated with where infection was acquired?"
    }),
    VACCINE_NORMALIZATION: Object.freeze({
      layout: "groups",
      groups: [1, 1],
      source: [0, 0],
      values: [0, 0],
      fields: 1,
      normalization: 1,
      legend: 0,
      summary: STUDY.normalization + " Equal visual size does not represent observed subgroup size."
    }),
    VACCINATED_FOCUS: Object.freeze({
      layout: "groups",
      groups: [1, 0.2],
      source: [STUDY.vaccinated.proportion, 0],
      values: [1, 0],
      fields: 1,
      normalization: 1,
      legend: 1,
      summary: "Vaccinated means at least one dose. The hospital-related source proportion was 17.1%."
    }),
    UNVACCINATED_FOCUS: Object.freeze({
      layout: "groups",
      groups: [0.2, 1],
      source: [STUDY.vaccinated.proportion, STUDY.unvaccinated.proportion],
      values: [0.28, 1],
      fields: 1,
      normalization: 1,
      legend: 1,
      summary: "Unvaccinated means no measles vaccine doses. The hospital-related source proportion was 40.6%."
    }),
    VACCINE_COMPARE: Object.freeze({
      layout: "groups",
      groups: [1, 1],
      source: [STUDY.vaccinated.proportion, STUDY.unvaccinated.proportion],
      values: [1, 1],
      fields: 1,
      normalization: 1,
      legend: 1,
      summary: "The hospital-related share was higher in the unvaccinated subgroup. This is an association, not a causal or vaccine-effectiveness estimate."
    }),
    CHRONIC_NORMALIZATION: Object.freeze({
      comparison: "chronic", layout: "groups", groups: [1, 1], source: [0, 0], values: [0, 0], fields: 1, normalization: 1, legend: 0,
      summary: "A new aggregate comparison: each chronic-disease subgroup is shown as 100%. Equal visual size does not represent observed subgroup size."
    }),
    NO_CHRONIC_FOCUS: Object.freeze({
      comparison: "chronic", layout: "groups", groups: [1, 0.2], source: [0.341, 0], values: [1, 0], fields: 1, normalization: 1, legend: 1,
      summary: "Among children without chronic disease, 34.1% had a hospital-related source. Table 2."
    }),
    CHRONIC_FOCUS: Object.freeze({
      comparison: "chronic", layout: "groups", groups: [0.2, 1], source: [0.341, 0.644], values: [0.28, 1], fields: 1, normalization: 1, legend: 1,
      summary: "Among children with chronic disease, 64.4% had a hospital-related source. Table 2."
    }),
    CHRONIC_COMPARE: Object.freeze({
      comparison: "chronic", layout: "groups", groups: [1, 1], source: [0.341, 0.644], values: [1, 1], fields: 1, normalization: 1, legend: 1,
      summary: "Hospital-related source: 34.1% without chronic disease versus 64.4% with chronic disease, among hospitalized measles cases."
    }),
    COVERAGE_NORMALIZATION: Object.freeze({comparison: "coverage", layout: "groups", groups: [1,1], source: [0,0], values: [0,0], fields: 1, normalization: 1, legend: 0, summary: "Vaccination with at least one dose among hospitalized measles cases: 10.8% without chronic disease and 5.6% with chronic disease."}),
    COVERAGE_NO_CHRONIC: Object.freeze({comparison: "coverage", layout: "groups", groups: [1,0.2], source: [0.108,0], values: [1,0], fields: 1, normalization: 1, legend: 1, summary: "Vaccination with at least one dose among hospitalized measles cases: 10.8% without chronic disease and 5.6% with chronic disease."}),
    COVERAGE_CHRONIC: Object.freeze({comparison: "coverage", layout: "groups", groups: [0.2,1], source: [0.108,0.056], values: [0.28,1], fields: 1, normalization: 1, legend: 1, summary: "Vaccination with at least one dose among hospitalized measles cases: 10.8% without chronic disease and 5.6% with chronic disease."}),
    COVERAGE_COMPARE: Object.freeze({comparison: "coverage", layout: "groups", groups: [1,1], source: [0.108,0.056], values: [1,1], fields: 1, normalization: 1, legend: 1, summary: "Vaccination with at least one dose among hospitalized measles cases: 10.8% without chronic disease and 5.6% with chronic disease."}),
    COVERAGE_OLDER: Object.freeze({comparison: "older", layout: "groups", groups: [1,1], source: [0.324,0.094], values: [1,1], fields: 1, normalization: 1, legend: 1, summary: "Over 18 months: 32.4% without chronic disease and 9.4% with chronic disease had at least one dose, as reported in the abstract. Main text reports 32.3% for the first value."}),
    STUDY_CONTEXT: Object.freeze({
      layout: "neutral", groups: [0.3, 0.3], source: [0, 0], values: [0, 0], fields: 0, normalization: 0, legend: 0,
      summary: "Study context and limitations. The following charts describe admissions to one referral hospital, not community-wide infection risk."
    })
  });

  const STATE_ORDER = Object.keys(STORY_STATES);
  // Representative visual marks only; density is independent of study counts.
  const FIGURE_COUNT = 480;
  const GROUP_SIZE = FIGURE_COUNT / 2;

  const root = document.querySelector("#measles-story");
  const analysis = root.querySelector("#analysis");
  const stageShell = root.querySelector(".stage-shell");
  const stage = root.querySelector("#stage");
  const storyRail = root.querySelector("#story-rail");
  let storySteps = [...root.querySelectorAll("[data-visual-state]")];
  let storyCards = [...root.querySelectorAll("[data-story-card]")];
  const population = root.querySelector("#population");
  const fields = [...root.querySelectorAll(".group-field")];
  const labels = [...root.querySelectorAll(".group-label")];
  const masks = [...root.querySelectorAll(".source-mask")];
  const boundaries = [...root.querySelectorAll(".source-boundary")];
  const markers = [...root.querySelectorAll(".source-marker")];
  const values = [...root.querySelectorAll(".group-value")];
  const normalization = root.querySelector("#normalization");
  const legend = root.querySelector("#legend");
  const announcement = root.querySelector("#state-announcement");

  const people = [];
  const peopleBatches = [];
  let targetCache = new Map();
  let markerWidths = [];
  const POPULATION_MOTION = Object.freeze({ duration: 1.2, stagger: 0.2, batchSize: 20 });
  const cardAnimations = [];
  const stateTriggers = [];
  let editorialChartContext = null;
  const revealedCharts = new WeakSet();
  let layout = null;
  let activeIndex = 0;
  let masterTimeline = null;
  let pinTrigger = null;
  let resizeTimer = null;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let initialized = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createPeople() {
    for (let index = 0; index < FIGURE_COUNT; index += 1) {
      const person = document.createElement("div");
      const artwork = document.createElement("div");
      const image = document.createElement("img");
      person.className = "person";
      artwork.className = "person-art";
      person.dataset.index = String(index);
      person.dataset.group = index < GROUP_SIZE ? "vaccinated" : "unvaccinated";
      image.src = "assets/people/child-muted.svg";
      image.alt = "";
      image.decoding = "async";
      artwork.append(image);
      person.append(artwork);
      population.append(person);
      people.push(person);
    }
    for (let start = 0; start < people.length; start += POPULATION_MOTION.batchSize) {
      peopleBatches.push({ start, elements: people.slice(start, start + POPULATION_MOTION.batchSize) });
    }
  }

  function gridPoints(rect, count, columns, personWidth, personHeight) {
    const rows = Math.ceil(count / columns);
    const paddingX = Math.max(4, rect.width * 0.015);
    const paddingY = Math.max(5, rect.height * 0.055);
    const usableWidth = rect.width - paddingX * 2;
    const usableHeight = rect.height - paddingY * 2;
    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;
    const points = [];

    for (let index = 0; index < count; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const offset = row % 2 ? cellWidth * 0.08 : -cellWidth * 0.04;
      points.push({
        x: rect.x + paddingX + column * cellWidth + (cellWidth - personWidth) / 2 + offset,
        y: rect.y + paddingY + row * cellHeight + (cellHeight - personHeight) / 2
      });
    }

    return points;
  }

  function calculateLayout() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const mobile = width <= 760;
    const personWidth = mobile
      ? clamp(width / 58, 5, 9)
      : clamp(width / 110, 7, 16);
    const personHeight = personWidth * 1.5;

    const neutralRect = mobile
      ? { x: width * 0.03, y: height * 0.24, width: width * 0.94, height: height * 0.54 }
      : { x: width * 0.025, y: height * 0.22, width: width * 0.95, height: height * 0.55 };
    const questionRect = mobile
      ? { x: width * 0.03, y: height * 0.35, width: width * 0.94, height: height * 0.48 }
      : { x: width * 0.025, y: height * 0.22, width: width * 0.95, height: height * 0.55 };
    const groupRects = mobile
      ? [
          { x: width * 0.03, y: height * 0.31, width: width * 0.94, height: height * 0.205 },
          { x: width * 0.03, y: height * 0.62, width: width * 0.94, height: height * 0.205 }
        ]
      : [
          { x: width * 0.025, y: height * 0.34, width: width * 0.455, height: height * 0.4 },
          { x: width * 0.52, y: height * 0.34, width: width * 0.455, height: height * 0.4 }
        ];
    const labelTops = mobile
      ? [height * 0.245, height * 0.555]
      : [height * 0.245, height * 0.245];

    const neutral = gridPoints(neutralRect, FIGURE_COUNT, mobile ? 24 : 40, personWidth, personHeight);
    const question = gridPoints(questionRect, FIGURE_COUNT, mobile ? 24 : 40, personWidth, personHeight);
    const groupColumns = mobile ? 24 : 20;
    const vaccinated = gridPoints(groupRects[0], GROUP_SIZE, groupColumns, personWidth, personHeight);
    const unvaccinated = gridPoints(groupRects[1], GROUP_SIZE, groupColumns, personWidth, personHeight);

    return {
      width,
      height,
      mobile,
      personWidth,
      personHeight,
      points: {
        neutral,
        question,
        groups: vaccinated.concat(unvaccinated)
      },
      groupRects,
      labelTops
    };
  }

  function setStaticLayout() {
    layout = calculateLayout();
    markerWidths = markers.map(marker => marker.offsetWidth);
    targetCache = new Map();
    people.forEach((person) => {
      person.style.width = `${layout.personWidth}px`;
      person.style.height = `${layout.personHeight}px`;
    });

    fields.forEach((field, index) => {
      const rect = layout.groupRects[index];
      gsap.set(field, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    });

    labels.forEach((label, index) => {
      const rect = layout.groupRects[index];
      label.style.setProperty("--field-height", `${rect.height}px`);
      gsap.set(label, { x: rect.x, y: layout.labelTops[index], width: rect.width });
    });
  }

  function stateTargets(state) {
    if (targetCache.has(state)) return targetCache.get(state);
    const positions = layout.points[state.layout];
    const targets = people.map((person, index) => ({
      x: positions[index].x,
      y: positions[index].y,
      opacity: state.groups[index < GROUP_SIZE ? 0 : 1]
    }));
    targetCache.set(state, targets);
    return targets;
  }

  function setStateMetadata(index, progress = 0, announce = true) {
    const stateKey = STATE_ORDER[index];
    const state = STORY_STATES[stateKey];
    const changed = activeIndex !== index;
    activeIndex = index;
    stage.dataset.state = stateKey;
    const comparison = COMPARISONS[state.comparison || "vaccine"];
    const coverage = comparison.metric === "coverage";
    stage.dataset.metric = coverage ? "coverage" : "source";
    legend.querySelector(".legend-title").textContent = coverage ? "Vaccinated: at least one dose" : "Hospital-related source";
    legend.querySelector(".legend-explanation").textContent = coverage ? "Unpatterned: no doses" : "Unpatterned: community source";
    normalization.textContent = state.comparison === "older" ? "Each group = 100% · Over 18 months" : "Each group = 100%";
    labels.forEach((label, groupIndex) => {
      label.querySelector("h3").textContent = comparison.labels[groupIndex];
      label.querySelector(".group-definition").textContent = comparison.definitions[groupIndex];
      label.querySelector(".group-badge").textContent = comparison.badges[groupIndex];
      const percentage = label.querySelector(".percentage");
      percentage.textContent = comparison.percentages[groupIndex];
      percentage.setAttribute("aria-label", `${comparison.percentages[groupIndex]} ${coverage ? "vaccinated with at least one dose" : "hospital-related source"}`);
    });
    masks.forEach((mask, groupIndex) => {
      mask.dataset.proportion = String(state.source[groupIndex]);
    });
    if (announce && changed) announcement.textContent = state.summary;
  }

  function setVisualState(index) {
    const stateKey = STATE_ORDER[index];
    const state = STORY_STATES[stateKey];
    const targets = stateTargets(state);

    people.forEach((person, personIndex) => {
      const target = targets[personIndex];
      gsap.set(person, { x: target.x, y: target.y, opacity: target.opacity, scale: 1 });
    });
    fields.forEach((field, groupIndex) => {
      gsap.set(field, { autoAlpha: state.fields ? state.groups[groupIndex] : 0 });
    });
    masks.forEach((mask, groupIndex) => {
      const proportion = state.source[groupIndex];
      mask.dataset.proportion = String(proportion);
      gsap.set(mask, { scaleX: proportion, opacity: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0 });
    });
    boundaries.forEach((boundary, groupIndex) => {
      const proportion = state.source[groupIndex];
      gsap.set(boundary, {
        x: layout.groupRects[groupIndex].width * proportion,
        autoAlpha: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0
      });
    });
    markers.forEach((marker, groupIndex) => {
      const proportion = state.source[groupIndex];
      gsap.set(marker, {
        x: layout.groupRects[groupIndex].width * proportion - markerWidths[groupIndex] * 0.5,
        autoAlpha: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0
      });
    });
    labels.forEach((label, groupIndex) => {
      gsap.set(label, { autoAlpha: state.fields ? Math.max(0.32, state.groups[groupIndex]) : 0 });
    });
    values.forEach((value, groupIndex) => {
      gsap.set(value, { autoAlpha: state.values[groupIndex], y: state.values[groupIndex] ? 0 : 8 });
    });
    gsap.set(normalization, { autoAlpha: state.normalization, y: state.normalization ? 0 : -8 });
    gsap.set(legend, { autoAlpha: state.legend, y: state.legend ? 0 : 8 });
    setStateMetadata(index, pinTrigger?.progress || 0, false);
    stage.dataset.settled = "true";
  }

  function addVisualTween(timeline, stateKey, position, duration) {
    const state = STORY_STATES[stateKey];
    const targets = stateTargets(state);
    // One tween per small batch rather than a stagger-created tween per child.
    peopleBatches.forEach((batch, index) => {
      timeline.to(batch.elements, {
        x: i => targets[batch.start + i].x,
        y: i => targets[batch.start + i].y,
        opacity: i => targets[batch.start + i].opacity,
        duration,
        ease: 'power1.inOut'
      }, position + index / (peopleBatches.length - 1) * POPULATION_MOTION.stagger);
    });

    fields.forEach((field, groupIndex) => {
      timeline.to(field, {
        autoAlpha: state.fields ? state.groups[groupIndex] : 0,
        duration: duration * 0.78
      }, position + duration * 0.08);
    });

    labels.forEach((label, groupIndex) => {
      timeline.to(label, {
        autoAlpha: state.fields ? Math.max(0.32, state.groups[groupIndex]) : 0,
        duration: duration * 0.66
      }, position + duration * 0.12);
    });

    masks.forEach((mask, groupIndex) => {
      const proportion = state.source[groupIndex];
      timeline.to(mask, {
        scaleX: proportion,
        opacity: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0,
        duration: duration * 0.9
      }, position + duration * 0.05);
    });

    boundaries.forEach((boundary, groupIndex) => {
      const proportion = state.source[groupIndex];
      timeline.to(boundary, {
        x: layout.groupRects[groupIndex].width * proportion,
        autoAlpha: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0,
        duration: duration * 0.9
      }, position + duration * 0.05);
    });

    markers.forEach((marker, groupIndex) => {
      const proportion = state.source[groupIndex];
      timeline.to(marker, {
        x: layout.groupRects[groupIndex].width * proportion - markerWidths[groupIndex] * 0.5,
        autoAlpha: proportion ? Math.max(0.48, state.groups[groupIndex]) : 0,
        duration: duration * 0.82
      }, position + duration * 0.12);
    });

    values.forEach((value, groupIndex) => {
      timeline.to(value, {
        autoAlpha: state.values[groupIndex],
        y: state.values[groupIndex] ? 0 : 8,
        duration: duration * 0.58
      }, position + duration * 0.3);
    });

    timeline.to(normalization, {
      autoAlpha: state.normalization,
      y: state.normalization ? 0 : -8,
      duration: duration * 0.55
    }, position);
    timeline.to(legend, {
      autoAlpha: state.legend,
      y: state.legend ? 0 : 8,
      duration: duration * 0.55
    }, position + duration * 0.28);
  }

  // Background transitions run on wall-clock time, never on a scroll playhead.
  function animateVisualState(index) {
    if (index === activeIndex) return;
    masterTimeline?.pause().clear();
    setStateMetadata(index, pinTrigger?.progress || 0);
    stage.dataset.settled = "false";
    if (reducedMotion) {
      setVisualState(index);
      return;
    }
    if (!masterTimeline) {
      masterTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power1.inOut", overwrite: "auto" },
        onComplete: () => { stage.dataset.settled = "true"; }
      });
    }
    addVisualTween(masterTimeline, STATE_ORDER[index], 0, POPULATION_MOTION.duration);
    masterTimeline.play(0);
  }

  function createCardAnimations() {
    cardAnimations.splice(0).forEach((animation) => {
      animation.scrollTrigger?.kill();
      animation.kill();
    });
    storyCards.forEach((card) => {
      if (card.closest('.quiz-step')) {
        gsap.set(card, { clearProps: 'transform,opacity,visibility' });
        return;
      }
      // The rail supplies natural upward travel; the scrub adds continuous drift.
      const animation = gsap.timeline({
        scrollTrigger: {
          trigger: card.closest(".story-step"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });
      // Full-bleed bands stay opaque. Their vertical edge extensions blend into
      // the scene; fading the whole panel would expose the chart through its text.
      if (card.classList.contains("story-band")) {
        animation.fromTo(card,
          { y: reducedMotion ? 0 : 30, autoAlpha: 1 },
          { y: reducedMotion ? 0 : -30, autoAlpha: 1, duration: 1, ease: "none" });
        cardAnimations.push(animation);
        return;
      }
      animation.fromTo(card,
        { autoAlpha: 0, y: reducedMotion ? 0 : 30 },
        { autoAlpha: 1, y: reducedMotion ? 0 : 12, duration: 0.25, ease: "none" })
        .to(card, { y: reducedMotion ? 0 : -12, duration: 0.45, ease: "none" })
        .to(card, { autoAlpha: 0, y: reducedMotion ? 0 : -30, duration: 0.3, ease: "none" });
      cardAnimations.push(animation);
    });
  }

  function setupScroll() {
    storySteps = [...root.querySelectorAll("[data-visual-state]")].filter((step) => !step.closest("[hidden]"));
    storyCards = storySteps.flatMap((step) => [...step.querySelectorAll("[data-story-card]")]);
    pinTrigger?.kill(true);
    stateTriggers.splice(0).forEach((trigger) => trigger.kill());
    pinTrigger = ScrollTrigger.create({
      id: "measles-analysis",
      trigger: analysis,
      pin: stageShell,
      pinSpacing: false,
      start: () => document.documentElement.classList.contains('has-story-progress') ? 'top top+=34' : 'top top',
      end: "bottom bottom",
      anticipatePin: 1
    });
    createCardAnimations();
    setupEditorialCharts();
    setupCrowdReveal();
    storySteps.slice(0, -1).forEach((step, index) => {
      const current = STATE_ORDER.indexOf(step.dataset.visualState);
      const next = STATE_ORDER.indexOf(storySteps[index + 1].dataset.visualState);
      if (current === next) return;
      stateTriggers.push(ScrollTrigger.create({
        id: `background-exit-${index}`,
        nextState: next,
        trigger: step,
        // Use the actual panel placement, including responsive editorial offsets.
        start: () => {
          const card = step.querySelector("[data-story-card]");
          return step.getBoundingClientRect().top + window.scrollY
            + card.offsetTop + card.offsetHeight;
        },
        end: "+=1",
        onEnter: () => animateVisualState(next),
        onLeaveBack: () => animateVisualState(current)
      }));
    });
  }
  let crowdReveal = null;
  function setupEditorialCharts() {
    editorialChartContext?.revert();
    editorialChartContext = gsap.context(() => {
      storyCards.forEach((card) => card.querySelectorAll('.editorial-chart').forEach((chart) => {
        if (reducedMotion || revealedCharts.has(chart)) return;
        // Exact values remain DOM text; only their presentation is animated.
        const timeline = gsap.timeline({
          defaults: { ease: 'power2.out', duration: 0.45 },
          onComplete: () => revealedCharts.add(chart),
          scrollTrigger: {
            trigger: chart, start: 'top 82%',
            toggleActions: 'play none none none', once: true
          }
        });
        timeline.addLabel('frame', 0)
          .fromTo(chart.querySelectorAll('figcaption, .chart-axis, .simple-axis'),
            { opacity: 0 }, { opacity: 1, stagger: 0.06 }, 'frame');
        const rows = [...chart.querySelectorAll('.chart-row')];
        if (rows.length) {
          rows.forEach((row, index) => {
            const label = `row-${index}`;
            timeline.addLabel(label, 0.25 + index * 0.48)
              .fromTo(row.querySelector('span'), { opacity: 0, y: 4 }, { opacity: 1, y: 0 }, label)
              .fromTo(row.querySelector('i'), { scaleX: 0, transformOrigin: 'left center' },
                { scaleX: 1, duration: 0.75 }, `${label}+=0.12`)
              .fromTo(row.querySelector('strong'), { opacity: 0, y: 5 },
                { opacity: 1, y: 0 }, `${label}+=0.55`);
          });
        } else {
          timeline.addLabel('proportion', 0.25)
            .fromTo(chart.querySelector('.diagnosis-track i'),
              { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.9 }, 'proportion')
            .fromTo(chart.querySelector('.chart-number'),
              { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55 }, 'proportion+=0.65');
        }
      }));
    }, analysis);
  }

  function setupCrowdReveal() {
    crowdReveal?.scrollTrigger?.kill();
    crowdReveal?.kill();
    const firstCard = storySteps[0].querySelector('[data-story-card]');
    // Reveal is scoped to analysis and reverses when returning to the introduction.
    crowdReveal = gsap.timeline({ scrollTrigger: {
      id: 'crowd-reveal', trigger: firstCard, start: 'bottom 90%', end: 'bottom top', scrub: reducedMotion ? true : 0.45
    }});
    gsap.set(population, { autoAlpha: 0 });
    crowdReveal.fromTo(population, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'none' });
    peopleBatches.forEach((batch, batchIndex) => {
      crowdReveal.fromTo(batch.elements.map(person => person.firstElementChild), {
        x: i => reducedMotion ? 0 : ((i + batch.start) % 2 ? 1 : -1) * layout.width * (0.12 + ((i + batch.start) % 7) / 30),
        y: i => reducedMotion ? 0 : ((i + batch.start) % 3 ? 1 : -1) * layout.height * (0.1 + ((i + batch.start) % 11) / 35),
        opacity: 0
      }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power1.inOut' }, batchIndex / (peopleBatches.length - 1) * 0.2);
    });
  }

  function setupIntroAnimations() {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-character', {
        x: () => window.innerWidth - root.querySelector('.hero-character').getBoundingClientRect().left + 24,
        opacity: 0, duration: 1.15, ease: 'power3.out'
      });
      gsap.from('.age-lineup img', {
        y: 28, opacity: 0, stagger: 0.1, duration: 0.65,
        scrollTrigger: { trigger: '.age-scene', start: 'top 85%', toggleActions: 'play none none reverse' }
      });
      gsap.from('.records-visual > *', {
        x: -24, opacity: 0, stagger: 0.15, duration: 0.7,
        scrollTrigger: { trigger: '.records-visual', start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });
  }
  function firstRailStepForState(index) {
    const stateKey = STATE_ORDER[clamp(index, 0, STATE_ORDER.length - 1)];
    const stepIndex = storySteps.findIndex((step) => step.dataset.visualState === stateKey);
    return stepIndex < 0 ? 0 : stepIndex;
  }

  function goToState(index) {
    const targetIndex = clamp(index, 0, STATE_ORDER.length - 1);
    if (!pinTrigger) {
      setVisualState(targetIndex);
      return;
    }
    const stepIndex = firstRailStepForState(targetIndex);
    const step = storySteps[stepIndex];
    const scrollTarget = step.getBoundingClientRect().top + window.scrollY
      + step.offsetHeight / 2 - window.innerHeight / 2;
    window.scrollTo({
      top: scrollTarget,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  function transitionTo(index) {
    goToState(typeof index === "string" ? STATE_ORDER.indexOf(index) : index);
  }

  const QUIZ_EXPLANATIONS = Object.freeze({
    1: "The hospital-related share was 40.6% in the unvaccinated group and 17.1% in the vaccinated group. These are associations among hospitalized measles cases, not absolute infection risks or vaccine-effectiveness estimates.",
    2: "Hospital-related source accounted for 64.4% of cases with chronic disease and 34.1% without. Frequent hospital care may create exposure opportunities, but this comparison does not establish causation.",
    3: "These are proportions with at least one dose among hospitalized cases over 18 months: 9.4% with chronic disease and 32.4% without in the abstract (32.3% in the main text). They describe neither complete two-dose vaccination nor national coverage."
  });

  function setupQuiz() {
    const chapters = [...root.querySelectorAll('[data-chapter]')];
    const tail = [...analysis.parentElement.children].filter(element =>
      element !== analysis && (analysis.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING));
    const updateGate = () => {
      const pending = [...root.querySelectorAll('[data-quiz]')].some(quiz => quiz.dataset.completed !== 'true');
      tail.forEach(element => { element.hidden = pending; });
    };
    root.querySelectorAll("[data-quiz]").forEach((quiz) => {
      const options = [...quiz.querySelectorAll(".quiz-option")];
      // Shuffle once per page load; move the buttons so correctness and keyboard
      // reading order stay attached to the same choices.
      for (let index = options.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
      }
      // Avoid an apparently unchanged answer position on consecutive reloads.
      const orderKey = `measles-quiz-position-v2:${quiz.dataset.quiz}`;
      let previousPosition = 0;
      try {
        const saved = sessionStorage.getItem(orderKey);
        if (saved !== null) previousPosition = Number(saved);
      } catch { /* Shuffling still works when browser storage is unavailable. */ }
      if (options.findIndex(option => option.dataset.correct === 'true') === previousPosition) {
        const offset = 1 + Math.floor(Math.random() * (options.length - 1));
        options.push(...options.splice(0, offset));
      }
      try {
        sessionStorage.setItem(orderKey, String(options.findIndex(option => option.dataset.correct === 'true')));
      } catch { /* Storage is optional. */ }
      quiz.querySelector('.quiz-options').append(...options);
      const explanation = quiz.querySelector(".quiz-explanation");
      const next = quiz.querySelector(".quiz-continue");
      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      next.before(feedback);
      feedback.append(explanation, next);
      let answerTimeline = null;
      const finishAnswer = () => {
        gsap.set(feedback, { clearProps: 'height,overflow' });
        gsap.set([explanation, next], { clearProps: 'opacity,transform' });
        next.disabled = false;
        quiz.dataset.completed = 'true';
        const chapter = document.getElementById(quiz.dataset.next);
        const wasHidden = chapter.hidden;
        chapter.hidden = false;
        updateGate();
        if (initialized && wasHidden) refreshLayout();
        else ScrollTrigger.refresh();
      };
      quiz.addEventListener("submit", (event) => event.preventDefault());
      options.forEach((option) => option.addEventListener("click", () => {
        answerTimeline?.kill();
        const firstReveal = explanation.hidden;
        const startHeight = feedback.getBoundingClientRect().height;
        options.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === option)));
        explanation.hidden = false;
        explanation.textContent = (option.dataset.correct === "true" ? "Correct. " : "Not quite. ") + QUIZ_EXPLANATIONS[quiz.dataset.quiz];
        next.hidden = false;
        if (reducedMotion) {
          finishAnswer();
          return;
        }
        next.disabled = true;
        gsap.set(feedback, { height: 'auto', overflow: 'hidden' });
        const targetHeight = feedback.getBoundingClientRect().height;
        gsap.set(feedback, { height: startHeight });
        answerTimeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finishAnswer });
        answerTimeline.to(feedback, { height: targetHeight, duration: 0.55 }, 0)
          .fromTo(explanation, { opacity: 0, y: firstReveal ? 8 : 0 },
            { opacity: 1, y: 0, duration: 0.4 }, 0.13)
          .fromTo(next, { opacity: firstReveal ? 0 : 1, y: firstReveal ? 5 : 0 },
            { opacity: 1, y: 0, duration: 0.3 }, 0.34);
      }));
      next.addEventListener("click", () => {
        const chapter = document.getElementById(quiz.dataset.next);
        if (chapter.hidden) {
          chapter.hidden = false;
          refreshLayout();
        }
        const step = chapter.querySelector(".story-step");
        const target = step.querySelector("[data-story-card]");
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        window.scrollTo({ top: step.getBoundingClientRect().top + window.scrollY + step.offsetHeight / 2 - window.innerHeight / 2, behavior: reducedMotion ? "auto" : "smooth" });
      });
    });
    chapters.slice(1).forEach(chapter => { chapter.hidden = true; });
    updateGate();
    // The text-equivalent link deliberately bypasses the optional interaction.
    root.querySelector('.skip-link').addEventListener('click', () => {
      chapters.forEach(chapter => { chapter.hidden = false; });
      root.querySelectorAll('[data-quiz]').forEach(quiz => { quiz.dataset.completed = 'true'; });
      updateGate();
      if (initialized) refreshLayout();
    });
  }

  function refreshLayout() {
    masterTimeline?.kill();
    masterTimeline = null;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.getAll()
      .filter((trigger) => trigger.vars.trigger?.closest?.("#analysis") || trigger.vars.trigger === analysis)
      .forEach((trigger) => trigger.kill(true));
    pinTrigger = null;
    setStaticLayout();
    setVisualState(activeIndex);

    setupScroll();
    ScrollTrigger.refresh();
    // Resolve restored scroll positions and responsive geometry without replaying
    // the removed scrubbed background timeline.
    const crossed = stateTriggers.filter((trigger) => window.scrollY >= trigger.start).at(-1)?.vars.nextState ?? 0;
    masterTimeline?.kill();
    masterTimeline = null;
    setVisualState(crossed);
  }

  function initialize() {
    createPeople();

    if (!window.gsap || !window.ScrollTrigger) {
      stage.dataset.ready = "fallback";
      storyRail.classList.add("story-rail-fallback");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power2.inOut" });
    setStaticLayout();
    setVisualState(0);
    stage.dataset.railStep = "0";

    setupScroll();
    setupIntroAnimations();

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshLayout, 180);
    });
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", refreshLayout);
    window.addEventListener('story:viewportchange', refreshLayout);
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    initialized = true;
    setupQuiz();
    refreshLayout();
    stage.dataset.ready = "true";
    window.__MEASLES_STORY__ = Object.freeze({
      states: STATE_ORDER.slice(),
      railStates: storySteps.map((step) => step.dataset.visualState),
      goToState,
      transitionTo,
      getState: () => ({
        index: activeIndex,
        key: STATE_ORDER[activeIndex],
        settled: stage.dataset.settled === "true",
        buttonMode: false,
        pin: pinTrigger,
        initialized
      })
    });
  }

  initialize();
})();
