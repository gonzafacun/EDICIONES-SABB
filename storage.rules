rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // ─────────────────────────────────────────
    // FUNCIONES AUXILIARES
    // ─────────────────────────────────────────

    function isAdmin() {
      return request.auth != null &&
        firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 5 * 1024 * 1024; // máx 5MB
    }

    // ─────────────────────────────────────────
    // IMÁGENES DE PRODUCTOS
    // Lectura pública, subida solo admin
    // ─────────────────────────────────────────
    match /productos/{imagenId} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    // ─────────────────────────────────────────
    // IMÁGENES DEL SITIO (banners, logos, etc.)
    // ─────────────────────────────────────────
    match /sitio/{imagenId} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    // Denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
