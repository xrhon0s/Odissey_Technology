import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicStoreSettings } from "@/db/queries/store-settings";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
} from "@/features/legal/legal-documents";

export const metadata: Metadata = { title: "Política de privacidad" };
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getPublicStoreSettings();

  return (
    <LegalDocument
      title="Política de tratamiento de datos personales"
      updatedAt={LEGAL_LAST_UPDATED}
      settings={settings}
    >
      <section>
        <h2>1. Alcance</h2>
        <p>
          Esta política, versión {PRIVACY_POLICY_VERSION}, explica el
          tratamiento de los datos personales recolectados al navegar, contactar
          la tienda o realizar un pedido, conforme a la Ley 1581 de 2012 y sus
          normas reglamentarias.
        </p>
      </section>
      <section>
        <h2>2. Datos tratados</h2>
        <p>
          Para gestionar compras se solicitan nombre, correo, celular, dirección
          de entrega cuando corresponda, notas de entrega y datos asociados al
          pedido. No se solicitan ni almacenan claves bancarias, códigos de
          autenticación ni datos completos de tarjetas.
        </p>
      </section>
      <section>
        <h2>3. Finalidades</h2>
        <ul>
          <li>Cotizar, crear, confirmar, entregar y dar soporte a pedidos.</li>
          <li>Verificar pagos manuales y prevenir errores o fraude.</li>
          <li>Atender garantías, retractos, consultas y reclamos.</li>
          <li>Cumplir obligaciones contables, contractuales y legales.</li>
          <li>Proteger la seguridad y estabilidad de la plataforma.</li>
        </ul>
        <p>
          Los datos no se utilizarán para mercadeo sin una autorización separada
          cuando esta sea necesaria.
        </p>
      </section>
      <section>
        <h2>4. Encargados y circulación</h2>
        <p>
          La información puede ser tratada por proveedores tecnológicos
          necesarios para operar la base de datos, autenticación, alojamiento,
          almacenamiento y comunicaciones, bajo instrucciones del responsable y
          medidas razonables de seguridad. No se comercializan datos personales.
        </p>
      </section>
      <section>
        <h2>5. Derechos del titular</h2>
        <p>
          El titular puede conocer, actualizar y rectificar sus datos; solicitar
          prueba de la autorización; conocer el uso dado a la información;
          solicitar supresión o revocatoria cuando proceda; acceder
          gratuitamente a sus datos y presentar quejas ante la Superintendencia
          de Industria y Comercio después de agotar el trámite correspondiente
          ante la tienda.
        </p>
      </section>
      <section>
        <h2>6. Consultas y reclamos</h2>
        <p>
          Las solicitudes deben identificar al titular, describir la petición e
          incluir un medio de respuesta. Las consultas se atienden en un máximo
          de diez días hábiles y los reclamos completos en un máximo de quince
          días hábiles, sin perjuicio de las ampliaciones permitidas por la ley.
        </p>
      </section>
      <section>
        <h2>7. Vigencia y conservación</h2>
        <p>
          Los datos se conservan durante el tiempo necesario para las
          finalidades informadas y para cumplir obligaciones legales. La
          política rige desde su fecha de actualización y sus cambios
          sustanciales serán informados por un medio adecuado.
        </p>
      </section>
    </LegalDocument>
  );
}
