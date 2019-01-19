import * as React from "react";
import { Checkbox, ToggleButton, ToggleButtonGroup } from "react-bootstrap";

import {
  CONVERT_PASTED_EXPORT_TO_IMPORT,
  CONVERT_PASTED_EXPORT_TO_NEW_EXPORT,
} from "../../constants";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
} from "../../styles";

class AdvancedOptionsPresentational extends React.Component<any, any> {
  public render() {
    
    return (
      <div
        style={{
          backgroundColor: "#eaeaea",
          border: "1px solid #ddd",
          borderRadius: "3px",
          display: "inline-block",
          padding: "8px",
        }}
      >
        <span
          style={{
            color: "#888",
            fontSize: "13px",
          }}
        >
          Advanced Options: Feel free to just leave the defaults!
        </span>
        <br />
        <Checkbox
          style={{
            backgroundColor: adminCheckboxBgColor,
            border: "1px solid gray",
            borderColor: adminCheckboxBorderColor,
            borderRadius: "3px",
            padding: "5px 5px 5px 25px",
          }}
          inline={true}
          type="checkbox"
          checked={this.props.shouldAutoExport}
          onChange={this.props.handleShouldAutoExportToggle}
        >
        auto export
        </Checkbox>
      
        <span 
          style={{
            marginLeft: "10px",
            marginRight: "3px",
            verticalAlign: "middle",
          }}
        >
          Convert pasted export to:
        </span>
        <ToggleButtonGroup 
          type="radio" 
          name="options" 
          value={this.props.pastedExportFormat}
          onChange={this.props.handlePastedExportFormatChange}
        >
          <ToggleButton value={CONVERT_PASTED_EXPORT_TO_IMPORT}>import</ToggleButton>
          <ToggleButton value={CONVERT_PASTED_EXPORT_TO_NEW_EXPORT}>new export</ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
}

const AdvancedOptions: any = AdvancedOptionsPresentational;

export { AdvancedOptions };
