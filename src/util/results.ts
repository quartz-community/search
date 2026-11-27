/** FlexSearch's matches in one field of the index. */
export interface FieldResults {
  field: string;
  result: Array<number | string>;
}

/**
 * The ids of the matching pages, best first: the matches in each field of `fieldPriority`, in
 * that order (the `fieldPriority` option), then those in the searched fields it leaves out, each
 * page once.
 */
export function rankResultIds(searchResults: FieldResults[], fieldPriority: string[]): number[] {
  const getByField = (field: string): number[] => {
    const matched = searchResults.filter((x) => x.field === field);
    return matched.length === 0 ? [] : ([...matched[0]!.result] as number[]);
  };
  const unlisted = searchResults
    .map((x) => x.field)
    .filter(
      (field, index, fields) => !fieldPriority.includes(field) && fields.indexOf(field) === index,
    );
  return [...new Set([...fieldPriority, ...unlisted].flatMap((field) => getByField(field)))];
}
