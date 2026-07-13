/** Deterministically assigns each tag name a pink/grey visual "kind", matching the design system. */
export function tagKindFor(name: string): 'pink' | 'grey' {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return hash % 2 === 0 ? 'pink' : 'grey';
}
