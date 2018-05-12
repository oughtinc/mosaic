import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import * as React from "react";
import _ = require("lodash");
import { WorkspaceCard } from "../../components/WorkspaceCard";
import { examples } from "./examples";

export class ExampleShowPage extends React.Component<any, any> {
    public render() {
        const {exampleName} = this.props.match.params;
        const example: any = examples.find((e: any) => e.url === exampleName);
        const workspaces = example.data.subtreeWorkspaces;
        const availablePointers: any = _
          .chain(workspaces)
          .map((w: any) => w.connectedPointers)
          .flatten()
          .uniqBy((p: any) => p.data.pointerId)
          .value();
        const rootWorkspace = workspaces.find((w) => w.id === example.rootWorkspaceId);
        return (
            <div>
                <h2> {example.name} </h2>
                <hr/>
                <BlockHoverMenu>
                    {rootWorkspace &&
                        <WorkspaceCard workspace={rootWorkspace} availablePointers={availablePointers} workspaces={workspaces} />
                    }
                </BlockHoverMenu>
            </div>
        );
    }
}