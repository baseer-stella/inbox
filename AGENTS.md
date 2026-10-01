# Design system rules

## Source of truth

- Treat the JSON files in `tokens/` as the only source for colors, spacing, corner radii, font families, weights, and type styles.
- `tokens/typography.json` records the typography scale and guide styles from the [Nest styles and variables Figma file](https://www.figma.com/design/vARifSMoeMxyslzY3o39fd/Nest-%E2%8B%85-Styles---Variables?node-id=8668-2).
- After editing source tokens, run `npm run tokens:generate`. This generates `src/styles/tokens.css` and `tailwind.config.cjs`; do not hand edit those generated files.

## Styling

- Do not add hardcoded design values in components or stylesheets. Avoid raw color values, pixel/rem sizes, font names or weights, spacing, radii, and arbitrary Tailwind values outside `tokens/` and generated theme outputs.
- Use semantic Tailwind color classes, token-backed spacing and radius utilities, and typography utilities from the generated Tailwind configuration.
- When a value needs to be chosen dynamically, compose the CSS custom property name from token keys and reference it with `var(...)`.
- Keep component CSS limited to layout composition. Any design measurement it needs must come from a token in `tokens/`.

## Typography

- Use Plus Jakarta Sans for text styles and Inter for typography-guide labels and metadata.
- Use the named scale from `text-9xl` through `text-xxs` and the `normal`, `medium`, `semibold`, and `bold` weights.
- Preserve the weight-specific line-height token where one is defined, including the `text-5xl` semibold style.
