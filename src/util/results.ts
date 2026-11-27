/** FlexSearch's matches in one field of the index. */
export interface FieldResults {
  field: string;
  result: Array<number | string>;
}

/**
 * The ids of the matching pages, best first: the matches in each field of `fieldPriority`, in
 * that order (the `fieldPriority` option), each page once.
 */
export function rankResultIds(searchResults: FieldResults[], fieldPriority: string[]): number[] {
  const getByField = (field: string): number[] => {
    const matched = searchResults.filter((x) => x.field === field);
    return matched.length === 0 ? [] : ([...matched[0]!.result] as number[]);
  };
  return [...new Set(fieldPriority.flatMap((field) => getByField(field)))];
}
