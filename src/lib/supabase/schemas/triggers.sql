create or replace trigger before_insert_or_update_folder before insert or update of name, container on public.folders for each row execute function public.check_folder_constraints();
create or replace trigger before_insert_organization_trigger before insert on public.organizations for each row when (((new.slug is null) or (new.slug = ''))) execute function public.before_insert_organization();
-- create or replace trigger before_update_updated_at_column before update on public.filesquill for each row execute function storage.update_updated_at_column();
create or replace trigger enviar_email_trigger after insert on public.organization_invitations for each row execute function public.enviar_email();
create or replace trigger prevent_folder_cycle before insert or update on public.folders for each row execute function public.check_folder_cycle();
create or replace trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger update_filesquill_searchable_text before insert or update on public.filesquill for each row execute function public.update_searchable_text();
