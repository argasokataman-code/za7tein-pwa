import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function StylingSection() {
  return (
    <DocSection id="styling" num="09" title="Styling System">
      <p className="doc-p">
        Sa7tein UI/UX DNA lives in <code className="doc-inline">docs/design/DNA.md</code>.
        New styles belong in a domain partial under <code className="doc-inline">src/styles/system/</code>;
        design values come from <code className="doc-inline">src/styles/_tokens.scss</code>.
        The recovered port is split into ordered partials under
        <code className="doc-inline">src/styles/app/</code> and must not grow.
      </p>
      <DocCode lang="scss">
        {`// src/styles/index.scss — order matters
@use "./tokens";
@use "./fonts";
@use "./reboot";
@use "./app";      // facade -> ./app/part-01..NN (ported, ordered)
@use "./modules";
@use "./docs";
@use "./rebrand";
@use "./system";   // facade -> ./system/* (final override layer)`}
      </DocCode>
      <h3 className="doc-h3">Partial layout</h3>
      <p className="doc-p">
        Both facades are just <code className="doc-inline">@use</code> lists. Order is
        load-bearing: the imported partials emit in sequence, so the cascade is preserved.
        Add new partials at the end, never reorder.
      </p>
      <DocCode lang="text">
        {`src/styles/
├─ _app.scss        facade -> @use "./app/part-01..17" (ported, ordered)
├─ app/part-01..17  ordered chunks, <=600 lines (frozen port)
├─ _system.scss     facade -> @use "./system/*"
└─ system/          18 files (17 flat partials + _mixins.scss, target <=500)
   _mixins  _buttons  _cards  _forms  _badges  _back  _motion
   _home  _menu  _tracking  _map  _cart  _cart-2
   _merchant  _merchant-2  _app-shell  _landing-refresh  _onboarding`}
      </DocCode>
      <p className="doc-p">
        Shared shape primitives are <code className="doc-inline">@mixin</code>s in
        <code className="doc-inline">system/_mixins.scss</code>, consumed with
        <code className="doc-inline">@include</code>. <code className="doc-inline">@extend</code>
        cannot cross <code className="doc-inline">@use</code> module boundaries, which is why the
        split uses mixins instead of placeholders. Every <code className="doc-inline">.scss</code>
        file is capped at 600 lines and the limit is enforced in the pre-commit hook.
      </p>
      <h3 className="doc-h3">Layout invariants</h3>
      <p className="doc-p">
        The mobile shell is capped at 430px and centered on wide screens. There is
        one mode only: the app is a PWA, so a phone preview and a real phone render
        the same layout. Page gutters are 20px. The document owns vertical
        scrolling; fixed navigation remains inside the shell.
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
