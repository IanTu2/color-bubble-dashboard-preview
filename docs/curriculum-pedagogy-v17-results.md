# Curriculum Pedagogy V17 Results

Date: 2026-08-14

This document records the learner-facing pedagogy remediation that followed the V16 full re-audit. It does **not** claim external textbook approval or Ministry/NAER certification. V17 is the project learner-facing pedagogy layer built on top of the existing V14 structural/runtime layer and the separate V15 certification registry.

## V16 baseline

The V16 re-audit separated technical readiness from actual teaching quality. At that baseline:

- 453/453 active units resolved structurally.
- 453/453 units showed high question-template dependence / weak question specificity.
- 121 units had worked examples that were not sufficiently specific to the unit.
- 16 units were flagged for weak concept specificity under the V16 heuristic.
- 281 math/science/social units lacked direct rich visual support under the V16 audit.
- Learner pacing separated concept teaching from immediate retrieval/checking.

## V17 remediation

### Learner flow

The active reader is now `CurriculumCourseAppV17`.

- Concept lessons interleave teaching and retrieval: each concept page can render an immediate quick check and feedback in the same page.
- Guided practice, independent practice, and assessment remain later stages for transfer and cumulative checking instead of being the first time a learner answers a question.
- Course overview, directory, local progress, media/audio support, rubrics, and learner reports remain available.

### Question bank

The V17 pedagogy transformer rebuilds learner questions from unit title, unit focus, subject-specific reasoning, and concrete contexts.

- Generic V14 prompt families are not used by the V17 learner question bank.
- Generic fallback options and generic feedback detected by the re-audit are removed from the V17 learner bank.
- Each active unit keeps at least 15 unique questions after deduplication.
- Media/audio source questions may be preserved only when they add learner value; their context/feedback/rubric is normalized for V17.

### Worked examples

V17 examples are rebuilt as unit-linked contextual examples with subject-specific reasoning steps:

- Math: quantities, units, representations, reasoning, and verification.
- Science: observation vs inference, variables/evidence/models, and limits.
- Social: source/time/place/scale, facts vs interpretations, comparison, and bounded conclusions.
- English: speaker/purpose/time, meaning/form/register, and natural use.
- Chinese: complete context, textual evidence, structure, and interpretation checks.

### Rich instructional visuals

Math/science/social learner visuals now render domain-aware SVG diagrams instead of relying only on text cards.

Examples include:

- Math: number lines, coordinate plots, geometry, bar models, measurement diagrams, and data charts.
- Science: circuits, particle models, motion vectors, biology systems, earth cycles, astronomy/orbits, and wave/energy diagrams.
- Social: timelines, maps, civic/institution networks, social-data charts, and evidence comparison diagrams.

Text cards remain as explanatory captions/details; they are no longer the only visual representation.

## Final automated V17 pedagogy audit

The final `scripts/audit-curriculum-pedagogy-v17-final.mjs` run reported:

| Metric | Result |
| --- | ---: |
| Active units | 453 |
| V17 resolved units | 453 |
| Structural failures | 0 |
| Legacy template units | 0 |
| Weak concept-link units | 0 |
| Generic concept-title units | 0 |
| Weak question-context units | 0 |
| Weak example-specificity units | 0 |
| Units with insufficient immediate checks | 0 |
| Learner questions | 6,903 |
| Contextual learner questions | 6,903 / 6,903 (100%) |
| Immediate quick checks | 2,718 |
| Rich-visual expected units | 309 |
| Rich SVG rendered units | 309 / 309 |
| Domain-specific SVG units | 309 / 309 |
| Subject-flow visual fallback | 0 |
| Remaining V17 automated review findings | 0 / 453 |

By subject, rich/domain visuals cover:

- Math: 87 / 87 units.
- Science: 126 / 126 units.
- Social: 96 / 96 units.

Chinese and English use text/language-oriented teaching patterns and are therefore not counted in the 309 rich-visual requirement.

## Structural and certification boundaries remain separate

The same build also kept the existing project integrity gates green:

- 453 active runtime units.
- 420 Foundation units pass V14 depth gates.
- 33 reviewed/scope units in the current runtime split.
- 15 Grade 7 math/science candidates pass the project V15 strict certification/promotion gates.
- 75 active curriculum tracks.
- 0 active structural blockers.

Passing the V17 automated pedagogy gate means the project no longer detects the specific V16 deficiencies in template dependence, unit linkage, example specificity, immediate retrieval, or rich-visual coverage. It is still distinct from external human editorial review, publisher approval, or government certification.
