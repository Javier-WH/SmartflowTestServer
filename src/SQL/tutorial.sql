INSERT INTO public.organizations (id, name, description, slug, open, user_id) VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Tutorial', 'Este grupo de trabajo ofrece ayuda sobre la app', 'tutorial', true, '3e5e79b4-a248-409f-8b07-c2fbd4d11991');


CREATE OR REPLACE FUNCTION spreadTutorial()
RETURNS void AS $$
BEGIN
    -- Inserta nuevos registros en la tabla 'organizations_users'.
    -- La inserción se realiza para cada usuario que aún no pertenece a la organización especificada.
    INSERT INTO public.organizations_users (user_id, organization_id, roll_id)
    SELECT
        u.id,                                     -- El ID del usuario a agregar
        'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- El ID de la organización de destino
        '18244be7-6f88-48ff-8bf3-911f1d712618'  -- El ID del rol que se asignará
    FROM
        auth.users u
    WHERE
        -- La cláusula 'NOT EXISTS' se asegura de que solo seleccionemos usuarios
        -- que no tengan ya un registro en 'organizations_users' para esta organización.
        NOT EXISTS (
            SELECT 1
            FROM public.organizations_users ou
            WHERE ou.user_id = u.id
            AND ou.organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        );
END;
$$ LANGUAGE plpgsql;

SELECT spreadTutorial();

select * from public.organizations_users where organization_id='f47ac10b-58cc-4372-a567-0e02b2c3d479' and user_id = '3e5e79b4-a248-409f-8b07-c2fbd4d11991';

update public.organizations_users set roll_id = '320ef7c2-615e-43e3-a855-7577577ce33d' where organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' and user_id = '3e5e79b4-a248-409f-8b07-c2fbd4d11991';



-- para nuevos usuarios

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Esto permite que la función se ejecute con permisos elevados.
AS $$
BEGIN
  -- Insertar un nuevo registro en la tabla organizations_users.
  -- NEW es una variable especial que contiene el nuevo registro insertado en auth.users.
  INSERT INTO public.organizations_users (user_id, organization_id, roll_id)
  VALUES (
    NEW.id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '18244be7-6f88-48ff-8bf3-911f1d712618'
  );

  RETURN NEW; -- La función debe retornar NEW para triggers AFTER INSERT.
END;
$$;

-- Paso 2: Crear el trigger para la tabla auth.users.
-- Este trigger llama a la función `handle_new_user` cada vez que se inserta un nuevo registro.
-- Se activa "AFTER INSERT" (después de la inserción) para cada "ROW" (fila).
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
