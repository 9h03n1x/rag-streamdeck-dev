# Publishing Stream Deck Profiles

Stream Deck profiles are shareable `.streamDeckProfile` files that package a configured layout of keys, actions, icons, folders, and settings. Unlike plugins, profiles do not add executable capabilities; they curate existing actions into a useful workflow.

## What A Profile Can And Cannot Do

A profile can:

- Provide a polished workflow for a specific app, role, game, or process.
- Arrange native and plugin-provided actions into a ready-to-use layout.
- Include custom icons and multiple pages or folders.
- Be distributed through the Elgato Marketplace.

A profile cannot:

- Bundle required plugins automatically.
- Guarantee local file paths, sound paths, or app-specific shortcuts exist on the user's machine.
- Adapt perfectly across every Stream Deck hardware layout unless you create device-specific versions.

## Product Planning

Before exporting a profile, define:

1. Target user and workflow.
2. Supported Stream Deck devices.
3. Required third-party plugins.
4. Required target application versions.
5. Operating system assumptions.
6. Support contact and documentation link.

Profiles are workflow products. Their value comes from thoughtful layout, reliable dependencies, clear labels, and a smooth first-use experience.

## Device Strategy

Create separate profile files when layouts differ significantly:

- Stream Deck Mini: 6 keys
- Stream Deck MK.2 / Classic: 15 keys
- Stream Deck XL: 32 keys
- Stream Deck Neo: 8 keys plus info panel behavior
- Stream Deck +: keys plus dial/touchstrip workflows

Use clear file names such as `ProductName-XL.streamDeckProfile` and `ProductName-MK2.streamDeckProfile`.

## Dependency Strategy

Profiles that depend on missing plugins show broken or unknown actions for users. Reduce support friction by:

1. Prefer native Stream Deck actions when possible.
2. Use well-maintained official or trusted plugins.
3. List every dependency in the product description.
4. Link directly to required plugins.
5. Include setup steps inside a README or product page.

## Export Checklist

1. Build and test the profile in Stream Deck software 6.0 or later.
2. Verify every key on every supported device variant.
3. Replace local-only file paths with user-friendly setup instructions.
4. Confirm icons render clearly on the target hardware.
5. Export from the Stream Deck profile manager.
6. Package multiple profile variants in a ZIP if needed.

## Marketplace Submission

Profile submission is typically more manual than plugin submission. Prepare a complete submission package before contacting Elgato:

- Maker name or organization
- Product title
- Detailed description and dependency list
- `.streamDeckProfile` file or ZIP archive
- Price, if paid
- Gallery images and optional video preview
- Release notes
- Support email or support URL
- Country of residence if required for marketplace processing

Use the current Elgato Maker documentation for the official submission destination and requirements, because Marketplace workflows may change.

## Review Risks

Common reasons for rejection or delayed review include:

- Placeholder content or unfinished actions
- Broken dependencies
- Inaccurate device compatibility claims
- Unlicensed icons, sounds, or brand assets
- Poor performance caused by dependent actions
- Misleading descriptions or support information
- Product too similar to existing marketplace content

## Ongoing Maintenance

Publishing a profile creates a support obligation. Plan to:

1. Update profiles when target apps change shortcuts or UI behavior.
2. Refresh device-specific variants when new Stream Deck hardware appears.
3. Keep dependencies current.
4. Maintain release notes.
5. Respond to user support requests.

## Related Documentation

- [Marketplace Submission Guide](marketplace/submission-guide.md)
- [Marketplace Approval Checklist](marketplace/approval-checklist.md)
- [Device-Specific Development](advanced-topics/device-specific-development.md)
- [Versioning and Migrations](advanced-topics/versioning-and-migrations.md)
