import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function LayoutExceptionsSection() {
  return (
    <DocSection id="layout-exceptions" num="14" title="Layout Exceptions">
      <p className="doc-p">
        The app shell is locked to <code className="doc-inline">--shell-max</code> (430px)
        on every route by <code className="doc-inline">_app.scss</code>'s
        <code className="doc-inline">body &gt; div</code> rule. Some surfaces are
        <em> allowed to opt out</em> — each one a recorded decision, not a leak.
      </p>
      <h3 className="doc-h3">Landing page — full-width marketing</h3>
      <p className="doc-p">
        <code className="doc-inline">/</code> is a marketing page, not an app screen. It
        renders a <code className="doc-inline">.landing-page</code> root and lifts the shell
        constraint only while that class is mounted:
      </p>
      <DocCode lang="scss">
        {`#root:has(.landing-page) {
  max-width: none;
  margin: 0;
}

div.landing-page {
  max-width: none;
  margin: 0;
}`}
      </DocCode>
      <p className="doc-p">
        Two rules are needed: <code className="doc-inline">#root</code> is caught by the
        <code className="doc-inline">body &gt; div</code> rule, while the
        <code className="doc-inline">.landing-page</code> wrapper is caught by
        <code className="doc-inline">div[class*=-page]</code>. The
        <code className="doc-inline">div.landing-page</code> selector has equal specificity
        to the ported rule and wins because <code className="doc-inline">_system.scss</code>
        is imported last. Content stays centered inside a
        <code className="doc-inline">1120px</code> container with the standard
        <code className="doc-inline">--space-5</code> gutter. All other routes keep the
        430px column, and the <code className="doc-inline">:has()</code> trigger restores
        the shell automatically when the landing page unmounts.
      </p>
      <h3 className="doc-h3">Super Admin — pending</h3>
      <p className="doc-p">
        The Super Admin dashboard (tables, full-width) is expected to need the same
        exception when it ships. It is not implemented yet, so no override exists.
      </p>
    </DocSection>
  )
}
