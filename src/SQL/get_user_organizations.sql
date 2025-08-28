-- Function to get organizations where a user is either the creator or a member
CREATE OR REPLACE FUNCTION get_user_organizations(
  p_user_id UUID,
  p_name TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  slug VARCHAR,
  open BOOLEAN,
  created_at TIMESTAMPTZ,
  user_id UUID,
  is_creator BOOLEAN,
  is_member BOOLEAN,
  total_count BIGINT
) LANGUAGE plpgsql AS $$
DECLARE
  v_start INTEGER;
  v_end INTEGER;
  v_total_count BIGINT;
BEGIN
  -- Calculate pagination
  v_start := (p_page - 1) * p_page_size;
  
  -- Get the total count first
  SELECT COUNT(DISTINCT o.id) INTO v_total_count
  FROM organizations o
  LEFT JOIN organizations_users ou ON o.id = ou.organization_id
  WHERE o.open = true
    AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
    AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%');
  
  -- Return the organizations with pagination
  RETURN QUERY
  WITH user_orgs AS (
    SELECT DISTINCT ON (o.id)
      o.id,
      o.name,
      o.description,
      o.slug,
      o.open,
      o.created_at,
      o.user_id,
      (o.user_id = p_user_id) AS is_creator,
      (ou.user_id IS NOT NULL) AS is_member
    FROM organizations o
    LEFT JOIN organizations_users ou ON o.id = ou.organization_id AND ou.user_id = p_user_id
    WHERE o.open = true
      AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
      AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%')
    ORDER BY o.id, o.created_at DESC
  )
  SELECT 
    uo.*,
    v_total_count AS total_count
  FROM user_orgs uo
  ORDER BY uo.created_at DESC
  LIMIT p_page_size
  OFFSET v_start;
END;
$$;



-- new fuction

DROP FUNCTION public.get_user_organizations;
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid, p_name text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 10)
 RETURNS TABLE(
  id uuid, 
  name character varying, 
  description text, 
  slug character varying, 
  open boolean, 
  created_at timestamp with time zone, 
  user_id uuid, 
  is_creator boolean, 
  is_member boolean,
  levelTitle varchar,
  read boolean,
  write boolean,
  delete boolean,
  invite boolean,
  configure boolean,
  total_count bigint
  )
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_start INTEGER;
  v_end INTEGER;
  v_total_count BIGINT;
BEGIN
  -- Calculate pagination
  v_start := (p_page - 1) * p_page_size;
  
  -- Get the total count first
  SELECT COUNT(DISTINCT o.id) INTO v_total_count
  FROM organizations o
  LEFT JOIN organizations_users ou ON o.id = ou.organization_id
  WHERE o.open = true
    AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
    AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%');
  
  -- Return the organizations with pagination
  RETURN QUERY
  WITH user_orgs AS (
    SELECT DISTINCT ON (o.id)
      o.id,
      o.name,
      o.description,
      o.slug,
      o.open,
      o.created_at,
      o.user_id,
      (o.user_id = p_user_id) AS is_creator,
      (ou.user_id IS NOT NULL) AS is_member,
      roll.level,
      roll.read,
      roll.write,
      roll.delete,
      roll.invite,
      roll.configure
    FROM organizations o
    LEFT JOIN organizations_users ou ON o.id = ou.organization_id AND ou.user_id = p_user_id
    LEFT JOIN rolls roll ON roll.id = ou.roll_id
    WHERE o.open = true
      AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
      AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%')
    ORDER BY o.id, o.created_at DESC
  )
  SELECT 
    uo.*,
    v_total_count AS total_count
  FROM user_orgs uo
  ORDER BY uo.created_at DESC
  LIMIT p_page_size
  OFFSET v_start;
END;
$function$
