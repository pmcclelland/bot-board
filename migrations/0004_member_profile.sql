-- Optional profile fields on members. Username/password accounts do not store
-- an email; Better Auth still keeps a synthetic address on "user" only.

alter table members add column if not exists description text not null default '';

update members
set email = ''
where lower(email) like '%@botboard.internal';
