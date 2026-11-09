# @quartz-community/search

The Search component for Quartz - full-text search with FlexSearch integration.

## Features

- 🔍 **Full-Text Search** - Search across all your content instantly
- ⚡ **Fast Indexing** - Uses FlexSearch for high-performance search
- 📱 **Mobile Responsive** - Works great on all devices
- 🎯 **Search Preview** - Optional content preview panel
- 🌐 **Multi-Language** - Supports 30+ locales
- ⌨️ **Keyboard Shortcuts** - `Ctrl/Cmd + K` to open, `Escape` to close
- 🏷️ **Tag Search** - Search by tags with special syntax

## Installation

```bash
npx quartz plugin add @quartz-community/search
```

Search is already in Quartz's default configuration.

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/search"
    enabled: true
    options:
      enablePreview: true
      fieldPriority:
        - title
        - content
        - tags
    layout:
      position: left
      priority: 20
      group: toolbar
      groupOptions:
        grow: true
```

## Configuration Options

| Option          | Type                                    | Default                        | Description                                                      |
| --------------- | --------------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `enablePreview` | `boolean`                               | `true`                         | Show a preview of the selected result's content beside the list. |
| `fieldPriority` | `Array<"title" \| "content" \| "tags">` | `["title", "content", "tags"]` | Order in which matches from each field are ranked.               |

The placeholder and button text come from the site's `locale`.

## Default Behavior

By default, the search component:

- Displays as a button with a search icon
- Opens a fullscreen search modal when clicked
- Shows the top 8 search results, each with up to 5 of its tags
- Shows a content preview beside the results on desktop (hidden below 800px; disable with `enablePreview: false`)
- Supports keyboard navigation (arrow keys, Tab, Enter, Escape)

## How It Works

The Search component:

1. Fetches content data via the `fetchData` global (resolves `contentIndex.json` with the correct base path)
2. Builds a search index from your content with FlexSearch (bundled with the plugin)
3. Performs real-time search as you type
4. Shows results with optional content preview

> [!info]
> Search reads `contentIndex.json`, which Quartz's built-in content index emits by default. It has nothing to search if `configuration.contentIndex` is disabled in `quartz.config.yaml`.

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open/Close search
- `Ctrl/Cmd + Shift + K` - Open search in tag mode (or start the query with `#`)
- `Escape` - Close search
- `Arrow Up/Down`, `Tab`/`Shift + Tab` - Navigate results
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

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/features/full-text%20search) for more information.

## License

MIT
