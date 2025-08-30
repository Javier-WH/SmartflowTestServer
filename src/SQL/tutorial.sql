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