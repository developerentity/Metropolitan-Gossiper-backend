import { IGossip } from "../gossip-model";

export type UserViewModel = {
  firstName: string;
  lastName: string;
  gossips: IGossip[];
  about: string;
};
