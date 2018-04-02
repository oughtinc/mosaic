import styled from "styled-components";
import * as React from "react";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faCircle = require("@fortawesome/fontawesome-free-solid/faCircle");
import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";

export enum toggleTypes {
    FULL,
    QUESTION = 0,
    ANSWER,
    SCRATCHPAD,
    CHILDREN,
}

const Container = styled.div`
    float: left;
`;

const PrimaryBullet = styled.div`
    float: left;
    background: #f2f2f2;
    border-radius: 2px 0 0 2px;
    svg {
        color: #c3c3c3;
        margin: 5px 5px 2px 5px;
        cursor: pointer;
    }
`;

const CardBody = styled.div`
    float: left;
    margin-bottom: 1em;
    width: 40em;
    background: #f2f2f2;
    border-radius: 0 2px 2px 2px;
`;

// TODO: Eventually these should be used in a common file for many cases that use them.
interface ConnectedPointerType {
    data: any;
    isVoid: boolean;
    object: string;
    type: string;
    nodes: any[];
} 

interface WorkspaceType {
    blocks: any[];
    childWorkspaceOrder: string[];
    connectedPointers: any;
} 

// Eventually we'll type out many of these items more spefically, but that's a future refactor.
interface WorkspaceCardProps {
    workspace: WorkspaceType;
    workspaces: WorkspaceType[];
    availablePointers: ConnectedPointerType;
}

interface WorkspaceCardState {
    toggles: {
        [toggleTypes.SCRATCHPAD]: boolean,
        [toggleTypes.CHILDREN]: boolean,
    };
}

export class WorkspaceCard extends React.Component<WorkspaceCardProps, WorkspaceCardState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            toggles: {
                [toggleTypes.SCRATCHPAD]: true,
                [toggleTypes.CHILDREN]: true,
            },
        };
    }

    public handleChangeToggle = (name: toggleTypes, value: boolean) => {
        const newToggles = { ...this.state.toggles };
        newToggles[name] = value;
        this.setState({ toggles: newToggles });
    }

    public render() {
        const { workspace, availablePointers, workspaces } = this.props;
        return (
            <Container>
                <CardBody>
                    <BlockSection workspace={workspace} availablePointers={availablePointers} />
                </CardBody>
                <ChildrenSection
                    workspace={workspace}
                    workspaces={workspaces}
                    availablePointers={availablePointers}
                    childrenToggle={this.state.toggles[toggleTypes.CHILDREN]}
                    onChangeToggle={
                        () => this.handleChangeToggle(toggleTypes.CHILDREN, !this.state.toggles[toggleTypes.CHILDREN])
                    }
                />
            </Container>
        );
    }
}