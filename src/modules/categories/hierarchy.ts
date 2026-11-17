export interface CategoryNode {
  id: string;
  parentId: string | null;
}

/** True when `id` would end up inside its own subtree under `parentId`. */
export function wouldCreateCycle(
  nodes: CategoryNode[],
  id: string,
  parentId: string | null,
): boolean {
  const parentOf = new Map(nodes.map((node) => [node.id, node.parentId]));
  const seen = new Set<string>();
  let current = parentId;
  while (current) {
    if (current === id || seen.has(current)) return true;
    seen.add(current);
    current = parentOf.get(current) ?? null;
  }
  return false;
}

/** Parents first, each followed by its children, alphabetical within a level. */
export function toTreeOrder<T extends CategoryNode & { name: string }>(
  nodes: T[],
): (T & { depth: number })[] {
  const known = new Set(nodes.map((node) => node.id));
  const childrenOf = new Map<string | null, T[]>();
  for (const node of nodes) {
    const key =
      node.parentId && known.has(node.parentId) ? node.parentId : null;
    childrenOf.set(key, [...(childrenOf.get(key) ?? []), node]);
  }

  const ordered: (T & { depth: number })[] = [];
  const visit = (parentId: string | null, depth: number) => {
    const children = [...(childrenOf.get(parentId) ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const child of children) {
      ordered.push({ ...child, depth });
      visit(child.id, depth + 1);
    }
  };
  visit(null, 0);
  return ordered;
}

/** Categories that can't be chosen as `id`'s parent: itself and its subtree. */
export function subtreeIds(nodes: CategoryNode[], id: string): Set<string> {
  const excluded = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of nodes) {
      if (
        node.parentId &&
        excluded.has(node.parentId) &&
        !excluded.has(node.id)
      ) {
        excluded.add(node.id);
        grew = true;
      }
    }
  }
  return excluded;
}
