# Guía de QA para X Writer v0.0.2

## Objetivo
Validar las funcionalidades nuevas de la extensión antes de subir una nueva versión.

Esta guía cubre especialmente:
- Smart Threads
- Code to Image
- Signature configurable
- Quick Actions en Activity Bar
- Traducciones nuevas
- Configuración nueva en Settings

---

## Alcance de QA

### Funcionalidades nuevas a validar
1. Publicación de hilos automáticos
2. Publicación de código como imagen
3. Firma opcional en tweets
4. Nuevas acciones en la barra lateral
5. Nuevos textos de i18n en inglés/español
6. Compatibilidad de settings nuevos

### Riesgos principales
- Que un texto largo no se divida correctamente
- Que el conteo/límite diario no contemple hilos
- Que la firma rompa el límite de 280
- Que la imagen no se genere o no se suba
- Que falte un comando en la vista lateral
- Que haya textos sin traducir o mezclados

---

## Pre-requisitos

### Entorno
- VS Code instalado
- `pnpm install`
- Dependencias compilando bien
- Archivo `.vsix` generado o ejecución en modo debug

### Verificación local previa
Ejecutar:

```powershell
pnpm test
```

Esperado:
- lint OK
- compile OK
- sin errores en consola

---

## Formas recomendadas de prueba

### Opción 1: Debug
```powershell
code .
```
Luego presionar `F5`.

### Opción 2: VSIX local
```powershell
pnpm run package
pnpm run install-local
```
Luego recargar VS Code.

---

## Datos de prueba sugeridos

### Tweet corto
```text
Hola X desde VS Code
```

### Tweet largo para thread
```text
Este es un texto de prueba muy largo diseñado para superar el límite de 280 caracteres y validar que la extensión divida correctamente el contenido en varios tweets sin cortar palabras de forma agresiva, agregando el sufijo 1/X, 2/X y manteniendo una experiencia correcta para el usuario final.
```

### Código para imagen
```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('X Writer'));
```

### Firma personalizada
```text
🔥 Built with X Writer by Jawuil
```

---

## Checklist maestro de QA

- [ ] La extensión carga en modo debug
- [ ] El icono aparece en Activity Bar
- [ ] La vista Quick Actions abre correctamente
- [ ] Aparecen todas las acciones nuevas
- [ ] Se puede publicar tweet normal
- [ ] Se puede publicar thread automático
- [ ] Se puede publicar código como imagen
- [ ] La firma configurable funciona
- [ ] El límite diario sigue funcionando
- [ ] La ayuda muestra contenido actualizado
- [ ] El cambio de idioma funciona
- [ ] No hay errores visibles en consola

---

## Casos de prueba detallados

## 1. Smoke test general

### Caso 1.1 - La extensión inicia
**Pasos**
1. Abrir el proyecto
2. Ejecutar con `F5`
3. Esperar que abra `Extension Development Host`

**Esperado**
- La extensión se activa sin errores
- No hay crash al iniciar
- El icono de X Writer aparece en la barra lateral

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 2. Activity Bar / Quick Actions

### Caso 2.1 - Icono visible
**Pasos**
1. Abrir la ventana de extensión
2. Mirar la barra lateral izquierda

**Esperado**
- Se ve el icono de X Writer
- Al hacer clic abre la vista de la extensión

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 2.2 - Acciones visibles
**Pasos**
1. Abrir la vista de X Writer
2. Revisar la lista de acciones

**Esperado**
Deben existir estas opciones:
- `Post Tweet`
- `Post Code Image`
- `Setup Credentials`
- `Delete Credentials`
- `Donate / Support`
- `Help & About`

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 2.3 - Cada acción ejecuta su comando
**Pasos**
1. Hacer clic en cada item de la vista

**Esperado**
- Cada item dispara su acción correspondiente
- No hay items muertos o sin respuesta

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 3. Smart Threads

### Caso 3.1 - Texto corto no crea hilo
**Pasos**
1. Ejecutar `X Writer: Post Tweet`
2. Ingresar un tweet corto
3. Publicar

**Esperado**
- Se publica un solo tweet
- No aparece flujo de thread

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 3.2 - Texto largo crea hilo automático
**Pasos**
1. Ejecutar `X Writer: Post Tweet`
2. Pegar el texto largo de prueba
3. Confirmar publicación

**Esperado**
- El texto se divide en varios tweets
- Cada tweet termina numerado tipo `1/X`, `2/X`
- No corta palabras bruscamente si hay espacios disponibles
- Muestra progreso de publicación por parte

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 3.3 - Auto Thread desactivado
**Pasos**
1. Ir a Settings
2. Desactivar `X Writer > Auto Thread: Enabled`
3. Intentar publicar un texto > 280

