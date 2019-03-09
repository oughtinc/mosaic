import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox, OverlayTrigger, Popover } from "react-bootstrap";
import { compose } from "recompose";

export class UserOracleControlsPresentational extends React.Component<any, any> {
  public render() {
    const users = this.props.usersQuery.users;
    const tree = this.props.treeQuery.tree;
    const popoverWithProps = (
      !users || !tree
      ?
        <div />
      :
        (
          <Popover
            id={`fallbacks-popover-${this.props.workspace.id}`}
            title="Oracles"
          >
            <div>
              {
                users
                  .map(u => {
                    return (
                      <Checkbox
                        key={u.id}
                        checked={!!tree.oracles.find(o => o.id === u.id)}
                        onChange={(e => this.handleOnChange(e, tree.id, u.id))}
                      >
                        {
                          u.givenName
                          ?
                          `${u.givenName} ${u.familyName}`
                          :
                          (
                            u.email || u.id
                          )
                        }
                      </Checkbox>
                    );
                })
              }
            </div>
          </Popover>
        )
    );

    return (
      <div style={{ marginTop: "10px" }}>
        <OverlayTrigger trigger="click" placement="right" overlay={popoverWithProps}>
          <Button bsSize="xsmall" bsStyle="default">Edit Oracles</Button>
        </OverlayTrigger>
      </div>
    );
  }

  public handleOnChange = async (event, treeId, userId) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      await this.props.addOracleToTreeMutation({
        variables: {
          treeId,
          userId,
        }
      });
    } else {
      await this.props.removeOracleFromTreeMutation({
        variables: {
          treeId,
          userId,
        }
      });
    }
  };
}

const USERS_QUERY = gql`
  query users {
    users {
      id
      givenName
      familyName
      email
    }
  }
`; 

const TREE_QUERY = gql`
  query tree($id: String!) {
    tree(id: $id) {
      id
      oracles {
        id
      }
    }
  }
`; 

const ADD_ORACLE_TO_TREE_MUTATION = gql`
  mutation addOracleToTreeMutation($treeId: String, $userId: String) {
    addOracleToTree(treeId: $treeId, userId: $userId)
  }
`;

const REMOVE_ORALCE_FROM_TREE_MUTATION = gql`
  mutation removeOracleFromTree($treeId: String, $userId: String) {
    removeOracleFromTree(treeId: $treeId, userId: $userId)
  }
`; 

export const UserOracleControls: any = compose(
  graphql(USERS_QUERY, {
    name: "usersQuery"
  }),
  graphql(TREE_QUERY, {
    name: "treeQuery",
    options: (props: any) => ({
      variables: { id: props.workspace.tree.id },
    }),
  }),
  graphql(ADD_ORACLE_TO_TREE_MUTATION, {
    name: "addOracleToTreeMutation",
    options: {
      refetchQueries: ["tree"],
    },
  }),
  graphql(REMOVE_ORALCE_FROM_TREE_MUTATION, {
    name: "removeOracleFromTreeMutation",
    options: {
      refetchQueries: ["tree"],
    },
  })
)(UserOracleControlsPresentational);
