import * as React from "react";
import styled from "styled-components";
import { ShowExpandedPointerOutsideSlate } from "../../components/ShowExpandedPointerOutsideSlate";
import * as _ from "lodash";
import { ClosedPointerImport } from "../../lib/slate-pointers/PointerImportNode";

const Container = styled.div`
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
    border-bottom: 1px dashed #ddd;
    padding: .3em .5em;
    overflow: auto;
    max-height: 120px;
`;

const Text = styled.div`
    padding: .15em .3em;
    float: left;
`;

const HiddenPointer = styled.span`
    margin-top: 2px;
    color: #cac8c8;
    float: left;
`;

export const PointerTable = ({ availablePointers, exportingPointerIds }) => (
    <Container> {availablePointers.map((pointer, index: number) => {
        const isFromThisWorkspace = _.includes(exportingPointerIds, pointer.data.pointerId);
        return (
            <Row key={index}>
                <div style={{float: "left", marginRight: "5px"}}>
                    <ClosedPointerImport>
                        {`$${index + 1} - ${pointer.data.pointerId.slice(0, 5)}`}
                    </ClosedPointerImport>
                </div>
                {isFromThisWorkspace ?
                    <Text>
                        <ShowExpandedPointerOutsideSlate
                            availablePointers={availablePointers}
                            exportingPointer={pointer}
                            isHoverable={true}
                        />
                    </Text>
                    :
                    <HiddenPointer>
                        (HIDDEN)
                    </HiddenPointer>
                }
            </Row>

        );
    }
    )}
    </Container>
);