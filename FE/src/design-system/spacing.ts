/**
 * 📐 Spacing and Layout rhythm system
 * Enforces visual consistency across grids, cards, and forms.
 */

export const spacing = {
  // Grid layout gap (for dashboard widgets / double-columns)
  grid: "gap-6", // 24px
  
  // Layout spacing for form fields
  formField: "gap-4", // 16px
  
  // Padding inside standard card containers
  cardPadding: "p-6", // 24px
  
  // Margin for vertical separation of large sections
  pageSection: "space-y-6", // 24px
  
  // Data Table cell sizing for dense supply chain grids
  tableHeaderCell: "py-3 px-4",
  tableCell: "py-3 px-4",
  
  // Margin below page header section
  pageHeaderBottom: "mb-8", // 32px
};

/**
 * Standard sizes representing Tailwind classes
 */
export const sizes = {
  sidebarWidth: "w-[220px]",
  headerHeight: "h-12", // 48px
  miniMapHeight: "h-[240px]",
  largeMapHeight: "h-[calc(100vh-100px)]",
};
