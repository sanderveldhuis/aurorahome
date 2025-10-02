
# Instructions for Logging Issues

## 1. Search for Duplicates

[Search the existing issues in GitHub](https://github.com/sanderveldhuis/aurorahome/search?type=Issues) or by the query `site:github.com/sanderveldhuis/aurorahome <your keywords>` in your favorite search engine before logging a new one. Search engines generally list more relevant and accurate results at the top than the GitHub searching feature.

Some search tips:
 * *Don't* restrict your search to only open issues. An issue with a title similar to yours may have been closed as a duplicate of one with a less-findable title.
 * Check for synonyms. For example, if your bug involves an interface, it likely also occurs with type aliases or classes.
 * Search for the title of the issue you're about to log. This sounds obvious but 80% of the time this is sufficient to find a duplicate when one exists.
 * Read more than the first page of results. Many bugs here use the same words so relevancy sorting is not particularly strong.
 * If you have a crash, search for the first few topmost function names shown in the call stack.

## 2. Did you find a bug?

When logging a bug, please be sure to include the following:
 * What version of AuroraHome you're using
 * If at all possible, an *isolated* way to reproduce the behavior
 * The behavior you expect to see, and the actual behavior

You can try out the [nightly build](https://github.com/sanderveldhuis/aurorahome/tree/next) of AuroraHome to see if the bug has already been fixed.

## 3. Do you have a suggestion?

We also accept suggestions in the issue tracker.

In general, things we find useful when reviewing suggestions are:
* A description of the problem you're trying to solve
* An overview of the suggested solution
* Examples of how the suggestion would work in various places
  * Code examples showing e.g. "this would be an error, this wouldn't"
  * Code examples showing the generated code (if applicable)
* If relevant, precedent in other languages can be useful for establishing context and expected behavior

# Instructions for Contributing Code

## What You'll Need

1. [A bug or feature you want to work on](https://github.com/sanderveldhuis/aurorahome/issues?q=is%3Aissue%20label%3A%22Help%20Wanted%22)!
2. [A GitHub account](https://github.com/join).
3. A copy of the AuroraHome code. See the next steps for instructions.
4. [Node](https://nodejs.org), which runs JavaScript locally. Current or LTS will both work.
5. An editor. [VS Code](https://code.visualstudio.com) is the best place to start for AuroraHome.

## Get Started

1. Install node using the version you downloaded from [nodejs.org](https://nodejs.org).
2. Open a terminal.
3. Make a fork&mdash;your own copy&mdash; of AuroraHome on your GitHub account, then make a clone&mdash;a local copy&mdash;on your computer.
4. Change to the AuroraHome folder you made: `cd aurorahome`
5. Install dependencies: `npm ci`
6. Make sure everything builds and tests pass: `npm test`
7. Open the AuroraHome folder in your editor.
8. Follow the directions below to add a test.

## Helpful tasks

Running `npm run` provides the full listing, but here are a few common tasks you might use.

```
npm run build # Build the project into output.
npm run clean # Delete the built project and/or tests.
npm run test  # Run the tests.
```

## Contributing bug fixes

AuroraHome is currently accepting contributions in the form of bug fixes. A bug must have an issue tracking it in the issue tracker that has been approved (labelled ["help wanted"](https://github.com/sanderveldhuis/aurorahome/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)) by the AuroraHome team. Your pull request should include a link to the bug that you are fixing. If you've submitted a PR for a bug, please post a comment in the bug to avoid duplication of effort.

## Contributing features

Features (things that add new or improved functionality to AuroraHome) may be accepted, but will need to first be approved (labelled ["help wanted"](https://github.com/sanderveldhuis/aurorahome/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)) by a AuroraHome project maintainer in the suggestion issue.

## Issue claiming

If you intend to work on an issue, please avoid leaving comments like "I'm going to work on this". There are a few reasons for this. These comments tend to discourage anyone from working in the area, yet many issues are much more difficult than they first appear, and you might find yourself trying to fix several issues before finding one that can be completed. Many issues have a long trail of people indicating that they're going to try to fix it, but no PR.

Conversely, you do not need to ask anyone's permission before starting work on an issue marked as "help wanted". It's always fine to try!

The sheer quantity of open issues, combined with their general difficulty, makes it extremely unlikely that you and another contributor are a) working on the same issue and b) both going to find a solution.

## Legal

You will need to complete a Contributor License Agreement (CLA). Briefly, this agreement testifies that you are granting us permission to use the submitted change according to the terms of the project's license, and that the work being submitted is under appropriate copyright. Upon submitting a pull request, you will automatically be given instructions on how to sign the CLA.

## Housekeeping

Your pull request should:

* Include a description of what your change intends to do
* Be based on reasonably recent commit in the **main** branch
* Tests should include reasonable permutations of the target fix/change

## Force-pushing

Avoid force-pushing your changes, especially when updating your PR based on review feedback. Force-pushed changes are not easily viewable on GitHub, and not at all viewable if a force-push also rebases against main. AuroraHome PRs are squash merged, so the specific commits on your PR branch do not matter, only the PR title itself. Don't worry about having a perfect commit history; instead focus on making your changes as easy to review and merge as possible.

## Running the Tests

To run all tests, invoke the `test` script using npm:

```Shell
npm test
```

To run only a specific subset of tests, use:

```Shell
npx nyc mocha --grep '<regex>'
```

e.g. to run all version tests:

```Shell
npx nyc mocha --grep 'version.ts'
```

or to run a specific test:

```Shell
npx nyc mocha --grep 'validate the version variable'
```

## Adding a Test

To add a new test case, add a `.spec.ts` file in `tests` with code that shows the bug is now fixed, or your new feature now works.

Generally, filenames are matching the file under test, e.g.: the test file `version.spec.ts` contains tests for the source code in file `version.ts`.
