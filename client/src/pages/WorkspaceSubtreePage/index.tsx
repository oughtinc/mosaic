import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import styled from "styled-components";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { NewBlockForm } from "../../components/NewBlockForm";
import { databaseJSONToValue } from "../../lib/slateParser";
import * as React from "react";
import _ = require("lodash");
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faCircle = require("@fortawesome/fontawesome-free-solid/faCircle");
import faLongArrowAltRight = require("@fortawesome/fontawesome-free-solid/faLongArrowAltRight");

const WORKSPACES_QUERY = gql`
query workspaceSubtree($workspaceId: String!){
    subtreeWorkspaces(workspaceId:$workspaceId){
       id
       childWorkspaceOrder
       connectedPointers
       blocks{
         id
         value
         type
       }
     }
  }
`;

const Bullet = styled.div`
    margin-left: .3em;
    margin-bottom: 1em;
    font-size:4em;
`;

const Container = styled.div`
    float: left;
`;

const LeftBulletArea = styled.div`
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

const ChildrenContainer = styled.div`
    float: left;
    width: 100%;
`;

const BlockBullet = styled.a`
    float: left;
    border-radius: 2px;
    color: #d0cccc;
    padding: 0px 4px;
    margin: 4px 4px 4px 9px;
    font-weight: 500;
`;

const BlockContainer = styled.div`
    flex: 1;
`;

const BlockEditorContainer = styled.div`
    float: left;
`;

const BlocksContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ChildrenBullet = styled.a`
    float: left;
    margin-left: 26px;
    background: #f2f2f2;
    border-radius: 2px;
    margin-right: 13px;
    svg {
        color: #c3c3c3;
        margin: 5px 5px 2px 5px;
    }
`;

const ChildrenCollection = styled.div`
    float: left;
    width: calc(100% - 100px);
    display: flex;
    flex-direction: column;
`;

const ChildContainer = styled.div`
    flex: 1;
`;

const Block = ({ character, block, availablePointers, toggle, onChangeToggle }) => {
    if (!!block.value) {
        return (
            <BlockContainer>
                <BlockBullet href="#!">
                    {character}
                </BlockBullet>
                {toggle &&
                    <BlockEditorContainer>
                        <BlockEditor
                            name={block.id}
                            blockId={block.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(block.value)}
                            shouldAutosave={false}
                            availablePointers={availablePointers}
                        />
                    </BlockEditorContainer>
                }
            </BlockContainer>
        );
    } else {
        return (<div />);
    }
};

export enum toggleTypes {
    FULL,
    QUESTION = 0,
    ANSWER,
    SCRATCHPAD,
    CHILDREN,
}

const Blocks = ({ workspace, availablePointers, toggles, onChangeToggle }) => {
    const question = workspace.blocks.find((b) => b.type === "QUESTION");
    const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
    const answer = workspace.blocks.find((b) => b.type === "ANSWER");
    return (
        <div style={{ display: "flexbox" }}>
            <BlocksContainer>
                <Block block={question} character={"Q"} availablePointers={availablePointers} toggle={toggles[toggleTypes.QUESTION]} onChangeToggle={onChangeToggle} />
                <Block block={scratchpad} character={"S"} availablePointers={availablePointers} toggle={toggles[toggleTypes.SCRATCHPAD]} onChangeToggle={onChangeToggle} />
                <Block block={answer} character={"A"} availablePointers={availablePointers} toggle={toggles[toggleTypes.ANSWER]} onChangeToggle={onChangeToggle} />
            </BlocksContainer>
        </div>
    );
};

export class Child extends React.Component<any, any> {
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
        const children = workspace.childWorkspaceOrder.map((id) => workspaces.find((w) => w.id === id));
        return (
            <Container>
                <LeftBulletArea>
                    <a onClick={this.toggleAll} href="#!">
                        <FontAwesomeIcon icon={faCircle} />
                    </a>
                </LeftBulletArea>
                <CardBody>
                    <Blocks workspace={workspace} availablePointers={availablePointers} toggles={this.state.toggles} onChangeToggle={this.handleChangeToggle} />
                    {/* <Link to={`/workspaces/${workspace.id}`}>
                        <Button bsSize="xsmall"> Open </Button>
                    </Link> */}
                </CardBody>
                {!!children.length &&
                    <ChildrenContainer>
                        <ChildrenBullet href="#!" onClick={() => this.handleChangeToggle(toggleTypes.CHILDREN, !this.state.toggles[toggleTypes.CHILDREN])}>
                            <FontAwesomeIcon icon={faLongArrowAltRight} />
                        </ChildrenBullet>
                        {this.state.toggles[toggleTypes.CHILDREN] &&
                            <ChildrenCollection>
                                {children.map((child) => (
                                    <ChildContainer key={child.id}>
                                    <Child workspace={child} availablePointers={availablePointers} workspaces={workspaces} />
                                    </ChildContainer>
                                ))}
                            </ChildrenCollection>
                        }
                    </ChildrenContainer>
                }
            </Container>
        );
    }
}

export class WorkspaceSubtreePagePresentational extends React.Component<any, any> {
    public render() {
        const workspaces = _.get(this.props, "workspaceSubtreeWorkspaces.subtreeWorkspaces") || [];
        const availablePointers = _.flatten(workspaces.map((w) => w.connectedPointers));
        const rootWorkspace = workspaces.find((w) => w.id === this.props.match.params.workspaceId);
        return (
            <div>
                <BlockHoverMenu>
                    {rootWorkspace &&
                        <Child workspace={rootWorkspace} availablePointers={availablePointers} workspaces={workspaces} />
                    }
                </BlockHoverMenu>
            </div>
        );
    }
}

const options: any = ({ match }) => ({
    variables: { workspaceId: match.params.workspaceId },
});

export const WorkspaceSubtreePage = compose(
    graphql(WORKSPACES_QUERY, { name: "workspaceSubtreeWorkspaces", options }),
)(WorkspaceSubtreePagePresentational);
