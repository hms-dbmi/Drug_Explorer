declare module 'comlink-loader!*' {
  import { INode, ILink } from 'types';
  class WebpackWorker extends Worker {
    constructor();
    calculateLayout(
      data: { nodes: INode[]; links: ILink[] },
      radius: number
    ): Promise<{ nodes: INode[]; links: ILink[] }>;
  }

  export = WebpackWorker;
}