**Esperado**
- No crea hilo
- Debe mostrar validación de longitud excesiva
- No deja publicar si excede 280

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 3.4 - Hilo con límite diario insuficiente
**Pasos**
1. Simular o acercarse al límite diario
2. Intentar publicar un texto que requiera varios tweets

**Esperado**
- La extensión bloquea la acción si no hay suficientes tweets restantes
- Muestra mensaje claro indicando cuántos necesita y cuántos quedan

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 3.5 - Hilo conserva URL inicial usable
**Pasos**
1. Publicar un hilo
2. Hacer clic en `View Thread on X`

**Esperado**
- Abre el primer tweet del hilo o una URL válida del hilo

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 4. Code to Image

### Caso 4.1 - Sin selección
**Pasos**
1. Abrir un archivo
2. No seleccionar código
3. Ejecutar `X Writer: Post Code Image`

**Esperado**
- Muestra advertencia indicando que falta selección
- No intenta publicar

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.2 - Selección válida genera imagen
**Pasos**
1. Seleccionar el código de prueba
2. Ejecutar `X Writer: Post Code Image`

**Esperado**
- Muestra progreso de generación
- Genera imagen sin errores
- Continúa al flujo de publicación

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.3 - Preview panel muestra la imagen generada ✨ NUEVO v0.0.3
**Pasos**
1. Seleccionar código
2. Ejecutar `Post Code Image`
3. Esperar que se genere la imagen

**Esperado**
- Se abre un panel de preview con la imagen del código
- La imagen se ve clara y completa
- El panel tiene header con el lenguaje detectado
- Se ve un campo de texto para mensaje opcional
- Muestra vista previa de la firma
- Se ven botones "Publish" y "Cancel"

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.4 - Preview: confirmar publicación con mensaje
**Pasos**
1. Seleccionar código → se abre preview
2. Escribir un mensaje en el campo de texto
3. Verificar el contador de caracteres
4. Clic en "Publish" (o Ctrl+Enter)

**Esperado**
- Se publica el tweet con imagen + mensaje
- Muestra confirmación de éxito
- El botón "View on X" funciona

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.5 - Preview: publicar sin mensaje
**Pasos**
1. Seleccionar código → se abre preview
2. Dejar el campo de texto vacío
3. Clic en "Publish"

**Esperado**
- La publicación funciona correctamente
- La imagen se publica sin texto adicional

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.6 - Preview: cancelar publicación
**Pasos**
1. Seleccionar código → se abre preview
2. Clic en "Cancel" (o presionar Escape)
3. O cerrar el panel manualmente (X)

**Esperado**
- El panel se cierra
- NO se publica nada en X
- No se incrementa el contador de tweets

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.7 - Preview: contador de caracteres
**Pasos**
1. Seleccionar código → se abre preview
2. Escribir un mensaje cercano a 260 caracteres
3. Escribir más de 260

**Esperado**
- El contador se actualiza en tiempo real
- A partir de 260 se pone en amarillo (warning)
- Al pasar 280 se pone en rojo (danger)

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.8 - Preview: firma visible en preview
**Pasos**
1. Asegurarse de que la firma esté habilitada
2. Seleccionar código → se abre preview

**Esperado**
- El panel muestra "Signature: 🚀 via X Writer" (o la personalizada)
- Si la firma está desactivada, muestra "Signature disabled"

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 4.9 - Preview con selección grande o compleja
**Pasos**
1. Seleccionar un bloque de código grande (>50 líneas)
2. Ejecutar `Post Code Image`

**Esperado**
- La imagen se genera correctamente
- El preview muestra la imagen completa con scroll si es necesario
- La extensión no crashea

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 5. Signature

### Caso 5.1 - Firma habilitada por defecto
**Pasos**
1. Revisar Settings
2. Buscar `xWriter.signature.enabled`

**Esperado**
- Está en `true` por defecto

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 5.2 - Firma se agrega al tweet
**Pasos**
1. Dejar firma habilitada
2. Publicar un tweet corto

**Esperado**
- El tweet final incluye la firma
- La firma aparece separada del contenido principal

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 5.3 - Firma personalizada
**Pasos**
1. Cambiar `xWriter.signature.text`
2. Publicar un tweet corto

**Esperado**
- Sale la nueva firma personalizada
- No usa la firma default

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 5.4 - Firma deshabilitada
**Pasos**
1. Desactivar `xWriter.signature.enabled`
2. Publicar un tweet

**Esperado**
- El tweet sale sin firma

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 5.5 - Firma que excede límite
**Pasos**
1. Activar firma
2. Escribir un tweet muy cercano a 280
3. Publicar

