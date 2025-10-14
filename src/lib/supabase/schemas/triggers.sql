CREATE OR REPLACE FUNCTION "public"."enviar_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  org_name varchar;
  org_description text;
begin
  -- Obtener datos de la organizacin
  select o.name, o.description into org_name, org_description
  from public.organizations o
  where o.id = NEW.organization_id;

  -- Enviar email con datos combinados
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 're_8vYJDdWb_2cR8MKuB3MvdbAjwvXgUWUjE'
    )::jsonb,
    body := json_build_object(
      'from', 'notreply@andinotechnologies.com',
      'to', NEW.email,
      'subject', 'Invitacin a Organizacin',
      'html', format('
        <div style="background:#f0f0f0; padding:20px;">
          <h1>%s</h1>
          <h5>%s</h5>


          <p>This email has been sent to invite you to join this organization.</p>
          <p>If you did not request to join the organization, you can ignore this email.</p>
        

          <a href="https://smartflo.vercel.app/join/%s" 
             style="background:#007bff; color:white; padding:10px 20px; text-decoration:none;">
            go to organization join page
          </a>
        </div>
      ', 
      org_name, 
      org_description, 
      NEW.id)
    )::jsonb
  );


  return new;
exception
  when others then
    raise warning 'Error enviando email: %', sqlerrm;
    return new;
end;
$$;

CREATE OR REPLACE TRIGGER "enviar_email_trigger" AFTER INSERT ON "public"."organization_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."enviar_email"();

CREATE OR REPLACE FUNCTION "public"."before_insert_organization"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  random_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Generate a random slug and check if it already exists
  LOOP
    -- Generate a random 20-character string
    random_slug := generate_random_string(20);
    
    -- Check if the slug already exists
    SELECT EXISTS(SELECT 1 FROM organizations WHERE slug = random_slug) INTO slug_exists;
    
    -- Exit the loop if the slug is unique
    EXIT WHEN NOT slug_exists;
  END LOOP;
  
  -- Set the slug value
  NEW.slug := random_slug;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "before_insert_organization_trigger" BEFORE INSERT ON "public"."organizations" FOR EACH ROW WHEN ((("new"."slug" IS NULL) OR (("new"."slug")::"text" = ''::"text"))) EXECUTE FUNCTION "public"."before_insert_organization"();

CREATE OR REPLACE FUNCTION "public"."check_folder_constraints"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  IF NEW.container IS NULL THEN
    PERFORM 1
    FROM public.folders
    WHERE name = NEW.name
    AND organization_id = NEW.organization_id
    AND container IS NULL;
  
    IF FOUND THEN
      RAISE EXCEPTION 'Folder with name "%" already exists with root container', NEW.name;
    END IF;
  END IF;
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER "before_insert_or_update_folder" BEFORE INSERT OR UPDATE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."check_folder_constraints"();

CREATE OR REPLACE FUNCTION "public"."check_folder_cycle"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_container UUID;
BEGIN
    -- Si el contenedor no ha cambiado, no hay necesidad de verificar
    IF TG_OP = 'UPDATE' AND OLD.container IS NOT DISTINCT FROM NEW.container THEN
        RETURN NEW;
    END IF;

    -- Si el nuevo contenedor es NULL (raz), no hay ciclo
    IF NEW.container IS NULL THEN
        RETURN NEW;
    END IF;

    -- Verificar si el nuevo contenedor crea un ciclo
    current_container := NEW.container;

    WHILE current_container IS NOT NULL LOOP
        -- Si encontramos el ID de la carpeta actual en la jerarqua, hay un ciclo
        IF current_container = NEW.id THEN
            RAISE EXCEPTION 'Ciclo detectado: la carpeta no puede estar contenida dentro de s misma o dentro de una carpeta que la contiene.';
        END IF;

        -- Obtener el contenedor del contenedor actual
        SELECT container INTO current_container
        FROM folders
        WHERE id = current_container;
    END LOOP;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER "prevent_folder_cycle" BEFORE INSERT OR UPDATE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."check_folder_cycle"();

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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

  RETURN NEW; -- La funcin debe retornar NEW para triggers AFTER INSERT.
END;
$$;

CREATE OR REPLACE TRIGGER "before_update_updated_at_column" BEFORE UPDATE ON "public"."filesquill" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();
