import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function InstallationSection() {
  return (
    <DocSection id="installation" num="05" title="Installation & Getting Started">
      <h3 className="doc-h3">
        Prerequisites
      </h3>
      <ul className="doc-list">
        <li>
          Node.js 18 or higher
        </li>
        <li>
          npm 9+
        </li>
      </ul>
      <h3 className="doc-h3">
        Install & Run
      </h3>
      <DocCode lang="bash">
        {`npm install --include=dev
npm run dev`}
      </DocCode>
      <div className="doc-info">
        <strong>
          Note:
        </strong>
         The app starts signed out and sign-in is mocked: any phone number or email with a
        six-character password opens the app, and the{' '}
        <code>
          mockUser
        </code>
         object from{' '}
        <code>
          src/data/user.ts
        </code>
         is what the screens render afterwards. To skip the gate when scripting a measurement,
        seed{' '}
        <code>
          persist:sa7tein
        </code>
         with{' '}
        <code>
          auth.isAuthenticated = true
        </code>
         and the matching{' '}
        <code>
          role
        </code>
         &mdash; that is what the browser gate does.
      </div>
      <h3 className="doc-h3">
        Production Build
      </h3>
      <DocCode lang="bash">
        {`npm run build
npm run preview`}
      </DocCode>
      <div className="doc-info">
        <strong>
          PWA tip:
        </strong>
         Always test PWA features (manifest, sw.js, offline) with a production build — service workers don't register in dev mode.
      </div>
    </DocSection>
  )
}
