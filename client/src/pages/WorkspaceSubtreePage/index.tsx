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
`;

export class Child extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {isOpen: true, isWorkspaceOpen: false, isAnswerOpen: true, isChildrenOpen: true};
    }
    public render() {
        const { workspace, availablePointers, workspaces } = this.props;
        const question = workspace.blocks.find((b) => b.type === "QUESTION");
        const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
        const answer = workspace.blocks.find((b) => b.type === "ANSWER");
        const children = workspace.childWorkspaceOrder.map((id) => workspaces.find((w) => w.id === id));
        return (
            <Container>
                <LeftBulletArea>
                    <a onClick={(event) => {this.setState({isOpen: !this.state.isOpen}); event.preventDefault(); }} href="#">
                        <FontAwesomeIcon icon={faCircle}/>
                    </a>
                </LeftBulletArea>
                <CardBody>
                    {question.value &&
                        < BlockEditor
                            name={question.id}
                            blockId={question.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(question.value)}
                            shouldAutosave={false}
                            availablePointers={this.props.availablePointers}
                        />
                    }

                    {this.state.isOpen && scratchpad.value &&
                        < BlockEditor
                            name={scratchpad.id}
                            blockId={scratchpad.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(scratchpad.value)}
                            shouldAutosave={false}
                            availablePointers={this.props.availablePointers}
                        />
                    }

                    {this.state.isOpen && answer.value &&
                        < BlockEditor
                            name={answer.id}
                            blockId={answer.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(answer.value)}
                            shouldAutosave={false}
                            availablePointers={this.props.availablePointers}
                        />
                    }

                    <Link to={`/workspaces/${workspace.id}`}>
                        <Button bsSize="xsmall"> Open </Button>
                    </Link>
                </CardBody>
                {!!children.length && this.state.isOpen && 
                    <ChildrenContainer>
                        <ChildrenBullet href="#" onClick={() => this.setState({isChildrenOpen: !this.state.isChildrenOpen})}>
                            <FontAwesomeIcon icon={faLongArrowAltRight}/>
                        </ChildrenBullet>
                        {this.state.isChildrenOpen &&
                            <ChildrenCollection>
                            {children.map((child) => (
                                <Child key={child.id} workspace={child} availablePointers={availablePointers} workspaces={workspaces} />
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

const options: any = ({ match}) => ({
    variables: {workspaceId: match.params.workspaceId },
});

export const WorkspaceSubtreePage = compose(
    graphql(WORKSPACES_QUERY, {name: "workspaceSubtreeWorkspaces", options }),
)(WorkspaceSubtreePagePresentational);
