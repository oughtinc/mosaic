import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import * as _ from "lodash";

const NUMBER_REGEX = /[0-9]/;

export interface ImportPatternLocation {
  startKey: string;
  startOffset: number;
  pointerNum: number;
  length: number;
}

function inlinePointerImportJSON(pointerId: string) {
  return Inline.fromJSON({
    object: "inline",
    type: "pointerImport",
    isVoid: true,
    data: {
      pointerId: pointerId,
      internalReferenceId: uuidv1()
    }
  });
}

function getImportPatternLocationsInTextNode(node: any): ImportPatternLocation[] {
  const locations: ImportPatternLocation[] = [];
  let inMatch = false;
  let matchStart = -1;
  let matchChars = "";
  const text = node.text;
  for (let ii = 0; ii < text.length; ii++) {
    if (inMatch) {
      const charIsNumber = !!text[ii].match(NUMBER_REGEX);

      if (charIsNumber) {
        matchChars = matchChars.concat(text[ii]);
      }
      if ((!charIsNumber || ii === text.length - 1) && (matchChars.length > 0))  {
        locations.push({
          startKey: node.key,
          startOffset: matchStart,
          pointerNum: Number(matchChars),
          length: matchChars.length + 1
        });
        inMatch = false;
      }
    }
    if (text[ii] === "$") {
      inMatch = true;
      matchStart = ii;
      matchChars = "";
    }
  }

  return locations;
}

function getImportPatternLocationsInArrayOfTextNodes(textNodes: any[]): ImportPatternLocation[] {
  // We only find import patterns contained within a single text node.
  const locationsPerNode = _.map(textNodes, node => getImportPatternLocationsInTextNode(node));
  return _.flatten(locationsPerNode);
}

// Checks whether current input focus is at the very end of the import pattern location.
function isActiveImportPatternLocation(location: ImportPatternLocation, value: any) {
  return (
    value.focusKey === location.startKey &&
    value.focusOffset === (location.startOffset + location.length)
  );
}

  // Attempts to convert text at the given location (e.g. "$3") to a corresponding inline import node.
function convertImportPatternLocationInSlateValue(location: ImportPatternLocation, initialValue: any, availablePointers: any[]) {
  const pointer = availablePointers[location.pointerNum - 1];

  if (!!pointer) {
    const { value } = initialValue.change()
      .select({
        anchorKey: location.startKey,
        anchorOffset: location.startOffset,
        focusKey: location.startKey,
        focusOffset: location.startOffset,
      })
      .deleteForward(location.length)
      .insertInline(inlinePointerImportJSON(pointer.data.pointerId))
      .collapseToStartOfNextText()
      .focus();

    return value;
  }

  return undefined;
}

export function applyKeydownImportConversionInSlateValue(event: any, originalValue: any, availablePointers: any[]) {
    // Attempts import conversions in the focused node only.
  let locations: ImportPatternLocation[] = getImportPatternLocationsInArrayOfTextNodes([originalValue.focusText]);
  const isNumberKey = !!event.key.match(NUMBER_REGEX);

  if (isNumberKey) {
    // Do not attempt to complete the focused location (if any), since we could still be adding to it.
    locations = _.filter(locations, loc => !isActiveImportPatternLocation(loc, originalValue));
  }

  let updatedValue = undefined;
  for (let ii = 0; ii < locations.length; ii++) {
    updatedValue = convertImportPatternLocationInSlateValue(locations[ii], originalValue, availablePointers);
    if (updatedValue) {
      break;
    }
  }

  // Both Enter and arrows appear to have default behavior inside Slate interfering with the conversion.
  if (updatedValue && (event.key === "Enter" || event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    return {
      shouldPreventDefault: true,
      updatedValue: updatedValue
    };
  }

  return {
    shouldPreventDefault: false,
    updatedValue: updatedValue
  };
}

// Attempts import conversions on the whole block.
export function applyGlobalImportConversionInSlateValue(originalValue: any, availablePointers: any[]) {
  const textNodesArray = originalValue.document.getTexts().toArray();
  const locations: ImportPatternLocation[] = getImportPatternLocationsInArrayOfTextNodes(textNodesArray);
  for (let ii = 0; ii < locations.length; ii++) {
    const updatedValue = convertImportPatternLocationInSlateValue(locations[ii], originalValue, availablePointers);
    if (updatedValue) {
       const recurseValue = applyGlobalImportConversionInSlateValue(updatedValue, availablePointers);
       if (recurseValue) {
         return recurseValue;
       } else {
         return updatedValue;
       }
    }
  }
  return undefined;
}