create table if not exists open_source_contributions (
	id serial not null,
	project varchar(255) not null,
	title varchar(255) not null,
	url varchar(500) not null,
	description varchar(500),
	contributed_at date,
	position integer not null default 0,
	created_at timestamp default(now()),
	constraint open_source_contributions_pk primary key(id)
);
