
create extension if not exists pg_net with schema extensions;


create or replace function enviar_email()
returns trigger as $$
declare
  org_name varchar;
  org_description text;
begin
  -- Obtener datos de la organización
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
      'subject', 'Invitación a Organización',
      'html', format('
        <div style="background:#f0f0f0; padding:20px;">
          <h1>%s</h1>
          <h5>%s</h5>

          <p>This email has been sent to invite you to join this organization.</p>
          <p>If you did not request to join the organization, you can ignore this email.</p>
        
          <a href="http://localhost:5173/join/%s" 
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
$$ language plpgsql security definer;


DROP TRIGGER enviar_email_trigger ON public.organization_invitations;
create trigger enviar_email_trigger
after insert on public.organization_invitations
for each row execute procedure enviar_email();