**Esperado**
- Si la firma no cabe, no debe romper la publicación
- Debe respetar el límite final
- No debe publicar un tweet inválido por longitud

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 6. Settings nuevos

### Caso 6.1 - Settings visibles
**Pasos**
1. Abrir Settings
2. Buscar `X Writer`

**Esperado**
Deben verse:
- Language
- Signature Enabled
- Signature Text
- Auto Thread Enabled

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 6.2 - Persistencia de settings
**Pasos**
1. Cambiar idioma, firma o auto-thread
2. Recargar la ventana

**Esperado**
- La configuración se mantiene

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 7. Internacionalización

### Caso 7.1 - Inglés
**Pasos**
1. Configurar `xWriter.language = en`
2. Abrir vista, ayuda y flujos nuevos

**Esperado**
- Todos los textos principales salen en inglés
- El comando `Post Code Image` aparece en inglés

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 7.2 - Español
**Pasos**
1. Configurar `xWriter.language = es`
2. Abrir vista, ayuda y flujos nuevos

**Esperado**
- Todos los textos principales salen en español
- El comando `Publicar Código como Imagen` aparece en español

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 7.3 - Cambio de idioma desde Help
**Pasos**
1. Abrir `Help & About`
2. Elegir `Change Language`
3. Cambiar entre English y Español

**Esperado**
- El setting cambia
- La vista se refresca
- El mensaje de confirmación aparece correctamente

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 8. Credenciales y seguridad

### Caso 8.1 - Publicar sin credenciales
**Pasos**
1. Resetear credenciales
2. Intentar publicar tweet o imagen

**Esperado**
- Muestra error de credenciales faltantes
- Ofrece configurar credenciales

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 8.2 - Importar credenciales desde archivo
**Pasos**
1. Ejecutar `Setup Credentials`
2. Elegir importación desde archivo
3. Seleccionar `.env` o `.txt` válido

**Esperado**
- Importa correctamente
- Verifica usuario si las credenciales son válidas

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 8.3 - Reset de credenciales
**Pasos**
1. Ejecutar `Reset Credentials`
2. Confirmar borrado

**Esperado**
- Elimina credenciales
- Posteriormente ya no deja publicar hasta volver a configurar

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 9. Límite diario

### Caso 9.1 - Contador normal
**Pasos**
1. Publicar un tweet
2. Volver a abrir el flujo de publicación

**Esperado**
- El prompt muestra un número menor de tweets restantes

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 9.2 - Hilos descuentan múltiples tweets
**Pasos**
1. Publicar un hilo de varias partes
2. Revisar contador restante

**Esperado**
- Descuenta tantas unidades como tweets publicados en el hilo

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 9.3 - Bloqueo por límite alcanzado
**Pasos**
1. Simular llegar a 17 tweets
2. Intentar publicar de nuevo

**Esperado**
- Muestra advertencia de límite alcanzado
- Indica tiempo restante hasta reset

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 10. Help / About

### Caso 10.1 - Contenido actualizado
**Pasos**
1. Ejecutar `X Writer: Help & About`

**Esperado**
- Debe mencionar `Post Code Image`
- Debe reflejar versión `v0.0.2`

**Resultado**
- [ ] OK
- [ ] FAIL

---

## 11. Regresión básica

### Caso 11.1 - Publicación tradicional sigue funcionando
**Pasos**
1. Publicar un tweet normal como en la versión anterior

**Esperado**
- No se rompió el flujo clásico

**Resultado**
- [ ] OK
- [ ] FAIL

### Caso 11.2 - Donación sigue funcionando
**Pasos**
1. Ejecutar `Donate / Support`

**Esperado**
- Abre Ko-fi correctamente

**Resultado**
- [ ] OK
- [ ] FAIL

---

## Evidencia recomendada para QA

Guardar:
- screenshots de la Activity Bar
- screenshot del flujo de hilo
- screenshot/publicación de imagen
- screenshot de settings nuevos
- screenshot de ayuda v0.0.2
- logs de errores si aparece algún fallo

---

## Plantilla de reporte QA

## Resumen
- Build probada:
- Fecha:
- Tester:
- Entorno:

## Resultado general
- [ ] PASS
- [ ] PASS con observaciones
- [ ] FAIL

## Bugs encontrados
| ID | Severidad | Área | Descripción | Pasos | Resultado esperado | Resultado actual |
|---|---|---|---|---|---|---|
| BUG-001 | Alta | Threads |  |  |  |  |

## Observaciones
- 
- 
- 

---

## Criterio de salida para publicar nueva versión
Se recomienda subir la nueva versión solo si:
- smoke test completo OK
- smart threads OK
- code to image OK
- firma configurable OK
- settings nuevos OK
- cambio de idioma OK
- sin errores críticos en publicación real
