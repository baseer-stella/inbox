import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokenDirectory = path.join(root, "tokens");
const outputDirectory = path.join(root, "src", "styles");
const typography = JSON.parse(fs.readFileSync(path.join(tokenDirectory, "typography.json"), "utf8"));

const readCollection = (filename) =>
  JSON.parse(fs.readFileSync(path.join(tokenDirectory, filename), "utf8"));

const normalizeName = (name) =>
  name
    .split("/")
    .map((part) => part.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9-]/g, "-"))
    .join("-");

const cssNumber = (value) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
const px = (value) => `${cssNumber(value)}px`;
const cssVar = (name) => `--${name}`;

const colorCollections = [readCollection("color-primitive.json"), readCollection("color-styles.json")];
const spacingCollection = readCollection("spacing.json");
const radiusCollection = readCollection("corner-radius.json");

const colorTokens = colorCollections.flatMap((collection) =>
  collection.variables.map((variable) => {
    const resolved = Object.values(variable.resolvedValuesByMode)[0].resolvedValue;
    const channel = (value) => Math.round(value * 255).toString(16).padStart(2, "0");
    const hex = `#${channel(resolved.r)}${channel(resolved.g)}${channel(resolved.b)}`;
    const alpha = resolved.a ?? 1;
    const value = alpha === 1 ? hex : `${hex}${channel(alpha)}`;
    return { name: variable.name, key: normalizeName(variable.name), value };
  }),
);
for (const [key, value] of Object.entries(typography.guideColors ?? {})) {
  colorTokens.push({ name: `typography/guide/${key}`, key: normalizeName(`typography/guide/${key}`), value });
}

const spacingTokens = spacingCollection.variables.map((variable) => ({
  name: variable.name,
  key: normalizeName(variable.name),
  utilityKey: variable.name.replace(/^(\d+)-(\d+)$/, "$1.$2"),
  value: Object.values(variable.resolvedValuesByMode)[0].resolvedValue,
}));

const radiusTokens = radiusCollection.variables.map((variable) => ({
  name: variable.name.replace(/^radius\//, ""),
  key: normalizeName(variable.name.replace(/^radius\//, "")),
  value: Object.values(variable.resolvedValuesByMode)[0].resolvedValue,
}));

const cssLines = [
  "/* Generated from tokens/*.json. Edit source tokens, then run npm run tokens:generate. */",
];

const importFamilies = [
  [typography.fontFamilies.sans, typography.fontWeights.map(({ value }) => value)],
  [
    typography.fontFamilies.ui,
    [...new Set(
      Object.values(typography.guideStyles)
        .map((style) => typography.fontWeights.find(({ key }) => key === style.fontWeight)?.value)
        .filter((value) => value !== undefined),
    )].sort((first, second) => first - second),
  ],
];
const googleFamilies = importFamilies
  .map(([family, weights]) => {
    const familyName = encodeURIComponent(family).replaceAll("%20", "+");
    return `family=${familyName}:wght@${weights.join(";")}`;
  })
  .join("&");
cssLines.push(`@import url("https://fonts.googleapis.com/css2?${googleFamilies}&display=swap");`, "", ":root {");

for (const token of colorTokens) cssLines.push(`  ${cssVar(`color-${token.key}`)}: ${token.value};`);
for (const token of spacingTokens) cssLines.push(`  ${cssVar(`space-${token.key}`)}: ${px(token.value)};`);
for (const token of radiusTokens) cssLines.push(`  ${cssVar(`radius-${token.key}`)}: ${px(token.value)};`);

cssLines.push(
  `  ${cssVar("font-family-sans")}: "${typography.fontFamilies.sans}", sans-serif;`,
  `  ${cssVar("font-family-ui")}: "${typography.fontFamilies.ui}", sans-serif;`,
);
for (const weight of typography.fontWeights) {
  cssLines.push(`  ${cssVar(`font-weight-${weight.key}`)}: ${weight.value};`);
}
for (const style of typography.scale) {
  cssLines.push(`  ${cssVar(`font-size-${style.key}`)}: ${px(style.fontSize)};`);
  cssLines.push(`  ${cssVar(`line-height-${style.key}`)}: ${px(style.lineHeights.normal)};`);
  for (const weight of typography.fontWeights) {
    cssLines.push(`  ${cssVar(`line-height-${style.key}-${weight.key}`)}: ${px(style.lineHeights[weight.key])};`);
  }
}
for (const [key, style] of Object.entries(typography.guideStyles)) {
  cssLines.push(`  ${cssVar(`font-size-guide-${key}`)}: ${px(style.fontSize)};`);
  cssLines.push(`  ${cssVar(`line-height-guide-${key}`)}: ${style.lineHeight};`);
}
for (const [key, value] of Object.entries(typography.guideLayout)) {
  const cssValue = typeof value === "number" ? px(value) : value;
  cssLines.push(`  ${cssVar(`guide-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`)}: ${cssValue};`);
}
cssLines.push("}", "");

const colorConfig = {};
for (const token of colorTokens) {
  const segments = token.name.split("/");
  let current = colorConfig;
  for (const segment of segments.slice(0, -1)) current = current[segment] ??= {};
  current[segments.at(-1)] = `var(${cssVar(`color-${token.key}`)})`;
}

const spacingConfig = Object.fromEntries(
  spacingTokens.map((token) => [token.utilityKey, `var(${cssVar(`space-${token.key}`)})`]),
);
const radiusConfig = Object.fromEntries(
  radiusTokens.map((token) => [token.name, `var(${cssVar(`radius-${token.key}`)})`]),
);
const fontSizes = Object.fromEntries([
  ...typography.scale.map((style) => [
    style.key,
    [`var(${cssVar(`font-size-${style.key}`)})`, { lineHeight: `var(${cssVar(`line-height-${style.key}`)})` }],
  ]),
  ...Object.entries(typography.guideStyles).map(([key]) => [
    `guide-${key}`,
    [`var(${cssVar(`font-size-guide-${key}`)})`, { lineHeight: `var(${cssVar(`line-height-guide-${key}`)})` }],
  ]),
]);
const lineHeights = Object.fromEntries(
  typography.scale.flatMap((style) => [
    [style.key, `var(${cssVar(`line-height-${style.key}`)})`],
    ...typography.fontWeights.map((weight) => [
      `${style.key}-${weight.key}`,
      `var(${cssVar(`line-height-${style.key}-${weight.key}`)})`,
    ]),
  ]),
);
const fontWeights = Object.fromEntries(
  typography.fontWeights.map(({ key }) => [key, `var(${cssVar(`font-weight-${key}`)})`]),
);

const tailwindConfig = `// Generated from tokens/*.json. Edit source tokens, then run npm run tokens:generate.\nmodule.exports = ${JSON.stringify({
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: colorConfig,
    spacing: spacingConfig,
    borderRadius: radiusConfig,
    fontFamily: {
      sans: ["var(--font-family-sans)"],
      ui: ["var(--font-family-ui)"],
    },
    fontWeight: fontWeights,
    fontSize: fontSizes,
    lineHeight: lineHeights,
  },
  plugins: [],
}, null, 2)};\n`;

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "tokens.css"), `${cssLines.join("\n")}\n`);
fs.writeFileSync(path.join(root, "tailwind.config.cjs"), tailwindConfig);
