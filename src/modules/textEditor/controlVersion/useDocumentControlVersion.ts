import supabase from '@/lib/supabase';

export interface DocumentVersionData {
  name: string;
  content: string;
}

export default function useDocumentControlVersion({ documentId: document_id, userName }: { documentId: string, userName: string }) {
  /**
   * Add a new version to the document
   * @param {{name: string, content: string}} data - name and content of the new version
   * @returns {Promise<boolean>} - true if the version was added
   */
  const addVersion = async ({name, content}: DocumentVersionData): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.from('document_version_history')
    .insert({
      document_id,
      name,
      content,
      created_by: userName
    })
    .single();

    if (error){
      console.log(error);
      return false
    }


    // 2. count the number of versions
    const { count, error: countError } = await supabase
      .from('document_version_history')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', document_id);

    if (countError) {
      console.error('Error al contar versiones:', countError);
      // even if there is an error, return true
      return true;
    }
    console.log('Conteo de versiones:', count);
    // 3. if the count is greater than 100, delete the oldest version
    if (count > 100) {
      // 4. delete the oldest version
      const { data: oldestVersion, error: oldestError } = await supabase
        .from('document_version_history')
        .select('id')
        .eq('document_id', document_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (oldestError) {
        console.error('Error al encontrar la versión más antigua:', oldestError);
        return true
      }

      const { error: deleteError } = await supabase
        .from('document_version_history')
        .delete()
        .eq('id', oldestVersion.id);

      if (deleteError) {
        console.error('Error al eliminar la versión antigua:', deleteError);
      }
    }
    return true
  }

  const getVersions = async () => {
    const { data, error } = await supabase
      .from('document_version_history')
      .select('*')
      .eq('document_id', document_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener las versiones:', error);
      return [];
    }

    return data || [];
  };

  return {
    addVersion,
    getVersions
  }
}

