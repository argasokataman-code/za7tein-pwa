import { DocCode } from '../DocCode'
import { DocSection } from '../DocSection'

export function BackendSection() {
  return (
    <DocSection id="backend" num="12" title="Connecting a Real Backend">
      <p className="doc-p">
        The app runs fully on mock data. Here's where to swap each piece:
      </p>
      <h3 className="doc-h3">
        Authentication — disable mock user
      </h3>
      <DocCode lang="typescript">
        {`// src/store/slices/authSlice.ts
const initialState: AuthState = {
  user: null,              // was MOCK_USER
  isAuthenticated: false,  // was true
  isLoading: false,
};`}
      </DocCode>
      <h3 className="doc-h3">
        Middleware — JWT verification
      </h3>
      <DocCode lang="typescript">
        {`// middleware.ts — replace cookie check with JWT
import { jwtVerify } from "jose"; // Edge-compatible

const token = request.cookies.get("auth_token")?.value;
if (!token) return redirectToSignIn();

await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));`}
      </DocCode>
      <h3 className="doc-h3">
        Food data — RTK Query
      </h3>
      <DocCode lang="typescript">
        {`// src/store/api/foodApi.ts
export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => "/foods",
    }),
  }),
});`}
      </DocCode>
      <h3 className="doc-h3">
        Order tracking — WebSocket
      </h3>
      <p className="doc-p">
        The tracking pages simulate GPS movement with
        <code className="doc-inline">
          setTimeout
        </code>
        . Replace with a WebSocket or polling endpoint from your delivery backend.
      </p>
    </DocSection>
  )
}
