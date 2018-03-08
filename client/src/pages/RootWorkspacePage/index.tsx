import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import React = require("react");
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import Plain from "slate-plain-serializer";
import { Form } from "react-final-form";
import { Value } from "slate";

const WorkspaceStyle = styled.div`
  border: 1px solid #ddd;
  padding: 3px;
  margin-bottom: 3px;
`;

const WORKSPACES_QUERY = gql`
    query OriginWorkspaces{
        workspaces(where:{parentId:null}){
          id
          parentId
          childWorkspaceOrder
          blocks{
              id
              value
              type
          }
        }
    }
 `;

const CREATE_ROOT_WORKSPACE = gql`
  mutation createWorkspace($question:JSON){
    createWorkspace(question:$question ){
        id
        parentId
        childWorkspaceOrder
        blocks{
            id
            value
            type
        }
    }
  }
`;

const ParentWorkspace = ({workspace}) => {
    const question = workspace.blocks && workspace.blocks.find((b) => b.type === "QUESTION");
    return (
    <WorkspaceStyle>
        {/* {question && question.value &&
             <Block
                 isInField={false}
                 value={Value.fromJSON(question.value)}
             />
        } */}
        <Link to={`/workspaces/${workspace.id}`}>
            <Button> Open </Button>
        </Link>
    </WorkspaceStyle>
    );
};

class NewWorkspaceForm extends React.Component<any, any> {
    public render() {
        const onSubmit = async (values) => {
            this.props.onCreateWorkspace(JSON.stringify(values.new.toJSON()));
        };
        return (
            <div>
                <h3> New Root Workspace </h3>
            <Form
                onSubmit={onSubmit}
                initialValues={{ new: Plain.deserialize("") }}
                render={({ handleSubmit, reset, submitting, pristine, values }) => (
                    <div>

                        <form onSubmit={handleSubmit}>
                            {/* <Block
                                name={"new"}
                            /> */}
                            <div className="buttons">
                                <button type="submit" disabled={submitting || pristine}>
                                    Submit
                            </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={submitting || pristine}>
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />
            </div>
        );
    }
}

export class RootWorkspacePagePresentational extends React.Component<any, any> {
    public render() {
        console.log(this.props);
        const workspaces = this.props.originWorkspaces.workspaces;
        return (
            <div>
                <h1> Root Workspaces </h1>
                {workspaces && workspaces.map((w) => (
                    <ParentWorkspace workspace={w} key={w.id}/>
                ))}
                <NewWorkspaceForm
                    onCreateWorkspace={(question) => {this.props.createWorkspace({variables: {question}}); }}
                />
            </div>
        );
    }
}

export const RootWorkspacePage = compose(
    graphql(WORKSPACES_QUERY, {name: "originWorkspaces" }),
    graphql(CREATE_ROOT_WORKSPACE, {name: "createWorkspace", options: {
            refetchQueries:  [
                "OriginWorkspaces",
            ],
    }}),
 )(RootWorkspacePagePresentational);