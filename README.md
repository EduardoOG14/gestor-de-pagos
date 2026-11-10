# 📒 Gestor de Pagos - Cuaderno de Control de Deudas

Aplicación Android diseñada para teléfonos móviles para llevar el control interno de deudas y abonos de clientes o conocidos, funcionando como un **cuaderno de registros digital** intuitivo y directo.

> **Ejemplo de uso:** *"Carlos Mecánico, deuda total $360"*

---

## 💡 Filosofía: "Don't Make Me Think" (No me hagas pensar)

La aplicación fue concebida bajo la filosofía de Steve Krug (*Don't Make Me Think*), adaptada para personas con **cero conocimientos de tecnología**:

1. **Sin términos complejos:** Nada de "débito", "crédito" ni "asientos contables". Solo botones claros:
   - 🔴 **"+ Deuda"** (Anotar que la persona debe más).
   - 🟢 **"Abonar"** (Registrar que la persona entregó dinero).
   - ⚡ **"Saldar Deuda Completa"** (Un solo toque para dejar la cuenta en cero cuando pagan todo).
2. **Botones gigantes y táctiles:** Mínimo 48px de altura, textos grandes y colores contrastantes (Verde para dinero a favor/pagos, Rojo/Ámbar para deudas).
3. **Todo a la vista:** En la pantalla principal tienes el total por cobrar en grande, cuántas personas deben y la lista con sus saldos actualizados al instante.
4. **Recordatorio por WhatsApp:** Botón con icono de WhatsApp que genera de inmediato un mensaje cortés con el saldo exacto para enviarlo con 1 solo toque.

---

## 🚀 Características Principales

- 📱 **Modo Claro ☀️ y Modo Oscuro 🌙:** Botón de cambio rápido en la barra superior y selector completo en los Ajustes.
- 🔄 **Actualizaciones Automáticas y Manuales Directas:**
  - **Al abrir la app:** La aplicación comprueba automáticamente con la API de GitHub si existe una versión más reciente.
  - **En Ajustes:** Botón **"Buscar Actualizaciones Ahora"** para verificar manualmente en cualquier momento.
  - **Instalación 100% In-App:** Al presionar *"Actualizar Ahora"*, la app descarga el nuevo APK directamente dentro de la app mostrando una barra de progreso y lanza el instalador nativo de Android sin obligar al usuario a abrir navegadores web ni buscar links en GitHub.
- 💾 **Respaldos de Seguridad:** Exportación e importación de copias de seguridad en formato JSON para no perder ningún dato.
- 100% Funcional sin internet (almacenamiento local persistente).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Móvil:** Capacitor 8 (Android nativo).
- **Actualizador In-App:** Plugin nativo en Java (`AppUpdatePlugin.java`) utilizando `FileProvider` y `REQUEST_INSTALL_PACKAGES`.
- **Automatización CI/CD:** GitHub Actions (`.github/workflows/release.yml`) para compilar y publicar APKs automáticamente en cada release.

---

## 📦 Compilación y Generación del APK

### Requisitos locales
- Node.js 20+
- Java JDK 21
- Android SDK (Plataformas 34 o 35)

### Comandos para compilar:
```bash
# 1. Instalar dependencias
npm install

# 2. Compilar aplicación web y sincronizar con Android
npm run build
npx cap sync android

# 3. Compilar APK Debug
cd android
./gradlew assembleDebug
```

El APK compilado se genera en:
`android/app/build/outputs/apk/debug/app-debug.apk` y una copia lista se encuentra en la raíz del proyecto como `GestorDePagos-v1.0.0.apk`.

---

## 🏷️ Publicación de Nuevas Versiones en GitHub

El proyecto incluye un flujo de trabajo automatizado de GitHub Actions. Para publicar una nueva versión:

1. Modifica la versión en `package.json` y `src/services/updateService.ts` (ej. `1.0.1`).
2. Sube los cambios y crea una etiqueta Git:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. GitHub Actions compilará automáticamente el archivo `.apk` y creará la nueva release en GitHub.
4. Todas las personas que tengan instalada la app recibirán automáticamente la notificación de actualización dentro de la app.
