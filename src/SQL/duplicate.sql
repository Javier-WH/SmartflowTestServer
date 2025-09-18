CREATE OR REPLACE FUNCTION duplicate_filesquill_record(
    p_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    container_id UUID;
BEGIN
    -- Inserta un nuevo registro con los mismos datos del original,
    -- excepto el id, created_at, y updated_at,
    -- y almacena el container en una variable.
    INSERT INTO public.filesquill (
        id,
        name,
        container,
        content,
        published,
        organization_id
    )
    SELECT
        gen_random_uuid(),
        name,
        container,
        content,
        published,
        organization_id
    FROM
        public.filesquill
    WHERE
        id = p_id
    RETURNING
        container INTO container_id;

    -- Retorna el container del registro duplicado.
    RETURN container_id;
END;
$$ LANGUAGE plpgsql;