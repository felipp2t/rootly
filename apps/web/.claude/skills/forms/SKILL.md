---
name: forms
description: TanStack Form + Zod conventions for the Rootly web app. Covers useForm setup with a Zod validator and revalidateLogic, the form.Field render-prop pattern, and the Field/FieldError/FieldGroup primitives from components/ui/field. Use when building or modifying any form.
---

# Forms

Forms use **TanStack Form** with a **Zod** schema for validation, tied to a generated mutation
hook for submission (see the `data-fetching` skill).

## Setup

```typescript
import { revalidateLogic, useForm } from '@tanstack/react-form'
import z from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
})

const form = useForm({
  validators: { onSubmit: updateProfileSchema },
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'change',
  }),
  defaultValues: {
    name: user?.name ?? '',
  },
  onSubmit: async ({ value }) => {
    // call the mutation, branch on response.status — see the data-fetching skill
  },
})
```

- `validationLogic: revalidateLogic(...)` with `mode: 'submit', modeAfterSubmission: 'change'`
  means the form only validates on submit until the first failed attempt, then switches to
  live validation on every change — avoids nagging the user before they've tried to submit.
- On a successful submit, call `form.reset({ ...newValues })` so the form's dirty state clears
  without refetching.

## Rendering fields

Use `form.Field`'s render-prop `children`, and the `Field`/`FieldError`/`FieldGroup` primitives
from `components/ui/field` for consistent layout/error styling:

```typescript
<form
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  <FieldGroup className='gap-4'>
    <form.Field
      name='name'
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
        return (
          <Field data-invalid={isInvalid}>
            <span className='...'>Name</span>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
            />
            <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
          </Field>
        )
      }}
    />
  </FieldGroup>
</form>
```

- `isInvalid` is derived from `isTouched && !isValid` — don't show an error before the field has
  been touched.
- Bind `id`/`name` to `field.name`, `value` to `field.state.value`, `onBlur` to
  `field.handleBlur`, `onChange` to `field.handleChange(newValue)`.
- Disable the submit control while the associated mutation is pending
  (`mutation.isPending`), not while the form itself is submitting.
