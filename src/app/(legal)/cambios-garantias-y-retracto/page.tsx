import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { LEGAL_LAST_UPDATED } from "@/features/legal/legal-documents";

export const metadata: Metadata = {
  alternates: { canonical: "/cambios-garantias-y-retracto" },
  title: "Cambios, garantías y retracto",
};
export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalDocument
      title="Cambios, garantías y derecho de retracto"
      updatedAt={LEGAL_LAST_UPDATED}
      settings={settings}
    >
      <section>
        <h2>Derecho de retracto</h2>
        <p>
          Cuando resulte aplicable a una venta a distancia, el consumidor puede
          ejercer el retracto dentro de los cinco días hábiles siguientes a la
          entrega. El producto debe devolverse por los mismos medios y en las
          mismas condiciones en que fue recibido; los costos de transporte de la
          devolución corresponden al consumidor. La devolución del dinero se
          realizará dentro del plazo legal máximo.
        </p>
        <p>
          No aplica en los casos exceptuados por la ley, incluidos bienes
          personalizados, perecederos, de uso personal o que por su naturaleza
          no puedan devolverse, entre otros supuestos legales.
        </p>
      </section>
      <section>
        <h2>Garantía legal</h2>
        <p>
          La garantía cubre defectos de calidad, idoneidad o seguridad dentro
          del término aplicable. Como regla general se realizará primero la
          reparación gratuita cuando sea procedente. Si el bien no admite
          reparación, o ante una falla repetida en los términos legales, podrán
          proceder el cambio o la devolución del dinero.
        </p>
        <p>
          El término informado en la ficha del producto se interpreta sin
          limitar los derechos mínimos reconocidos por la normativa colombiana.
        </p>
      </section>
      <section>
        <h2>Cómo presentar una solicitud</h2>
        <ul>
          <li>Indica la referencia del pedido y el producto afectado.</li>
          <li>Describe el defecto o el motivo de la solicitud.</li>
          <li>Adjunta fotografías o videos cuando ayuden a evaluar el caso.</li>
          <li>
            No envíes el producto sin recibir instrucciones de devolución.
          </li>
        </ul>
      </section>
    </LegalDocument>
  );
}
