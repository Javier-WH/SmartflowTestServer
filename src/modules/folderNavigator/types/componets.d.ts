
export interface ContainerElement {
  id: string;
  type: 1 | 0; // 1 folder - 0 file
  name: string;
  container: string | null;
  content?: string;
  published?: boolean;
}

