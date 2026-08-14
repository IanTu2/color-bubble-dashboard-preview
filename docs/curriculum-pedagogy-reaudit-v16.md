# Curriculum Pedagogy Re-audit V16

Date: 2026-08-14

This second-pass review intentionally separates **runtime / structural completeness** from **student-facing pedagogical quality**. A unit passing V14/V15 integrity checks is no longer treated as evidence that the lesson is fully mature for independent learning.

## Structural baseline

- Active curriculum units: **453**
- Runtime-resolved units: **453**
- Strict reviewed / scope units: **33**
- Foundation units: **420**
- V15 Grade 7 math/science certification candidates passing existing strict gates: **15/15**
- Structural blockers: **0**

## Pedagogical baseline

Under the V16 second-pass criteria, **453/453 active units require at least one pedagogical revision**.

| Finding | Units |
|---|---:|
| High template dependence in question bank | 453 |
| Weak question specificity | 453 |
| Worked examples not sufficiently tied to the unit | 121 |
| Concept specificity below the new threshold | 16 |
| Math/science/social units lacking direct rich visual support | 281 |
| Concept teaching separated from immediate retrieval/checks | Global learner-flow issue |

## Subject breakdown

| Subject | Units | High template | Weak concepts | Weak questions | Weak examples | Weak visuals |
|---|---:|---:|---:|---:|---:|---:|
| Chinese | 72 | 72 | 0 | 72 | 31 | 0 |
| English | 72 | 72 | 9 | 72 | 27 | 0 |
| Math | 87 | 87 | 5 | 87 | 27 | 87 |
| Science | 126 | 126 | 2 | 126 | 26 | 101 |
| Social | 96 | 96 | 0 | 96 | 10 | 93 |

## Root causes identified

1. `curriculum-textbook-v14.ts` guarantees minimum counts by generating concepts, misconceptions, worked examples and questions. This is useful as a structural fallback, but the generated layer became too large a share of the learner experience.
2. `curriculum-textbook-v14-final.ts` pads short explanations, examples, answers, distractors and rubrics. This makes content self-contained and safe to render, but can allow generic material to satisfy length-based validators.
3. The active reader still groups concept teaching and question practice into separate lesson phases. It does not yet consistently implement the desired cadence: **context → teach a little → immediate check → feedback → next concept**.
4. Current V14 `TextbookVisual` objects are mainly structured text cards. They are not a substitute for number lines, geometry, diagrams, charts, maps, timelines, scientific models, or other domain-native teaching visuals.

## New review policy

From V16 onward, the project should distinguish these states:

- **Runtime ready**: content resolves and is technically safe to render.
- **Depth ready**: minimum concept/example/question coverage and self-contained-question gates pass.
- **Pedagogy reviewed**: unit-specific teaching sequence, examples, questions, feedback and visuals have passed the V16 teaching-quality audit.
- **Certified / scope verified**: official-scope review and project certification gates pass where applicable.

No future status message should describe all 453 units as fully teaching-ready solely because runtime/depth checks are green.

## Remediation order

1. Replace template-heavy question generation with unit-specific diagnostic, application and transfer items.
2. Rebuild lesson sequencing so concepts and short retrieval checks are interleaved.
3. Upgrade math/science/social visuals to domain-native assets/components.
4. Rewrite the 121 weak worked-example units with concrete, unit-specific contexts and steps.
5. Rewrite the 16 concept-specificity outliers.
6. Re-run V16 after each batch and only promote units to pedagogy-reviewed when all relevant findings clear.
