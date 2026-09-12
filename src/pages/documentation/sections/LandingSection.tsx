import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function LandingSection() {
  return (
    <DocSection id="landing" num="15" title="Landing Page">
      <p className="doc-p">
        <code className="doc-inline">/</code> is the full-width marketing page. It is the one
        surface allowed to opt out of the 430px app shell (see{' '}
        <em>Layout Exceptions</em>), but it speaks the same visual language as the app: same
        tokens, same components, same radius cap of 12px.
      </p>
      <h3 className="doc-h3">App-first previews</h3>
      <p className="doc-p">
        Product previews are not hand-rolled mockups. The page renders the real app
        components against mock data. <code className="doc-inline">FoodCard</code> from{' '}
        <code className="doc-inline">src/components/ui/FoodCard.tsx</code> appears in the hero
        and experience sections, fed by <code className="doc-inline">foods</code>.{' '}
        <code className="doc-inline">JourneyLine</code> appears in the experience and courier
        previews — the same order-status rail used by{' '}
        <code className="doc-inline">OrderStageScreen</code>. Merchant tickets are built from{' '}
        <code className="doc-inline">merchantOrders</code> and{' '}
        <code className="doc-inline">orderStatusLabel</code>.
      </p>
      <h3 className="doc-h3">Journey Line is shared</h3>
      <p className="doc-p">
        The order-status rail previously lived inside{' '}
        <code className="doc-inline">OrderStageScreen.tsx</code>. It now lives in{' '}
        <code className="doc-inline">src/components/JourneyLine.tsx</code> and is imported by
        both the order screens and the landing page, so status stays one model across
        roles:
      </p>
      <DocCode lang="tsx">
        {`import { JourneyLine } from '../components/JourneyLine'

<JourneyLine stage="diantar" />`}
      </DocCode>
      <h3 className="doc-h3">Structure</h3>
      <p className="doc-p">
        Seven content sections, not thirteen: hero, value strip, journey, experience,
        hyperlocal area, merchant + courier (plan folded in), editorial food, final CTA.
        Decorative motifs stay the registered inline SVG set in{' '}
        <code className="doc-inline">src/components/landing/LandingDecor.tsx</code>; functional
        icons are <code className="doc-inline">lucide-react</code>. Mobile navigation is a
        native <code className="doc-inline">&lt;details&gt;</code> disclosure — no drawer
        dependency.
      </p>
    </DocSection>
  )
}
