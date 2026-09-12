import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function StylingSection() {
  return (
    <DocSection id="styling" num="09" title="Styling System">
      <p className="doc-p">
        Sa7tein UI/UX DNA lives in <code className="doc-inline">docs/design/DNA.md</code>.
        New styles belong in <code className="doc-inline">src/styles/_system.scss</code>;
        design values come from <code className="doc-inline">src/styles/_tokens.scss</code>.
        The recovered <code className="doc-inline">_app.scss</code> is legacy and should not grow.
      </p>
      <DocCode lang="scss">
        {`// src/styles/index.scss — order matters
@use "./tokens";
@use "./fonts";
@use "./reboot";
@use "./app";
@use "./modules";
@use "./docs";
@use "./rebrand";
@use "./system"; // final override layer`}
      </DocCode>
      <h3 className="doc-h3">Layout invariants</h3>
      <p className="doc-p">
        The mobile shell is capped at 430px and centered on wide screens. Page gutters are 20px.
        The document owns vertical scrolling; fixed navigation remains inside the shell.
      </p>
      <DocCode lang="scss">
        {`max-width: var(--shell-max);
padding-inline: var(--space-5);
background: var(--surface);
border: 1px solid var(--border-strong);
border-radius: var(--radius-lg);`}
      </DocCode>
      <p className="doc-p">
        Run <code className="doc-inline">npm run governance:check</code>, lint, and build after changes.
        Measure shell width, gutters, horizontal overflow, fixed bars, and nested scrolling at 390px and 1440px.
      </p>
    </DocSection>
  )
}
