import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { scroller, Element } from "react-scroll";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";

import { MaliciousAnswerAndMaybeSubquestions } from "./MaliciousAnswerAndMaybeSubquestions";
import { MaliciousAnswerIfMaliciousWon } from "./MaliciousAnswerIfMaliciousWon";
import { LazyUnlockGroup } from "./LazyUnlockGroup";

import { NormalWorkspaceGroup } from "./NormalWorkspaceGroup";

import { BlockEditor } from "../../components/BlockEditor";

import { getIsTreeExpandedFromQueryParams } from "../../helpers/getIsTreeExpandedFromQueryParams";

import { getActiveWorkspaceIdFromQueryParams } from "../../helpers/getActiveWorkspaceIdFromQueryParams";

const Checkmark = ({ color }) => (
  <span style={{ color, fontSize: "24px" }}>✓</span>
);

export class CompactTreeGroupPresentationl extends React.PureComponent<
  any,
  any
> {
  public componentDidMount() {
    const activeWorkspaceId = getActiveWorkspaceIdFromQueryParams(
      window.location.search,
    );

    const isThisActiveWorkspace =
      activeWorkspaceId === this.props.workspace.id ||
      (this.props.malicious && activeWorkspaceId === this.props.malicious.id);

    if (isThisActiveWorkspace) {
      setTimeout(() => {
        scroller.scrollTo(this.props.workspace.id, {
          duration: 500,
          smooth: true,
        });
      }, 3000);
    }
  }

  public render() {
    if (this.props.isRequestingLazyUnlock) {
      return (
        <LazyUnlockGroup
          availablePointers={this.props.availablePointers}
          isExpanded={this.props.isExpanded}
          workspace={this.props.workspace}
        />
      );
    }

    if (this.props.isWorkspaceNormal) {
      return (
        <NormalWorkspaceGroup
          availablePointers={this.props.availablePointers}
          isExpanded={this.props.isExpanded}
          oracleBypassAnswerBlockId={this.props.oracleBypassAnswerBlockId}
          oracleBypassAnswerValue={this.props.oracleBypassAnswerValue}
          questionBlockId={this.props.questionBlockId}
          questionValue={this.props.questionValue}
          workspace={this.props.workspace}
        />
      );
    }

    if (!this.props.isExpanded) {
      return (
        <Element name={this.props.workspace.id}>
          <CompactTreeRow>
            <Link
              target="_blank"
              to={`/w/${this.props.workspace.parentId}`}
              style={{ color: "#333", textDecoration: "none" }}
            >
              <CompactTreeRowLabel>Q</CompactTreeRowLabel>
            </Link>
            <CompactTreeRowContent>
              <BlockEditor
                name={this.props.questionBlockId}
                blockId={this.props.questionBlockId}
                readOnly={true}
                initialValue={this.props.questionValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </CompactTreeRowContent>
          </CompactTreeRow>
          {this.props.didHonestWin && (
            <CompactTreeRow>
              <CompactTreeRowLabel color="green">
                <Link
                  style={{ textDecoration: "none" }}
                  target="_blank"
                  to={`/w/${
                    this.props.malicious.childWorkspaces[0]
                      ? this.props.malicious.childWorkspaces[0].id
                      : this.props.malicious.id
                  }`}
                >
                  <Checkmark color="green" />
                </Link>
                <Link
                  style={{
                    color: "green",
                    textDecoration: "none",
                  }}
                  target="_blank"
                  to={`/w/${this.props.workspace.serialId}`}
                >
                  H
                </Link>
              </CompactTreeRowLabel>
              <CompactTreeRowContent>
                <BlockEditor
                  name={this.props.honestAnswerBlockId}
                  blockId={this.props.honestAnswerBlockId}
                  readOnly={true}
                  initialValue={this.props.honestAnswerValue}
                  shouldAutosave={false}
                  availablePointers={this.props.availablePointers}
                />
              </CompactTreeRowContent>
            </CompactTreeRow>
          )}
          {this.props.didMaliciousWin && (
            <MaliciousAnswerIfMaliciousWon
              availablePointers={this.props.availablePointers}
              malicious={this.props.malicious}
              maliciousAnswerBlockId={this.props.maliciousAnswerBlockId}
              maliciousAnswerValue={this.props.maliciousAnswerValue}
              normal={this.props.normal}
              didHonestDecideToConcede={this.props.didHonestDecideToConcede}
            />
          )}
        </Element>
      );
    }

    return (
      <Element name={this.props.workspace.id}>
        <CompactTreeRow>
          <Link
            style={{ color: "#333", textDecoration: "none" }}
            target="_blank"
            to={`/w/${this.props.workspace.parentId}`}
          >
            <CompactTreeRowLabel>Q</CompactTreeRowLabel>
          </Link>
          <CompactTreeRowContent>
            <BlockEditor
              name={this.props.questionBlockId}
              blockId={this.props.questionBlockId}
              readOnly={true}
              initialValue={this.props.questionValue}
              shouldAutosave={false}
              availablePointers={this.props.availablePointers}
            />
          </CompactTreeRowContent>
        </CompactTreeRow>

        <CompactTreeRow>
          <CompactTreeRowLabel color="green">
            {this.props.didHonestWin && (
              <Link
                style={{ textDecoration: "none" }}
                target="_blank"
                to={`/w/${
                  this.props.normal
                    ? this.props.normal.id
                    : this.props.malicious.id
                }`}
              >
                <Checkmark color="green" />
              </Link>
            )}{" "}
            <Link
              style={{ color: "green", textDecoration: "none" }}
              target="_blank"
              to={`/w/${this.props.workspace.serialId}`}
            >
              H
            </Link>
          </CompactTreeRowLabel>
          {this.props.malicious ? (
            <CompactTreeRowContent>
              <BlockEditor
                name={this.props.honestAnswerBlockId}
                blockId={this.props.honestAnswerBlockId}
                readOnly={true}
                initialValue={this.props.honestAnswerValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </CompactTreeRowContent>
          ) : (
            <span style={{ color: "#999" }}>Waiting for response</span>
          )}
        </CompactTreeRow>
        {this.props.malicious && (
          <MaliciousAnswerAndMaybeSubquestions
            availablePointers={this.props.availablePointers}
            didHonestWin={this.props.didHonestWin}
            didMaliciousDeclineToChallenge={
              this.props.didMaliciousDeclineToChallenge
            }
            didMaliciousWin={this.props.didMaliciousWin}
            malicious={this.props.malicious}
            maliciousAnswerBlockId={this.props.maliciousAnswerBlockId}
            maliciousAnswerValue={this.props.maliciousAnswerValue}
            normal={this.props.normal}
            isAwaitingHonestDecision={this.props.isAwaitingHonestDecision}
            didHonestDecideToConcede={this.props.didHonestDecideToConcede}
          />
        )}
      </Element>
    );
  }
}

export class CompactTreeGroupContainer extends React.PureComponent<any, any> {
  public state = {
    isExpanded: getIsTreeExpandedFromQueryParams(window.location.search),
  };

  public render() {
    const activeWorkspaceId = getActiveWorkspaceIdFromQueryParams(
      window.location.search,
    );

    const isThisActiveWorkspace =
      activeWorkspaceId &&
      (activeWorkspaceId ===
        (this.props.workspace && this.props.workspace.id) ||
        (this.props.malicious &&
          activeWorkspaceId === this.props.malicious.id));

    return (
      <div
        style={{
          backgroundColor: "#fbfbfb ",
          border: "1px solid #ddd",
          borderLeft: "2px solid #bbb",
          borderRadius: "3px",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.05)${isThisActiveWorkspace &&
            ", 0 0 0  5px yellow"}`,
          marginTop: "35px",
          minHeight: "35px",
          padding: "10px",
          paddingRight: "40px",
          position: "relative",
        }}
      >
        <Button
          bsSize="xsmall"
          onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
          style={{
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: "17px",
            height: "20px",
            width: "20px",
            right: "5px",
            position: "absolute",
            textAlign: "center",
            top: "5px",
          }}
        >
          {this.state.isExpanded ? "-" : "+"}
        </Button>
        <a
          href={
            this.props.workspace &&
            `/w/${this.props.workspace.serialId}/compactTree`
          }
          style={{
            right: "5px",
            position: "absolute",
            top: "27px",
          }}
        >
          <Button
            bsSize="xsmall"
            style={{
              height: "20px",
              lineHeight: "15px",
              textAlign: "center",
              width: "20px",
            }}
          >
            »
          </Button>
        </a>
        <a
          href={
            this.props.workspace &&
            `${window.location.pathname}?expanded=true&activeWorkspace=${
              this.props.workspace.id
            }`
          }
          style={{
            right: "5px",
            position: "absolute",
            top: "50px",
          }}
        >
          <Button
            bsSize="xsmall"
            style={{
              height: "20px",
              width: "20px",
            }}
          >
            #
          </Button>
        </a>
        {this.props.hasLoaded ? (
          <div
            style={{
              minHeight: "52px",
              opacity: this.props.workspace.isArchived ? 0.2 : 1,
            }}
          >
            <CompactTreeGroupPresentationl
              availablePointers={this.props.availablePointers}
              didHonestWin={this.props.didHonestWin}
              didMaliciousWin={this.props.didMaliciousWin}
              didMaliciousDeclineToChallenge={
                this.props.didMaliciousDeclineToChallenge
              }
              honestAnswerBlockId={this.props.honestAnswerBlockId}
              honestAnswerValue={this.props.honestAnswerValue}
              isExpanded={this.state.isExpanded}
              isRequestingLazyUnlock={this.props.isRequestingLazyUnlock}
              isWorkspaceNormal={this.props.isWorkspaceNormal}
              malicious={this.props.malicious}
              maliciousAnswerBlockId={this.props.maliciousAnswerBlockId}
              maliciousAnswerValue={this.props.maliciousAnswerValue}
              normal={this.props.normal}
              oracleBypassAnswerBlockId={this.props.oracleBypassAnswerBlockId}
              oracleBypassAnswerValue={this.props.oracleBypassAnswerValue}
              questionBlockId={this.props.questionBlockId}
              questionValue={this.props.questionValue}
              workspace={this.props.workspace}
              isAwaitingHonestDecision={this.props.isAwaitingHonestDecision}
              didHonestDecideToConcede={this.props.didHonestDecideToConcede}
              didHonestDecideToPlayOut={this.props.didHonestDecideToPlayOut}
            />
          </div>
        ) : (
          <div style={{ paddingBottom: "37px", paddingLeft: "20px" }}>
            Loading...
          </div>
        )}
      </div>
    );
  }
}

export const CompactTreeGroup = CompactTreeGroupContainer;
