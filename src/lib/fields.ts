// Schema language used by the admin panel to render editors for every piece of content.
// Adding a field here instantly makes it editable in the CMS.

export type Field =
  | {
      name: string;
      label: string;
      type: 'text' | 'textarea' | 'markdown' | 'image' | 'images' | 'color' | 'number' | 'boolean' | 'url' | 'date' | 'tags' | 'model' | 'file' | 'font';
      help?: string;
      placeholder?: string;
      half?: boolean;
      accept?: string;
      fontRole?: 'display' | 'body' | 'mono';
      min?: number;
      max?: number;
      step?: number;
    }
  | { name: string; label: string; type: 'select'; options: { label: string; value: string }[]; help?: string; half?: boolean }
  | { name: string; label: string; type: 'ref'; collection: string; help?: string; half?: boolean }
  | { name: string; label: string; type: 'list'; fields: Field[]; itemLabel?: string; help?: string }
  | { name: string; label: string; type: 'group'; fields: Field[]; help?: string };

export const opt = (...values: string[]) => values.map((v) => ({ label: v.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase()), value: v }));

export const linkFields: Field[] = [
  { name: 'label', label: 'Label', type: 'text', half: true },
  { name: 'href', label: 'Link', type: 'url', half: true },
];

export function defaultsFor(fields: Field[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of fields) {
    switch (f.type) {
      case 'list':
      case 'images':
      case 'tags':
        out[f.name] = [];
        break;
      case 'group':
        out[f.name] = defaultsFor(f.fields);
        break;
      case 'boolean':
        out[f.name] = false;
        break;
      case 'number':
        out[f.name] = 0;
        break;
      case 'select':
        out[f.name] = f.options[0]?.value ?? '';
        break;
      default:
        out[f.name] = '';
    }
  }
  return out;
}
