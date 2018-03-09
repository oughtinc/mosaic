import React = require("react");
import { compose } from "recompose";
import { connect } from "react-redux";
import { exportingLeavesSelector } from "../../modules/blocks/ExportSelector";
import styled from "styled-components";

const Container = styled.div`
    border: 1px solid #eee;
    border-radius: 2px;
    background: #f4f4f4;
    border: 1px solid #ddd;
    float: left;
    width: 100%;
`;

const Reference = styled.div`
    color: #4f87df;
    font-weight: 800;
    margin-top: 3px;
    float: left;
    margin-right: 3px;
`;

const Row = styled.div`
    float: left;
    width: 100%;
    border-bottom: 1px solid #ddd;
    padding: .3em .5em;
`;

const Text = styled.div`
    border-radius: 2px;
    padding: .15em .3em;
    float: left;
`;

export class PointerTablePresentational extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
    }

    // TODO: replace this character with new line: ↵
    public render() {
        const { exportingLeaves } = this.props;
        console.log(exportingLeaves);
        return (
            <Container>
                {exportingLeaves.map((leaf, index) => (
                    <Row>
                        <Reference>
                            {`$${index + 1} - ${leaf.pointerId.slice(0, 5)}`}
                        </Reference>
                        <Text>
                            {leaf.text}
                        </Text>
                    </Row>

                ))}
            </Container>
        );
    }
}

const options: any = ({ match }) => ({
    variables: { id: match.params.workspaceId },
});

function mapStateToProps(state: any, { blockId }: any) {
    const exportingLeaves = exportingLeavesSelector(state);
    return { exportingLeaves };
}

export const PointerTable = compose(
    connect(
        mapStateToProps
    )
)(PointerTablePresentational);