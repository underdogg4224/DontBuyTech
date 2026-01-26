# CategorySection Component

A responsive React component for displaying deals organized by category on the DontBuyTech homepage.

## Features

- **Responsive Design**: Horizontal scrolling on mobile, grid layout on desktop
- **Category Header**: Displays category name, icon, and deal count
- **View All Link**: Links to the full category page
- **Empty State**: Shows a friendly message when no deals are available
- **Smooth Scrolling**: Snap points for better mobile UX
- **Dark Mode Support**: Full dark mode styling

## Usage

```tsx
import { CategorySection } from '@/components/categories';
import { Category, DealWithVotes } from '@/lib/types';

// Example category
const category: Category = {
  id: '1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Latest tech deals and gadgets',
  icon: '📱',
};

// Example deals
const deals: DealWithVotes[] = [
  // ... your deals data
];

// Basic usage
<CategorySection category={category} deals={deals} />

// Don't show empty sections
<CategorySection
  category={category}
  deals={deals}
  showEmpty={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `Category` | Required | Category object with id, name, slug, icon, etc. |
| `deals` | `DealWithVotes[]` | Required | Array of deals to display in this category |
| `showEmpty` | `boolean` | `true` | Whether to render the component when there are no deals |

## Layout Behavior

### Mobile (< 768px)
- Horizontal scrollable container
- Fixed card width (280px)
- Snap points for smooth scrolling
- Scroll indicators showing position

### Desktop (≥ 768px)
- Responsive grid layout
  - 2 columns on medium screens (md)
  - 3 columns on large screens (lg)
  - 4 columns on extra-large screens (xl)

## Dependencies

- **DealCard**: Used to render individual deal cards
- **lucide-react**: ChevronRight icon for "View All" link
- **Next.js Link**: For navigation to category pages
- **Type imports**: Category and DealWithVotes from lib/types

## Styling

The component uses Tailwind CSS for all styling with:
- Custom gradient backgrounds for category icons
- Smooth transitions and hover effects
- Dark mode support via Tailwind's dark: variants
- Custom scrollbar hiding utility (`.scrollbar-hide`)

## Examples

### Homepage with Multiple Categories

```tsx
export default function HomePage() {
  const categories = [
    { id: '1', name: 'Electronics', slug: 'electronics', icon: '📱' },
    { id: '2', name: 'Clothing', slug: 'clothing', icon: '👕' },
  ];

  return (
    <main>
      {categories.map(category => (
        <CategorySection
          key={category.id}
          category={category}
          deals={dealsForCategory[category.id]}
        />
      ))}
    </main>
  );
}
```

### With Empty State Hidden

```tsx
<CategorySection
  category={category}
  deals={[]}
  showEmpty={false}
/>
// This will render nothing when there are no deals
```

## File Structure

```
components/categories/
├── category-section.tsx  # Main component
├── index.ts             # Exports
└── README.md            # This file
```

## Notes

- The component is marked as `"use client"` for Next.js App Router
- Requires the DealCard component from `components/deals/deal-card`
- Category slugs are used for URL generation (`/categories/{slug}`)
- Icon can be an emoji or icon identifier
- Scrollbar hiding requires the `.scrollbar-hide` utility in globals.css
