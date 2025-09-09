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