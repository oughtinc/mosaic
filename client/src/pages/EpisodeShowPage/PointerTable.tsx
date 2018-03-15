import React = require("react");
import { compose } from "recompose";
import { connect } from "react-redux";
import styled from "styled-components";
import { exportingPointersSelector } from "../../modules/blocks/exportingPointers";
import { ShowExpandedPointerOutsideSlate } from "../../components/ShowExpandedPointerOutsideSlate";

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
    overflow: scroll;
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
        const { exportingPointers } = this.props;
        return (
            <Container>
                {exportingPointers.map((pointer, index: number) => (
                    <Row key={index}>
                        <Reference>
                            {`$${index + 1} - ${pointer.data.pointerId.slice(0, 5)}`}
                        </Reference>
                        <Text>
                           <ShowExpandedPointerOutsideSlate
                            exportingPointer={pointer}
                            blockId={this.props.blockId}
                           /> 
                        </Text>
                    </Row>

                ))}
            </Container>
        );
    }
}

function mapStateToProps(state: any, { blockId }: any) {
    const exportingPointers = exportingPointersSelector(state);
    return { exportingPointers, blockEditor: state.blockEditor, blockId };
}

export const PointerTable = compose(
    connect(
        mapStateToProps
    )
)(PointerTablePresentational);
