import * as chai from "chai";
const { expect } = chai;

import { getAllInlinesAsArray } from "../../../lib/utils/slateUtils"

const textNode = { object: 'text' };

const innerInlineNode = {
    object: 'inline',
    nodes: [textNode]
}

const outerInlineNode = {
    object: 'inline',
    nodes: [
        textNode,
        innerInlineNode
    ]
}

const mockTree = { 
    object: 'block',
    nodes: [textNode, outerInlineNode]
}

describe('getAllInlinesAsArray', () => {
    const inlines = getAllInlinesAsArray(mockTree);
    it('should get all inline nodes', () => {
        expect(inlines).to.include(outerInlineNode);
        expect(inlines).to.include(innerInlineNode);
    })
    it('should not get any non-inline nodes', () => {
        expect(inlines).to.not.include(mockTree);
        expect(inlines).to.not.include(textNode);
    })
})