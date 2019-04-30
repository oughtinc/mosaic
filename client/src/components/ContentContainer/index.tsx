import * as React from "react";

const ContentContainer = ({
  children,
  cyAttributeName,
}: {
  children: any;
  cyAttributeName?: string;
}) => (
  <div
    className="container"
    style={{ marginTop: "10px", padding: "20px" }}
    data-cy={cyAttributeName}
  >
    {children}
  </div>
);

export { ContentContainer };
