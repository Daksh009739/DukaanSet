# DukaanSet

Project repository: https://github.com/Daksh009739/DukaanSet

Keep DukaanSet source code, documentation, and project assets in this repository.
Commit and push changes to GitHub to save them remotely.

## Branch workflow

- `dev`: active development and new work.
- `staging`: testing changes before release.
- `production`: stable release code.

Promote reviewed changes from `dev` to `staging`, then from `staging` to `production`.
The local workspace uses `dev` for ongoing development.

Keep secrets, local environment files, dependency folders, and generated output out
of Git. Use an `.env.example` file to document required environment variables
without real credentials.
