import { IGossipModel } from "../gossip-model";

export type GossipsListViewModel = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: IGossipModel[];
};
