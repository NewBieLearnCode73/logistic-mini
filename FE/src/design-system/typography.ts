/**
 * 📚 Typography scale definitions and helper classes
 * Based on Inter typeface with high operational scanning characteristics.
 */

export const typography = {
  fontFamily: {
    sans: "font-sans antialiased",
    mono: "font-mono",
  },
  
  // High-density scales suited for complex operational monitors
  scale: {
    // Page Title (H1)
    h1: "text-2xl font-semibold tracking-tight text-text-primary dark:text-zinc-50",
    
    // Section Header (H2)
    h2: "text-[16px] font-medium tracking-tight text-text-primary dark:text-zinc-150",
    
    // Card Header / Group Label (H3)
    h3: "text-[14px] font-medium text-text-primary dark:text-zinc-200",
    
    // Body Text
    body: "text-[13px] leading-relaxed text-text-secondary dark:text-zinc-400",
    
    // Auxiliary descriptors, timestamps, labels
    metadata: "text-2xs font-mono uppercase tracking-wider text-text-muted dark:text-zinc-500",
    
    // Monospace IDs, codes, numeric readings
    monoCode: "text-xs font-mono font-medium text-text-primary dark:text-zinc-100 bg-muted px-1.5 py-0.5 rounded",
  },
};

/**
 * Utility to combine classes dynamically
 */
export function getTypographyClass(variant: keyof typeof typography.scale): string {
  return `${typography.fontFamily.sans} ${typography.scale[variant]}`;
}
