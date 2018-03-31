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

export class WorkspaceCard extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {
            toggles: {
                [toggleTypes.QUESTION]: true,
                [toggleTypes.ANSWER]: true,
                [toggleTypes.SCRATCHPAD]: false,
                [toggleTypes.CHILDREN]: true,
            },
        };
    }

    public handleChangeToggle = (name: toggleTypes, value: boolean) => {
        const newToggles = { ...this.state.toggles };
        newToggles[name] = value;
        this.setState({ toggles: newToggles });
    }

    public toggleAll = () => {
        if (this.state.toggles[toggleTypes.QUESTION]) {
            this.setState({
                toggles: {
                    [toggleTypes.QUESTION]: false,
                    [toggleTypes.ANSWER]: false,
                    [toggleTypes.SCRATCHPAD]: false,
                    [toggleTypes.CHILDREN]: false,
                },
            });
        } else {
            this.setState({
                toggles: {
                    [toggleTypes.QUESTION]: true,
                    [toggleTypes.ANSWER]: true,
                    [toggleTypes.SCRATCHPAD]: true,
                    [toggleTypes.CHILDREN]: true,
                },
            });
        }
    }

    public render() {
        const { workspace, availablePointers, workspaces } = this.props;
        return (
            <Container>
                <PrimaryBullet>
                    <a onClick={this.toggleAll} href="#!">
                        <FontAwesomeIcon icon={faCircle} />
                    </a>
                </PrimaryBullet>
                <CardBody>
                    <BlockSection workspace={workspace} availablePointers={availablePointers} toggles={this.state.toggles} />
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