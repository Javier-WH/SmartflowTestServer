-- This function's name is too generic, consider renaming it to something more specific.
create or replace function public.enviar_email()
    returns trigger
    language plpgsql security definer
    as $$declare
  org_name varchar;
  org_description text;
begin
  -- obtener datos del grupo de trabajo
  select o.name, o.description into org_name, org_description
  from public.working_group o
  where o.id = new.working_group_id;

  -- enviar email con datos combinados
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := json_build_object(
      'content-type', 'application/json',
      'authorization', 'bearer ' || 're_f1kjrqe5_hexbq5wppaa8h5usdasn1u5s'
    )::jsonb,
    body := json_build_object(
      'from', 'noreply@smartflo.pro',
      'to', new.email,
      'subject', 'Invitación a grupo de trabajo',
      'html', format('
        <div style=background:#f0f0f0; padding:20px;>
          <h1>%s</h1>
          <h5>%s</h5>

          <p>this email has been sent to invite you to join this working_group.</p>
          <p>if you did not request to join the working_group, you can ignore this email.</p>
        
          <a href=https://smartflo.pro/join/%s 
             style=background:#007bff; color:white; padding:10px 20px; text-decoration:none;>
            go to working_group join page
          </a>
        </div>
      ', 
      org_name, 
      org_description, 
      new.id)
    )::jsonb
  );

  return new;
exception
  when others then
    raise warning 'error enviando email: %', sqlerrm;
    return new;
end;
$$;

create or replace function public.generate_random_string(length integer)
    returns text
    language plpgsql
    as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer := 0;
begin
  for i in 1..length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;
