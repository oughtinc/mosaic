import React = require("react");
import { compose } from "recompose";
import { connect } from "react-redux";
import styled from "styled-components";
import { ShowExpandedPointer } from "../../lib/slate-pointers/ShowExpandedPointer";
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

export class PointerTable extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
    }

    // TODO: replace this character with new line: ↵
    public render() {
        const { availablePointers } = this.props;
        return (
            <Container>
                {availablePointers.map((pointer, index) => (
                    <Row key={index}>
                        <Reference>
                            {`$${index + 1} - ${pointer.data.pointerId.slice(0, 5)}`}
                        </Reference>
                        <Text>
                           <ShowExpandedPointerOutsideSlate
                            exportingPointer={pointer}
                           /> 
                        </Text>
                    </Row>

                ))}
            </Container>
        );
    }
}