# Blog Application

A full-stack blog platform featuring a public reader interface and an admin dashboard for content management. This project is part of my full-stack learning journey; it was built before I learned Prisma, so I wrote plain SQL queries, which made me appreciate Prisma and ORMs in general. I also integrated TinyMCE, a rich text editor with many features.

## Provision the admin and read-only demo

Never run `db/sql-schema/Initial` against an existing database; it drops tables. For an existing deployment, apply only the additive migration:

```sh
psql "${DATABASE_URL_DIRECT:-$DATABASE_URL}" -v ON_ERROR_STOP=1 -f db/migrations/001-add-user-role.sql
```

Then enter the account settings as environment variables. Password input is hidden and is not passed as a command argument:

```sh
printf "Admin email: " && read -r ADMIN_EMAIL
printf "Admin password: " && read -rs ADMIN_PASSWORD && printf '\n'
printf "Demo email: " && read -r DEMO_EMAIL
printf "Demo password: " && read -rs DEMO_PASSWORD && printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD DEMO_EMAIL DEMO_PASSWORD
npm run provision:accounts
unset ADMIN_EMAIL ADMIN_PASSWORD DEMO_PASSWORD
```

The command is safe to rerun. It finds accounts by email, preserves their IDs and article authorship, and updates their password hashes and roles. Rerun it with a new `ADMIN_PASSWORD` whenever the owner's password should change. It also keeps two demo drafts available and reports any user rows whose email does not match the configured admin or demo account.

Keep `DEMO_EMAIL` in the deployed application's runtime environment so the one-click demo button can find the viewer account. The password variables are needed only while provisioning and should be removed from the shell afterward.

## Configure GitHub activity

The About page gets authored-commit figures from the server-side `/api/github-activity` route. Set `GITHUB_TOKEN` in the application's runtime environment to a GitHub token that can read the seven public repositories listed on the page. The token is used only by the backend and must never be exposed through a `VITE_` variable or committed to the repository.

Successful GitHub responses are cached in memory for six hours. If GitHub cannot be reached before the cache has been populated, the endpoint reports temporary unavailability and the About page simply omits the activity sentence.

## Tech Stack

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

![Project Demo](./preview/app.gif)
