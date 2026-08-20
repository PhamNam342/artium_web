# PR Template

## PR Title

`type(scope): short description`

Example: `feat(language-transfer): add header language animation`

## Input

- Task/Ticket:
- Related issue:
- Figma/Design:
- Context:

## Output

<!-- Summarize the final result of this PR. -->

-

## Design

<!-- Add screenshots, screen recordings, or design notes if this PR changes UI/UX. Use N/A if not applicable. -->

-

## Process

<!-- List the main implementation steps. Keep it short and clear. -->

-

## Result

### Before

<!-- Add image/video/link or N/A. -->

-

### After

<!-- Add image/video/link or N/A. -->

-

## Testing

<!-- Describe how this PR was tested. -->

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Regression testing completed
- [ ] No bug affects other features

## PR Checklist

- [ ] CS1: Code is correct, simple, and short.
- [ ] CS2: Security vulnerabilities have been considered and prevented.
- [ ] CS3: Time complexity, space complexity, code complexity, and network bandwidth are optimized.
- [ ] CS4: Unit tests were added with 80%-100% code coverage where applicable.
- [ ] CS5.1: Variables and functions are semantic and easy to understand.
- [ ] CS5.2: Code comments follow [IPO rules](https://www.sesvtutorial.com/setting-up-your-study-environment-and-mentality/#input---process---output-ipo) where useful.
- [ ] CS6: Code is elegant and improves the codebase.
- [ ] Postman collection updated if API changes were made.
- [ ] New environment variables/service keys were added to `.env_example` and GitHub Secrets if needed.
- [ ] Deployed on development server and confirmed working.

## PR Complexity and Response Time

- Time complexity:
- Space complexity:
- DB query:
  - Records scanned:
  - Indexed fields:
- API response time:
  - Local: `___ ms`
  - Development: `___ ms`
  - Staging: `___ ms`

## Deployment Notes

- New environment variables:
- Database migrations:
- Rollback plan:

## After Merge

- [ ] Checked changes on staging server and confirmed working.
- [ ] Monitored logs/errors after deployment.
