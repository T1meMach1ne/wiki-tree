class EventEmitter<T> {
  private listeners: Array<(value: T) => void> = [];

  get event(): (listener: (value: T) => void) => { dispose: () => void } {
    return (listener: (value: T) => void) => {
      this.listeners.push(listener);
      return { dispose: () => undefined };
    };
  }

  fire(value: T): void {
    for (const listener of this.listeners) {
      listener(value);
    }
  }
}

class TreeItem {
  label: string;
  collapsibleState: number;
  contextValue?: string;
  tooltip?: string;
  resourceUri?: { fsPath: string };
  iconPath?: unknown;

  constructor(label: string, collapsibleState: number) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

class ThemeIcon {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2
};

const Uri = {
  file: (fsPath: string) => ({ fsPath })
};

const vscode = {
  EventEmitter,
  TreeItem,
  ThemeIcon,
  TreeItemCollapsibleState,
  Uri
};

export = vscode;
