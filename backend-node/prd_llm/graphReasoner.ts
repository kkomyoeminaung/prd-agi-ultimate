import { db } from '../database';

export class GraphReasoner {
  async computeAdjacencyMatrix() {
    const links = await db.all(`SELECT source_concept, target_concept, strength FROM causal_links`);
    const nodes = new Set<string>();
    links.forEach(l => { nodes.add(l.source_concept); nodes.add(l.target_concept); });
    const nodeList = Array.from(nodes);
    const nodeIndex = new Map(nodeList.map((n, i) => [n, i]));
    
    // Simulate a simple 2-hop GNN
    return { nodeList, nodeIndex, links };
  }

  async traverseGraph(startConcept: string, hops: number = 2): Promise<string[]> {
    let currentNodes = new Set([startConcept]);
    let visited = new Set([startConcept]);
    let paths: string[] = [];

    for (let i = 0; i < hops; i++) {
        const nextNodes = new Set<string>();
        for (const node of currentNodes) {
           const links = await db.all(`SELECT target_concept, relation_type FROM causal_links WHERE source_concept LIKE ?`, [`%${node}%`]);
           for (const link of links) {
               if (!visited.has(link.target_concept)) {
                   nextNodes.add(link.target_concept);
                   visited.add(link.target_concept);
                   paths.push(`${node} -[${link.relation_type}]-> ${link.target_concept}`);
               }
           }
        }
        currentNodes = nextNodes;
    }
    return paths;
  }
}

export const graphReasoner = new GraphReasoner();
