
export interface SearchBoxInterface  {
  id: string;
  name: string;
  container: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  similarity_score: number,
  type: 1 | 0
}