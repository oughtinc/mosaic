import * as React from "react";

const ContentContainer = ({ children }) => (
  <div className="container" style={{ marginTop: "10px", padding: "20px" }}>
    {children}
  </div>
);

export { ContentContainer };
