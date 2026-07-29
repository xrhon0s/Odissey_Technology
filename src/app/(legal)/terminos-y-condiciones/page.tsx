import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import {
  LEGAL_LAST_UPDATED,
  TERMS_VERSION,
} from "@/features/legal/legal-documents";

export const metadata: Metadata = {
  alternates: { canonical: "/terminos-y-condiciones" },
  title: "Términos y condiciones",
};
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalDocument
      title="Términos y condiciones"
      updatedAt={LEGAL_LAST_UPDATED}
      settings={settings}
    >
      <section>
        <h2>1. Alcance y aceptación</h2>
        <p>
          Estos términos regulan las compras realizadas en la tienda virtual de
          {` ${settings.storeName}`}. Al crear un pedido, el comprador declara
          que revisó la información del producto, el precio, la entrega, la
          forma de pago y estos términos. Versión vigente: {TERMS_VERSION}.
        </p>
      </section>
      <section>
        <h2>2. Productos, precios y disponibilidad</h2>
        <p>
          Los precios se muestran en pesos colombianos (COP). Antes de crear el
          pedido, el servidor vuelve a validar precio, variante, disponibilidad,
          envío y total. Las imágenes son ilustrativas y la descripción de cada
          producto informa sus características, compatibilidad y garantía.
        </p>
      </section>
      <section>
        <h2>3. Formación y confirmación del pedido</h2>
        <p>
          La creación de un pedido pendiente no equivale por sí sola a la
          confirmación del pago. El inventario se reserva temporalmente y el
          pedido se confirma después de verificar el medio de pago seleccionado.
          Si la reserva vence antes de la confirmación, el pedido puede
          cancelarse y las unidades se liberarán.
        </p>
      </section>
      <section>
        <h2>4. Pagos</h2>
        <p>
          Los medios disponibles se informan durante el checkout. Los pagos por
          llave y las transferencias a Nequi o Bancolombia se verifican
          manualmente. El efectivo contraentrega solo se ofrece para entregas
          habilitadas en el Valle de Aburrá. Nunca deben enviarse claves,
          códigos de acceso o información bancaria sensible por los canales de
          atención.
        </p>
      </section>
      <section>
        <h2>5. Entrega, retracto y garantía</h2>
        <p>
          Los tiempos y costos de entrega se presentan antes de confirmar el
          pedido. El retracto, las garantías y las devoluciones se atienden de
          acuerdo con la Ley 1480 de 2011 y las normas que la modifiquen.
          Consulta el detalle en las páginas de envíos y de cambios, garantías y
          retracto.
        </p>
      </section>
      <section>
        <h2>6. Atención de solicitudes</h2>
        <p>
          Las solicitudes relacionadas con una compra deben incluir la
          referencia del pedido y una descripción clara del caso. Utiliza el
          correo o WhatsApp publicado por la tienda para iniciar la atención.
        </p>
      </section>
    </LegalDocument>
  );
}
