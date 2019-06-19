import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox, OverlayTrigger, Popover } from "react-bootstrap";
import { compose } from "recompose";

export class UserOracleControlsPresentational extends React.Component<
  any,
  any
> {
  public render() {
    const users = this.props.usersQuery.users;
    const tree = this.props.treeQuery.tree;

    const popoverWithProps =
      !users || !tree ? (
        <div />
      ) : (
        <Popover
          id={`experts-popover-${this.props.workspace.id}`}
          style={{ minWidth: "450px" }}
          title="Experts"
        >
          <div>
            {users.map(u => {
              const isOracle = !!tree.oracles.find(o => o.id === u.id);
              const isMalicious =
                tree.oracleRelations.find(r => r.user.id === u.id) &&
                tree.oracleRelations.find(r => r.user.id === u.id).isMalicious;
              return (
                <div
                  key={u.id}
                  style={{
                    backgroundColor:
                      isOracle && (isMalicious ? "#ffeeee" : "#eeffee"),
                    border: isOracle && "1px solid #eee",
                    paddingBottom: u.givenName && u.email ? "15px" : "3px",
                    paddingLeft: "3px",
                    marginBottom: "3px",
                  }}
                >
                  <Checkbox
                    inline={true}
                    checked={isOracle}
                    onChange={e => this.handleOnChange(e, tree.id, u.id)}
                  >
                    {u.givenName ? (
                      <span style={{ position: "relative" }}>
                        {`${u.givenName} ${u.familyName}`}
                        <span
                          style={{
                            bottom: "-15px",
                            left: "0",
                            fontSize: "12px",
                            position: "absolute",
                          }}
                        >
                          {u.email}
                        </span>
                      </span>
                    ) : (
                      u.email || u.id
                    )}{" "}
                  </Checkbox>
                  {isOracle && (
                    <Checkbox
                      inline={true}
                      checked={isMalicious}
                      onChange={() =>
                        this.props.updateMaliciousnessOfOracleMutation({
                          variables: {
                            userId: u.id,
                            treeId: tree.id,
                            isMalicious: !isMalicious,
                          },
                        })
                      }
                    >
                      is malicious
                    </Checkbox>
                  )}
                </div>
              );
            })}
          </div>
        </Popover>
      );

    return (
      <div style={{ marginTop: "10px" }}>
        <OverlayTrigger
          trigger="click"
          placement="right"
          overlay={popoverWithProps}
        >
          <Button bsSize="xsmall" bsStyle="default">
            Edit Experts
          </Button>
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
        },
      });
    } else {
      await this.props.removeOracleFromTreeMutation({
        variables: {
          treeId,
          userId,
        },
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
      oracleRelations {
        isMalicious
        user {
          id
        }
      }
    }
  }
`;

const ADD_ORACLE_TO_TREE_MUTATION = gql`
  mutation addOracleToTreeMutation($treeId: String, $userId: String) {
    addOracleToTree(treeId: $treeId, userId: $userId)
  }
`;

const REMOVE_ORACLE_FROM_TREE_MUTATION = gql`
  mutation removeOracleFromTree($treeId: String, $userId: String) {
    removeOracleFromTree(treeId: $treeId, userId: $userId)
  }
`;

const UPDATE_MALICIOUSNESS_OF_ORACLE = gql`
  mutation updateMaliciousnessOfOracleMutation(
    $treeId: String
    $userId: String
    $isMalicious: Boolean
  ) {
    updateMaliciousnessOfOracle(
      treeId: $treeId
      userId: $userId
      isMalicious: $isMalicious
    )
  }
`;

export const UserOracleControls: any = compose(
  graphql(USERS_QUERY, {
    name: "usersQuery",
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
  graphql(REMOVE_ORACLE_FROM_TREE_MUTATION, {
    name: "removeOracleFromTreeMutation",
    options: {
      refetchQueries: ["tree"],
    },
  }),
  graphql(UPDATE_MALICIOUSNESS_OF_ORACLE, {
    name: "updateMaliciousnessOfOracleMutation",
    options: {
      refetchQueries: ["tree"],
    },
  }),
)(UserOracleControlsPresentational);
