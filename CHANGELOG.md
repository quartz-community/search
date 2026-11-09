# Changelog

## 1.0.3

### Patch Changes

- b3989bb: Uses Quartz's own `preact` instead of bundling a second copy (`noExternal` in the build overrode the externals). Components now share one Preact instance with Quartz and other plugins, so hooks and context work across them, and the bundle is smaller.

## 1.0.2

### Patch Changes

- 5669b5d: Bundles `@quartz-community/utils` 1.1.0: a short wikilink to an Obsidian folder note (`[[Topic]]` for `Topic/Topic.md`) reaches the folder page, and anchors to headings use the same slug as heading ids. `github-slugger` is no longer a dependency of this plugin.

## 1.0.1

### Patch Changes

- ce333e8: The manifest declares that the plugin needs `static/contentIndex.json` (`quartz.capabilities`), so Quartz 5.1+ reports a missing content index at build time instead of shipping a search with nothing to search. Older versions ignore the field.

## 1.0.0

### Major Changes

- Stable 1.0 release. All `@quartz-community/*` dependencies now use `^1.0.0` ranges.

  Pre-1.0 caret ranges pinned the minor version (`^0.2.1` means `>=0.2.1 <0.3.0`), so
  published fixes to shared packages could never be resolved by dependents. Moving the
  ecosystem to 1.0 makes caret ranges behave conventionally.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Listen for `content-index-updated` `CustomEvent` dispatches and incrementally add the new entries to the FlexSearch index. This enables runtime extension of the search index by other plugins — in particular `@quartz-community/encrypted-pages`, which patches the in-memory content index with newly-decrypted unlisted pages and dispatches this event so the user can find and open those pages via search within the same browser session.

- Initial Quartz community plugin template.
