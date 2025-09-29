CREATE OR REPLACE FUNCTION clone_organization(original_org_id UUID, new_org_name VARCHAR, new_org_slug VARCHAR)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
    folder_record RECORD;
    file_record RECORD;
    user_record RECORD;
    temp_new_folder_id UUID;  -- Cambié el nombre para evitar ambigüedad
    mapped_folder_id UUID;    -- Variable para el mapeo
    rows_processed INTEGER;
BEGIN
    -- Crear tabla temporal para mapeo de carpetas
    CREATE TEMP TABLE IF NOT EXISTS folder_mapping (
        old_folder_id UUID PRIMARY KEY,
        new_folder_id UUID NOT NULL
    ) ON COMMIT DROP;

    -- 1. Crear nueva organización
    INSERT INTO organizations (name, description, slug, open, user_id)
    SELECT new_org_name, description, new_org_slug, open, user_id
    FROM organizations 
    WHERE id = original_org_id
    RETURNING id INTO new_org_id;

    -- 2. Clonar usuarios de la organización
    INSERT INTO organizations_users (user_id, organization_id, roll_id)
    SELECT user_id, new_org_id, roll_id
    FROM organizations_users 
    WHERE organization_id = original_org_id;

    -- 3. Clonar carpetas usando enfoque recursivo
    -- Primero las carpetas raíz (container IS NULL)
    FOR folder_record IN 
        SELECT * FROM folders 
        WHERE organization_id = original_org_id 
        AND container IS NULL
        ORDER BY created_at
    LOOP
        INSERT INTO folders (name, container, organization_id)
        VALUES (folder_record.name, NULL, new_org_id)
        RETURNING id INTO temp_new_folder_id;
        
        INSERT INTO folder_mapping (old_folder_id, new_folder_id)
        VALUES (folder_record.id, temp_new_folder_id);
    END LOOP;

    -- Luego procesar carpetas anidadas recursivamente
    LOOP
        rows_processed := 0;
        
        -- Insertar carpetas cuyo contenedor ya ha sido mapeado
        FOR folder_record IN 
            SELECT f.* 
            FROM folders f
            WHERE f.organization_id = original_org_id 
            AND f.container IS NOT NULL
            AND f.id NOT IN (SELECT old_folder_id FROM folder_mapping)
            AND f.container IN (SELECT old_folder_id FROM folder_mapping)
        LOOP
            -- Obtener el nuevo ID del contenedor (usando alias para evitar ambigüedad)
            SELECT fm.new_folder_id INTO mapped_folder_id 
            FROM folder_mapping fm
            WHERE fm.old_folder_id = folder_record.container;
            
            INSERT INTO folders (name, container, organization_id)
            VALUES (folder_record.name, mapped_folder_id, new_org_id)
            RETURNING id INTO temp_new_folder_id;
            
            INSERT INTO folder_mapping (old_folder_id, new_folder_id)
            VALUES (folder_record.id, temp_new_folder_id);
            
            rows_processed := rows_processed + 1;
        END LOOP;
        
        -- Salir del bucle cuando no se procesen más filas
        EXIT WHEN rows_processed = 0;
    END LOOP;

    -- 4. Clonar documentos
    FOR file_record IN 
        SELECT f.* 
        FROM filesquill f
        WHERE f.organization_id = original_org_id
    LOOP
        IF file_record.container IS NOT NULL THEN
            SELECT fm.new_folder_id INTO mapped_folder_id
            FROM folder_mapping fm
            WHERE fm.old_folder_id = file_record.container;
        ELSE
            mapped_folder_id := NULL;
        END IF;

        INSERT INTO filesquill (name, container, content, published, organization_id)
        VALUES (
            file_record.name, 
            mapped_folder_id, 
            file_record.content, 
            file_record.published, 
            new_org_id
        );
    END LOOP;

    -- La tabla temporal se eliminará automáticamente al final de la transacción por ON COMMIT DROP
    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


SELECT * FROM public.organizations WHERE name = 'FJORG';

SELECT clone_organization(
    '25a15367-7091-4d2a-a633-c9a5f86fb3b0', --org id
    'FJORG -copia-', -- org name
    'qy2qkb2yp58sl3pwqqyt-copia-' -- org slug
);