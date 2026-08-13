alter table users
  add column if not exists role varchar(20) not null default 'viewer';
