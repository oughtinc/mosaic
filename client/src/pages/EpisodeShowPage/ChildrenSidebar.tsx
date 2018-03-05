import * as React from "react";
import { Editor } from 'slate-react';
import { type, Node, Value } from 'slate';

export class Child extends React.Component<any, any> {
    public render() {
        const question = this.props.workspace.blocks.find(b => (b.type === "QUESTION"))
        return(
            <div>
              {question.value &&
                <Editor
                  value={Value.fromJSON(question.value)}
                  onChange={(c) => { console.log(c) }}
                />
              }
            </div>
        )
    }
}
export class ChildrenSidebar extends React.Component<any, any> {
  public render() {
      return (
          <div>
              {this.props.workspaces.map(workspace => (
                  <Child workspace={workspace} key={workspace.id}/>
              ))}
        </div>
      )
  }
}