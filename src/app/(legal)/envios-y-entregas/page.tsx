import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import { LEGAL_LAST_UPDATED } from "@/features/legal/legal-documents";

export const metadata: Metadata = {
  alternates: { canonical: "/envios-y-entregas" },
  title: "Envíos y entregas",
};
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalDocument
      title="Política de envíos y entregas"
      updatedAt={LEGAL_LAST_UPDATED}
      settings={settings}
    >
      <section>
        <h2>Cobertura y opciones</h2>
        <p>
          La tienda ofrece envío nacional y alternativas locales cuando estén
          disponibles. Las opciones habilitadas, su costo y si requieren una
          dirección se muestran durante el checkout antes de crear el pedido.
        </p>
      </section>
      <section>
        <h2>Tiempos de entrega</h2>
        <p>
          La estimación de cada método se informa en el checkout. El tiempo se
          cuenta después de confirmar el pedido y puede variar por destino,
          disponibilidad, novedades de la transportadora, fuerza mayor o datos
          incompletos de entrega. Cualquier cambio relevante será comunicado al
          comprador.
        </p>
      </section>
      <section>
        <h2>Responsabilidad del comprador</h2>
        <p>
          El comprador debe suministrar nombre, teléfono y dirección correctos,
          y procurar que una persona autorizada pueda recibir el paquete. Los
          costos causados por una dirección incorrecta o una nueva expedición
          podrán cobrarse cuando sean atribuibles al comprador y hayan sido
          informados previamente.
        </p>
      </section>
      <section>
        <h2>Revisión al recibir</h2>
        <p>
          Si el empaque presenta daño visible o el contenido no corresponde al
          pedido, conserva la evidencia y comunícate con la tienda tan pronto
          como sea posible indicando la referencia. Esto no reduce los derechos
          de garantía reconocidos por la ley.
        </p>
      </section>
    </LegalDocument>
  );
}
