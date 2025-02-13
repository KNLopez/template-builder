export type WidgetType =
  | "heading"
  | "text"
  | "image"
  | "video"
  | "button"
  | "divider"
  | "spacer"
  | "map"
  | "icon";

export interface BaseWidget {
  id: string;
  type: WidgetType;
  position?: {
    x: number;
    y: number;
  };
}

export interface ContentWidget extends BaseWidget {
  type: "text" | "image";
  content: any;
}

export interface ColumnWidget extends BaseWidget {
  type: "column";
  width: number; // 1-12 grid system
  children: Widget[];
}

export interface RowWidget extends BaseWidget {
  type: "row";
  children: Widget[];
}

export interface PageWidget extends BaseWidget {
  type: "page";
  children: Widget[];
}

export type Widget = ContentWidget | ColumnWidget | RowWidget | PageWidget;
