import * as d3 from 'd3';
import { INode, ILink } from 'types';

export function calculateLayout(
  data: { nodes: INode[]; links: ILink[] },
  radius: number
) {
  // var nodes = event.data.nodes,
  //     links = event.data.links;
  let { nodes, links } = data;

  let simulation = d3
    .forceSimulation<INode, ILink>()
    .force('charge', d3.forceManyBody<INode>().strength(-170))
    .force(
      'link',
      d3.forceLink<INode, ILink>().id((d) => d.id)
      // .distance(30)
      // .strength(1)
    )
    .force('collision', d3.forceCollide().radius(radius + 2))
    // .force("center", d3.forceCenter(width / 2, height*0.6))
    // .alphaMin(0.2) // force quick simulation
    .stop();

  simulation.nodes(nodes);
  simulation.force<d3.ForceLink<INode, ILink>>('link')!.links(links);

  // run simulation first, then draw graph
  for (
    var i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
      );
    i < n;
    ++i
  ) {
    simulation.tick(1);
  }

  return { nodes, links };
}
