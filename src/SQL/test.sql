CREATE OR REPLACE FUNCTION check_folder_cycle()
RETURNS TRIGGER AS $$
DECLARE
    current_container UUID;
BEGIN
    -- Si el contenedor no ha cambiado, no hay necesidad de verificar
    IF TG_OP = 'UPDATE' AND OLD.container IS NOT DISTINCT FROM NEW.container THEN
        RETURN NEW;
    END IF;

    -- Si el nuevo contenedor es NULL (raíz), no hay ciclo
    IF NEW.container IS NULL THEN
        RETURN NEW;
    END IF;

    -- Verificar si el nuevo contenedor crea un ciclo
    current_container := NEW.container;

    WHILE current_container IS NOT NULL LOOP
        -- Si encontramos el ID de la carpeta actual en la jerarquía, hay un ciclo
        IF current_container = NEW.id THEN
            RAISE EXCEPTION 'Ciclo detectado: la carpeta no puede estar contenida dentro de sí misma o dentro de una carpeta que la contiene.';
        END IF;

        -- Obtener el contenedor del contenedor actual
        SELECT container INTO current_container
        FROM folders
        WHERE id = current_container;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_folder_cycle
BEFORE INSERT OR UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION check_folder_cycle();


DROP TRIGGER prevent_folder_cycle ON folders;

DROP FUNCTION IF EXISTS check_folder_cycle();



CREATE OR REPLACE FUNCTION check_folder_constraints()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.container IS NULL THEN
    PERFORM 1
    FROM public.folders
    WHERE name = NEW.name
    AND container IS NULL;
  
    IF FOUND THEN
      RAISE EXCEPTION 'Folder with name "%" already exists with root container', NEW.name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER before_insert_or_update_folder
BEFORE INSERT OR UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION check_folder_constraints();





DROP FUNCTION IF EXISTS check_folder_constraints();

DROP TRIGGER IF EXISTS before_insert_or_update_folder ON public.folders;