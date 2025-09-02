export interface PHPost {
  id: string;
  name: string;
  tagline?: string;
  url?: string;
  votesCount?: number;
}

export async function getTopProductsByVotes(first: number = 3): Promise<PHPost[]> {
  const token = process.env.PRODUCTHUNT_API_TOKEN;
  if (!token) return [];

  const query = `
    query TopByVotes($first: Int!) {
      posts(order: VOTES, first: $first) {
        edges {
          node { id name tagline url votesCount }
        }
      }
    }
  `;

  try {
    const resp = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { first } }),
    });
    if (!resp.ok) return [];
    const json = (await resp.json()) as any;
    const edges = json?.data?.posts?.edges ?? [];
    return edges.map((e: any) => ({
      id: e.node.id,
      name: e.node.name,
      tagline: e.node.tagline,
      url: e.node.url,
      votesCount: e.node.votesCount,
    }));
  } catch {
    return [];
  }
}

export interface AlgoliaHit {
  objectID: string;
  name: string;
  tagline?: string;
  url?: string;
  votesCount?: number;
}

export async function searchProducts(query: string): Promise<AlgoliaHit[]> {
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_SEARCH_API_KEY;
  const indexName = process.env.ALGOLIA_INDEX_NAME || 'Posts_production';
  if (!appId || !apiKey) return [];

  try {
    const endpoint = `https://${appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(indexName)}/query`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({ query, hitsPerPage: 10 }),
    });
    if (!resp.ok) return [];
    const json = (await resp.json()) as any;
    const hitsRaw = json?.hits ?? [];
    return hitsRaw.map((h: any) => ({
      objectID: h.objectID ?? h.id ?? String(h.id ?? ''),
      name: h.name,
      tagline: h.tagline ?? h.tag_line ?? h.tagLine,
      url: h.url ?? h.post_url,
      votesCount: h.votesCount ?? h.votes_count,
    }));
  } catch {
    return [];
  }
}

