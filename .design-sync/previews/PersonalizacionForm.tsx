import { useEffect, useRef } from "react";
import { PersonalizacionForm } from "papela-ds";

// The form exactly as on /personaliza (cremita-3 card, terracota labels,
// verde submit). Not submitted in the preview.
export const Default = () => (
  <div className="p-6 bg-[var(--color-bg)]" style={{ width: 640 }}>
    <PersonalizacionForm />
  </div>
);

// Success state ("¡Recibimos tu idea!"). Reached without any network call:
// the form's anti-spam honeypot short-circuits to the thank-you state, so the
// preview fills that hidden field and submits locally.
export const Enviado = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const form = ref.current?.querySelector("form");
    const hp = form?.querySelector<HTMLInputElement>('input[name="website"]');
    if (form && hp) {
      hp.value = "preview";
      form.requestSubmit();
    }
  }, []);
  return (
    <div ref={ref} className="p-6 bg-[var(--color-bg)]" style={{ width: 640 }}>
      <PersonalizacionForm />
    </div>
  );
};
