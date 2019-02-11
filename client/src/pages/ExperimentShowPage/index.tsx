import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ContentContainer } from  "../../components/ContentContainer";

interface NextWorkspaceBtnProps {
  bsStyle: string;
  experimentId: string;
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({ bsStyle, experimentId, label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to={`/next?experiment=${experimentId}`} style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle={bsStyle}>{label} »</Button>
    </Link>
  );
};

export class ExperimentShowPagePresentational extends React.Component<any, any> {
  public render() {
    const experimentId = this.props.match.params.experimentId;
    return (
      <div>
        <ContentContainer>
          <NextWorkspaceBtn
            bsStyle="primary"
            experimentId={experimentId}
            label={"Participate in experiment"}
          />
        </ContentContainer>
      </div>
    );
  }
}

export const ExperimentShowPage = ExperimentShowPagePresentational;
