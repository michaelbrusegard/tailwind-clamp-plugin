import fs from 'fs';

const spacing = {
  0: '0rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
  112: '28rem',
  128: '32rem',
  144: '36rem',
  160: '40rem',
  176: '44rem',
  192: '48rem',
  px: '0.0625rem',
  0.5: '0.125rem',
  1.5: '0.375rem',
  2.5: '0.625rem',
  3.5: '0.875rem',
};

const fontsize = {
  xs: ['0.75rem', { lineHeight: '1.33333' }],
  sm: ['0.875rem', { lineHeight: '1.42857' }],
  base: ['1rem', { lineHeight: '1.5' }],
  lg: ['1.125rem', { lineHeight: '1.55555' }],
  xl: ['1.25rem', { lineHeight: '1.4' }],
  '2xl': ['1.5rem', { lineHeight: '1.33333' }],
  '3xl': ['1.875rem', { lineHeight: '1.2' }],
  '4xl': ['2.25rem', { lineHeight: '1.11111' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
  '8xl': ['6rem', { lineHeight: '1' }],
  '9xl': ['8rem', { lineHeight: '1' }],
};

const breakpoints = {
  '2xs': '24rem',
  xs: '32rem',
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
};

function generateClamp(
  minValueRem,
  maxValueRem,
  minBreakpointRem,
  maxBreakpointRem,
) {
  const minSizeRemValue = Number.parseFloat(minValueRem);
  const maxSizeRemValue = Number.parseFloat(maxValueRem);
  const minBreakpointRemValue = Number.parseFloat(minBreakpointRem);
  const maxBreakpointRemValue = Number.parseFloat(maxBreakpointRem);

  const slope =
    (maxSizeRemValue - minSizeRemValue) /
    (maxBreakpointRemValue - minBreakpointRemValue);

  const preferredValue = `${minSizeRemValue}rem + ${slope.toFixed(
    5,
  )} * (100vw - ${minBreakpointRemValue}rem)`;

  const minValue = Math.min(minSizeRemValue, maxSizeRemValue);
  const maxValue = Math.max(minSizeRemValue, maxSizeRemValue);

  return `clamp(${minValue}rem, calc(${preferredValue}), ${maxValue}rem)`;
}

const header = `/**
 * TailwindCSS v4.0 compatible CSS clamp().
 *
 * @author Michael Brusegard <https://github.com/michaelbrusegard>
 * @license MIT
 */

@theme inline {

  /* text */
`;

const divider = `\n  /* spacing */\n`;

const footer = `}\n`;

function generateFontSizeClamps() {
  const lines = [];
  const fontsizeEntries = Object.entries(fontsize);
  const breakpointValues = Object.values(breakpoints);
  const defaultMinBreakpoint = parseFloat(breakpoints.sm);
  const defaultMaxBreakpoint = parseFloat(breakpoints.xl);

  for (let i = 0; i < fontsizeEntries.length; i++) {
    for (let j = i + 1; j < fontsizeEntries.length; j++) {
      const [minSizeName, [minSize, minLineHeight]] = fontsizeEntries[i];
      const [maxSizeName, [maxSize, maxLineHeight]] = fontsizeEntries[j];

      const minValue = parseFloat(minSize);
      const maxValue = parseFloat(maxSize);
      const minLineHeightValue = parseFloat(minLineHeight.lineHeight);
      const maxLineHeightValue = parseFloat(maxLineHeight.lineHeight);

      // Default clamp (sm to xl)
      const defaultSizeClamp = generateClamp(
        minValue,
        maxValue,
        defaultMinBreakpoint,
        defaultMaxBreakpoint,
      );
      const defaultLineHeightClamp = generateClamp(
        maxLineHeightValue,
        minLineHeightValue,
        defaultMinBreakpoint,
        defaultMaxBreakpoint,
      );
      lines.push(
        `--text-${minSizeName}-${maxSizeName}-clamp: ${defaultSizeClamp};`,
        `--text-${minSizeName}-${maxSizeName}-clamp--line-height: ${defaultLineHeightClamp};`,
      );

      // Single breakpoint variations (min only)
      Object.keys(breakpoints).forEach((breakpoint) => {
        const bpValue = parseFloat(breakpoints[breakpoint]);
        const sizeClampMin = generateClamp(
          minValue,
          maxValue,
          bpValue,
          defaultMaxBreakpoint,
        );
        const lineHeightClampMin = generateClamp(
          minLineHeightValue,
          maxLineHeightValue,
          bpValue,
          defaultMaxBreakpoint,
        );
        lines.push(
          `--text-${minSizeName}-${maxSizeName}-clamp-${breakpoint}: ${sizeClampMin};`,
          `--text-${minSizeName}-${maxSizeName}-clamp-${breakpoint}--line-height: ${lineHeightClampMin};`,
        );
      });

      // Single breakpoint variations (max only)
      Object.keys(breakpoints).forEach((breakpoint) => {
        const bpValue = parseFloat(breakpoints[breakpoint]);
        const sizeClampMax = generateClamp(
          minValue,
          maxValue,
          defaultMinBreakpoint,
          bpValue,
        );
        const lineHeightClampMax = generateClamp(
          minLineHeightValue,
          maxLineHeightValue,
          defaultMinBreakpoint,
          bpValue,
        );
        lines.push(
          `--text-${minSizeName}-${maxSizeName}-clamp--${breakpoint}: ${sizeClampMax};`,
          `--text-${minSizeName}-${maxSizeName}-clamp--${breakpoint}--line-height: ${lineHeightClampMax};`,
        );
      });

      // Full breakpoint range combinations
      for (let k = 0; k < breakpointValues.length - 1; k++) {
        const minBreakpoint = parseFloat(breakpointValues[k]);
        const maxBreakpoint = parseFloat(breakpointValues[k + 1]);

        const sizeClamp = generateClamp(
          minValue,
          maxValue,
          minBreakpoint,
          maxBreakpoint,
        );
        const lineHeightClamp = generateClamp(
          minLineHeightValue,
          maxLineHeightValue,
          minBreakpoint,
          maxBreakpoint,
        );

        lines.push(
          `--text-${minSizeName}-${maxSizeName}-clamp-${Object.keys(breakpoints)[k]}-${Object.keys(breakpoints)[k + 1]}: ${sizeClamp};`,
          `--text-${minSizeName}-${maxSizeName}-clamp-${Object.keys(breakpoints)[k]}-${Object.keys(breakpoints)[k + 1]}--line-height: ${lineHeightClamp};`,
        );
      }
    }
  }
  return lines;
}

function generateSpacingClamps() {
  const lines = [];
  const spacingValues = Object.values(spacing);
  const breakpointValues = Object.values(breakpoints);
  const defaultMinBreakpoint = parseFloat(breakpoints.sm);
  const defaultMaxBreakpoint = parseFloat(breakpoints.xl);

  for (let i = 0; i < spacingValues.length; i++) {
    for (let j = i + 1; j < spacingValues.length; j++) {
      const minValue = parseFloat(spacingValues[i]);
      const maxValue = parseFloat(spacingValues[j]);

      // Default clamp (sm to xl)
      const defaultClamp = generateClamp(
        minValue,
        maxValue,
        defaultMinBreakpoint,
        defaultMaxBreakpoint,
      );
      lines.push(
        `--spacing-${Object.keys(spacing)[i]}-${Object.keys(spacing)[j]}-clamp: ${defaultClamp};`,
      );

      // Single breakpoint variations (min only)
      Object.keys(breakpoints).forEach((breakpoint) => {
        const bpValue = parseFloat(breakpoints[breakpoint]);
        const clampMin = generateClamp(
          minValue,
          maxValue,
          bpValue,
          defaultMaxBreakpoint,
        );
        lines.push(
          `--spacing-${Object.keys(spacing)[i]}-${Object.keys(spacing)[j]}-clamp-${breakpoint}: ${clampMin};`,
        );
      });

      // Single breakpoint variations (max only)
      Object.keys(breakpoints).forEach((breakpoint) => {
        const bpValue = parseFloat(breakpoints[breakpoint]);
        const clampMax = generateClamp(
          minValue,
          maxValue,
          defaultMinBreakpoint,
          bpValue,
        );
        lines.push(
          `--spacing-${Object.keys(spacing)[i]}-${Object.keys(spacing)[j]}-clamp--${breakpoint}: ${clampMax};`,
        );
      });

      // Full breakpoint range combinations
      for (let k = 0; k < breakpointValues.length - 1; k++) {
        const minBreakpoint = parseFloat(breakpointValues[k]);
        const maxBreakpoint = parseFloat(breakpointValues[k + 1]);
        const clampValue = generateClamp(
          minValue,
          maxValue,
          minBreakpoint,
          maxBreakpoint,
        );

        lines.push(
          `--spacing-${Object.keys(spacing)[i]}-${Object.keys(spacing)[j]}-clamp-${Object.keys(breakpoints)[k]
          }-${Object.keys(breakpoints)[k + 1]}: ${clampValue};`,
        );
      }
    }
  }
  return lines;
}


const textClamps = generateFontSizeClamps().map(line => '  ' + line);
const spacingClamps = generateSpacingClamps().map(line => '  ' + line);

const content = [
  header,
  ...textClamps,
  divider,
  ...spacingClamps,
  footer
].join('\n');

fs.writeFileSync('./src/tw-clamp.css', content, 'utf8');
