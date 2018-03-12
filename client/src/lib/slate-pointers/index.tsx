function SlatePointers(options: any = {}) {
  return {
    onSelect(event: any, change: any, editor: any) {
      const {value} = editor.props;
      if (value.isBlurred || value.isEmpty) {
        return;
      }

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0) {
        window.setTimeout(
          () => {
            options.onSelectNull();
          }, 10);
        return;
      }

      const _top = `${(rect.top - 44).toFixed(2)}px`;
      const _left = `${(rect.left.toFixed(2))}px`;
      window.setTimeout(
        () => {
          options.onSelect({top: _top, left: _left});
        }, 10
      );
    },
  };
}

export {SlatePointers};