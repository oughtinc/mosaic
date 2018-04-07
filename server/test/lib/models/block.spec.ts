import * as chai from "chai";
const { expect } = chai;

import { getAllInlinesAsArray } from "../../../lib/models/block"

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
    it('should get all inline nodes', () => {
        const inlines = getAllInlinesAsArray(mockTree);
        console.log(JSON.stringify(inlines));
        expect(inlines).to.include(outerInlineNode);
        expect(inlines).to.include(innerInlineNode);
    })
})