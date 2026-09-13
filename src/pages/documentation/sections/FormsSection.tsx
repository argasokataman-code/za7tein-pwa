import { DocSection } from '../DocSection'
import { DocCode } from '../DocCode'

export function FormsSection() {
  return (
    <DocSection id="forms" num="10" title="Form Validation">
      <p className="doc-p">
        All forms use 
        <code className="doc-inline">
          react-hook-form
        </code>
         with 
        <code className="doc-inline">
          @hookform/resolvers/zod
        </code>
        . Schemas are in 
        <code className="doc-inline">
          src/lib/schemas.ts
        </code>
        .
      </p>
      <h3 className="doc-h3">
        Available Schemas
      </h3>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                Schema
              </th>
              <th>
                Fields
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                signInSchema
              </td>
              <td>
                phone, password
              </td>
            </tr>
            <tr>
              <td>
                signUpSchema
              </td>
              <td>
                name, phone, email (opsional), password
              </td>
            </tr>
            <tr>
              <td>
                forgotPasswordSchema
              </td>
              <td>
                phone
              </td>
            </tr>
            <tr>
              <td>
                createPasswordSchema
              </td>
              <td>
                password, confirmPassword (cross-field check)
              </td>
            </tr>
            <tr>
              <td>
                apartmentSchema
              </td>
              <td>
                building, floor, unit, notes?
              </td>
            </tr>
            <tr>
              <td>
                cardSchema
              </td>
              <td>
                cardHolder, cardNumber (16 digits), cvv (3-4 digits), expiry (MM/YY)
              </td>
            </tr>
            <tr>
              <td>
                billingSchema
              </td>
              <td>
                street, city, state, zip
              </td>
            </tr>
             <tr>
              <td>
                personalDataSchema
              </td>
              <td>
                fullName, phone, email (opsional), dob?, gender?
              </td>
            </tr>
            <tr>
              <td>
                merchantSignInSchema
              </td>
              <td>
                email, password (akun merchant, terpisah dari customer)
              </td>
            </tr>
            <tr>
              <td>
                merchantSignUpSchema
              </td>
              <td>
                name, email, phone (opsional), password
              </td>
            </tr>
            <tr>
              <td>
                merchantMenuItemSchema
              </td>
              <td>
                name + price + category + stock (Menu &amp; Stock merchant)
              </td>
            </tr>
            <tr>
              <td>
                merchantStoreSchema
              </td>
              <td>
                name + phone + address (Setelan toko merchant)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 className="doc-h3">
        Usage Pattern
      </h3>
      <DocCode lang="typescript">
        {`import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@/lib/schemas";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<SignInFormData>({
  resolver: zodResolver(signInSchema),
});`}
      </DocCode>
    </DocSection>
  )
}
