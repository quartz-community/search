# @quartz-community/search

The Search component for Quartz - full-text search with FlexSearch integration.

This is a first-party community plugin for Quartz, demonstrating the new plugin system that allows components to be distributed as npm packages. It provides instant full-text search across your content using FlexSearch for fast indexing and retrieval.

## Features

- 🔍 **Full-Text Search** - Search across all your content instantly
- ⚡ **Fast Indexing** - Uses FlexSearch for high-performance search
- 📱 **Mobile Responsive** - Works great on all devices
- 🎯 **Search Preview** - Optional content preview panel
- 🌐 **Multi-Language** - Supports 30+ locales
- ⌨️ **Keyboard Shortcuts** - `Ctrl/Cmd + K` to open, `Escape` to close
- 🏷️ **Tag Search** - Search by tags with special syntax

## Installation

### From GitHub (Recommended for now)

```bash
npm install github:quartz-community/search --legacy-peer-deps
```

### From NPM (when published)

```bash
npm install @quartz-community/search
```

## Usage

### 1. Configure in quartz.config.ts

Add the plugin to your externalPlugins array:

```typescript
// quartz.config.ts
import { QuartzConfig } from "./quartz/cfg";

const config: QuartzConfig = {
  configuration: {
    // ... your configuration
  },
  plugins: {
    // ... your existing plugins
  },
  externalPlugins: ["@quartz-community/search"],
};

export default config;
```

### 2. Import in your layout

```typescript
// quartz.layout.ts
import { Search } from "@quartz-community/search";

// Create the Search component once
const searchComponent = Search({
  enablePreview: true,
  placeholder: "Search for something",
  title: "Search",
});

export const defaultContentPageLayout: PageLayout = {
  // ... other layout config
  left: [
    searchComponent,
    // ... other components
  ],
};

export const defaultListPageLayout: PageLayout = {
  // ... other layout config
  left: [
    searchComponent, // Reuse the same component instance
    // ... other components
  ],
};
```

## Configuration Options

```typescript
interface SearchOptions {
  /** Enable content preview panel */
  enablePreview?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom title for the search button */
  title?: string;
}
```

## Default Behavior

By default, the search component:

- Displays as a button with a search icon
- Opens a fullscreen search modal when clicked
- Shows up to 8 search results
- Enables content preview on desktop (can be disabled)
- Supports keyboard navigation (arrow keys, Enter, Escape)
- Uses FlexSearch from CDN for indexing

## How It Works

The Search component:

1. Loads FlexSearch library from CDN when initialized
2. Fetches content data from `/static/contentIndex.json`
3. Builds a search index from your content
4. Performs real-time search as you type
5. Shows results with optional content preview

> [!info]
> Search requires the `ContentIndex` emitter plugin to be present in your Quartz configuration.

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open/Close search
- `Escape` - Close search
- `Arrow Up/Down` - Navigate results
- `Enter` - Open selected result

## Development

This is a first-party Quartz community plugin. It serves as both:

1. A production-ready Search component
2. A reference implementation for building Quartz community plugins

To build locally:

```bash
npm install
npm run build
```

The `prepare` script automatically builds during installation.

## License

MIT
