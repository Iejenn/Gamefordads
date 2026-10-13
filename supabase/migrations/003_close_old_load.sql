-- v0.16.1: old (v0.15) phones kept reloading a frozen save through gfd_load. The current game never uses it.
revoke execute on function public.gfd_load(text) from anon, authenticated;
