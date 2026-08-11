# Releasing

Only a maintainer with write access may publish a release.

## Release checklist

1. Ensure the working tree is clean and CI and CodeQL pass on `main`.
2. Move completed entries from `Unreleased` into a dated changelog section.
3. Confirm `package.json` and the proposed Git tag use the same semantic version.
4. Run `pnpm release:check` on Node.js 20 or later.
5. Review the package file list and verify that no credentials or local files are included.
6. Create and push an annotated `vX.Y.Z` tag.

The tag workflow repeats the checks, builds a package tarball, generates an SPDX JSON SBOM, and
creates a GitHub Release with generated notes. If the workflow fails, fix the cause and create a
new patch version rather than silently replacing a published release tag.

## npm

The package metadata uses the distinct name `repo-steward-ai`; the unrelated package named
`oss-maintainer-kit` is not owned by this project. Publication is intentionally separate from
GitHub Releases because it requires npm ownership and an authentication policy.

Before the first publication, claim and verify `repo-steward-ai`, enable two-factor authentication,
and configure npm trusted publishing for user `Kane-Wan`, repository `oss-maintainer-kit`, workflow
`npm-publish.yml`, and environment `npm`. Then run the manual `Publish npm package` workflow. The
workflow uses Node.js 24, npm 11.5.1 or later, GitHub OIDC, and automatic provenance. Never report
downloads from the unrelated package.

## GitHub Marketplace

`action.yml` includes a name, description, author, branding, inputs, outputs, and the compiled
Node.js entrypoint required for a JavaScript Action. The proposed categories and listing copy are
in `docs/MARKETPLACE.md`. Publish only an immutable release after the release workflow succeeds,
then follow GitHub's Marketplace release flow using two-factor authentication.
