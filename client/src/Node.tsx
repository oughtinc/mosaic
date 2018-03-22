import * as _ from "lodash";
import * as React from "react";
import {
  Node as NodeT,
  HyperText as HyperTextT,
  HyperTextArray as HyperTextArrayT,
  Link as LinkT,
  LinkKind
} from "./data/types";
import Store, { isLink } from "./store";

interface HyperTextArrayProps {
  value: HyperTextArrayT;
  links: LinkT[];
  store: Store;
}

interface HyperTextLinkProps {
  value: number;
  links: LinkT[];
  store: Store;
}

interface HyperTextProps {
  value: HyperTextT;
  links: LinkT[];
  store: Store;
}

// Is there a better way to write recursive stateless components?

let HyperTextArray: React.SFC<HyperTextArrayProps>,
  HyperTextLink: React.SFC<HyperTextLinkProps>,
  HyperText: React.SFC<HyperTextProps>;

HyperTextArray = props => {
  return (
    <div className="HyperTextArray">
      {props.value.map((x, i) => (
        <HyperText key={i} value={x} links={props.links} store={props.store} />
      ))}
    </div>
  );
};

HyperTextLink = props => {
  const index = props.value;
  const link = props.links[index];
  if (link.expanded) {
    const kind = link.kind === LinkKind.Export ? "export" : "import";
    return (
      <span className="HyperTextLink">
        [#{index}-{kind} <HyperText {...props} value={link.node.content} />]
      </span>
    );
  }
  return <span className="HyperTextLink">#{index}</span>;
};

HyperText = props => {
  const value = props.value;
  if (_.isArray(value)) {
    return <HyperTextArray {...props} value={value} />;
  }
  if (_.isString(value)) {
    return <span>{value}</span>;
  }
  if (isLink(value)) {
    return <HyperTextLink {...props} value={value.link} />;
  }
  return <div>{JSON.stringify(props.value, null, 2)}</div>;
};

interface NodeProps {
  node: NodeT;
  store: Store;
}

const Node: React.SFC<NodeProps> = props => {
  return (
    <HyperText
      value={props.node.content}
      links={props.node.links}
      store={props.store}
    />
  );
};

export default Node;
