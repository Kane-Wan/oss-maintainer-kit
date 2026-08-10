# Releasing

Only a maintainer with write access may publish a release.

## Release checklist

1. Ensure the working tree is clean and CI and CodeQL pass on `main`.
2. Move completed entries from `Unreleased` into a dated changelog section.
3. Confirm `package.json` and the proposed Git tag use the same semantic version.
4. Run `pnpm release:check` on Node.js 20 or later.
5. Review the package file list and verify that no credentials or local files are included.
6. Create and push an annotated `vX.Y.Z` tag.

The tag workflow repeats the checks, builds a package tarball, and creates a GitHub Release with
generated notes. If the workflow fails, fix the cause and create a new patch version rather than
silently replacing a published release tag.

## npm

The package metadata and `prepublishOnly` check are ready for npm. Publication is intentionally
separate from GitHub Releases because it requires an npm owner and authentication policy. Before
the first publication, enable npm two-factor authentication or trusted publishing, verify the
package name, and run `pnpm publish --access public` only from an approved environment.

## GitHub Marketplace

`action.yml` includes a name, description, author, branding, inputs, outputs, and the compiled
Node.js entrypoint required for a JavaScript Action. Publish only an immutable release after the
release workflow succeeds, then follow GitHub's Marketplace review flow from that release.
