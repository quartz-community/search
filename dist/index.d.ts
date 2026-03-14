import { QuartzComponent } from '@quartz-community/types';

interface SearchOptions {
    enablePreview: boolean;
}
declare const _default: (userOpts?: Partial<SearchOptions>) => QuartzComponent;

export { _default as Search, type SearchOptions };
