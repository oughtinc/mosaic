import * as React from "react";

import { EpisodeNav } from "./EpisodeShowPage/EpisodeNav";
import { Auth } from "../auth";
import { ContentContainer } from  "../components/ContentContainer";

export class BetweenEpisodesPagePresentational extends React.Component<any, any> {
  public render() {
    return (
      <div>
        {Auth.isAuthenticated() && (
          <EpisodeNav
            hasParent={false}
            hasTimer={false}
            hasTimerEnded={true}
            isTakingABreak={true}
          />
        )}
        <ContentContainer>
          Great job! Now is your chance to take a break. Press the button above when you're ready to start on the next workspace.
        </ContentContainer>
      </div>
    );
  }
}

export const BetweenEpisodesPage = BetweenEpisodesPagePresentational;
