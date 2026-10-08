import { Select } from "papela-ds";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block w-[320px]">
    <span className="label text-[var(--color-terracota)] block mb-2">{label}</span>
    {children}
  </label>
);

export const Default = () => (
  <div className="p-6 bg-[var(--color-bg)]">
    <Field label="¿Qué quieres personalizar?">
      <Select defaultValue="">
        <option value="" disabled>Elige una opción</option>
        <option>Stickers</option>
        <option>Toppers para pastel</option>
        <option>Tazas</option>
        <option>Etiquetas escolares</option>
      </Select>
    </Field>
  </div>
);

export const WithValue = () => (
  <div className="p-6 bg-[var(--color-bg)]">
    <Field label="¿Para qué ocasión?">
      <Select defaultValue="Cumpleaños">
        <option>Cumpleaños</option>
        <option>Baby shower</option>
        <option>Graduación</option>
        <option>Boda</option>
      </Select>
    </Field>
  </div>
);

// Two selects side by side in a form row (the /personaliza form layout).
export const FormRow = () => (
  <div className="p-6 bg-[var(--color-cremita-3)] rounded-2xl grid grid-cols-2 gap-4 w-[680px]">
    <label className="block">
      <span className="label text-[var(--color-terracota)] block mb-2">¿Qué quieres personalizar?</span>
      <Select defaultValue="Tazas">
        <option>Stickers</option>
        <option>Tazas</option>
        <option>Etiquetas escolares</option>
      </Select>
    </label>
    <label className="block">
      <span className="label text-[var(--color-terracota)] block mb-2">¿Para qué ocasión?</span>
      <Select defaultValue="">
        <option value="" disabled>Elige una opción</option>
        <option>Cumpleaños</option>
        <option>Día de las Madres</option>
      </Select>
    </label>
  </div>
);
