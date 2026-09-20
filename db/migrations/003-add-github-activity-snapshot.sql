create table if not exists github_activity_snapshot (
	id integer not null default 1,
	payload jsonb not null,
	fetched_at timestamp not null default now(),
	constraint github_activity_snapshot_pk primary key (id),
	constraint github_activity_snapshot_singleton check (id = 1)
);
