-- v0.18.2 hotfix: existing dads got an empty pet collection (the pets update forgot them)
update public.gfd_state set state = state || jsonb_build_object('pets', coalesce(state->'pets', '{}'::jsonb), 'petOut', coalesce(state->'petOut', 'null'::jsonb))
where not (state ? 'pets') or not (state ? 'petOut');
