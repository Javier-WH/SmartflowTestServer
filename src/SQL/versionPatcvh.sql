CREATE OR REPLACE FUNCTION public.is_user_in_organization(
    p_email TEXT,
    p_organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_member BOOLEAN;
BEGIN
    -- Check if a user with the given email exists AND is in the specified organization.
    -- We join with auth.users to get the user ID from the email.
    SELECT EXISTS (
        SELECT 1
        FROM public.organizations_users AS ou
        INNER JOIN auth.users AS au ON ou.user_id = au.id
        WHERE au.email = p_email AND ou.organization_id = p_organization_id
    ) INTO v_is_member;

    RETURN v_is_member;

EXCEPTION
    -- If any other error occurs, return false.
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;



CREATE OR REPLACE FUNCTION create_file_quill(
  p_name varchar(100),
  p_container uuid DEFAULT NULL,
  p_slug TEXT DEFAULT NULL
) 
RETURNS uuid AS $$
DECLARE
  new_id uuid;
  p_organization_id uuid;
BEGIN
  -- obtener el organization_Id usando el slug

    SELECT o.id INTO p_organization_id FROM public.organizations o WHERE o.slug =  p_slug;

  -- Insertar el registro manejando el caso especial para container
  INSERT INTO public.filesquill(name, container, organization_id, content)
  VALUES (
    p_name,
    CASE 
      WHEN p_container IS NULL THEN NULL
      ELSE p_container
    END,
    p_organization_id,
    '<p><br></p><guided-checklist class="guided-checklist-block" title="" items="[{&quot;id&quot;:&quot;fd2390ff-4643-4dd1-9622-9f5061186ea7&quot;,&quot;index&quot;:0,&quot;text&quot;:&quot;&quot;,&quot;guidande&quot;:&quot;&quot;}]" contenteditable="false" readonly="false"></guided-checklist><p><br></p><p><br></p>'
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;