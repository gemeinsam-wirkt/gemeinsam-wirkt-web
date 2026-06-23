<?php
/**
 * GitHub-OAuth-Vermittler für Sveltia CMS (Decap-/Netlify-kompatibel).
 * -------------------------------------------------------------------
 * Wickelt NUR den Login-Handshake ab – niemals Inhalte. Läuft auf einer
 * eigenen Subdomain (z. B. https://auth.gemeinsam-wirkt.net) im Hetzner-
 * Webhosting, getrennt vom Astro-Deploy (/public_html).
 *
 * Ablauf:
 *   1. Sveltia öffnet ein Popup auf  …/auth   → wir leiten zu GitHub weiter.
 *   2. GitHub leitet zurück auf       …/callback?code=…
 *   3. Wir tauschen den Code gegen ein Access-Token (mit dem Client-Secret)
 *      und reichen es per postMessage an das CMS-Fenster zurück.
 *
 * Client-ID/-Secret stehen in config.php (NICHT im Git, NICHT öffentlich).
 */

declare(strict_types=1);

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    exit('config.php fehlt. Bitte aus config.sample.php anlegen.');
}
require $configPath;

// Callback erkennen wir am vorhandenen ?code= von GitHub.
if (isset($_GET['code'])) {
    handle_callback();
} else {
    handle_auth_start();
}

/** Schritt 1: Weiterleitung zu GitHubs Login-/Freigabeseite. */
function handle_auth_start(): void
{
    $state = bin2hex(random_bytes(16));
    setcookie('oauth_state', $state, [
        'expires'  => time() + 600,
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    $params = http_build_query([
        'client_id'    => OAUTH_CLIENT_ID,
        'redirect_uri' => redirect_uri(),
        'scope'        => requested_scope(),
        'state'        => $state,
        'allow_signup' => 'false',
    ]);

    header('Location: https://github.com/login/oauth/authorize?' . $params, true, 302);
    exit;
}

/** Schritt 2/3: Code prüfen, gegen Token tauschen, Token ans CMS zurückgeben. */
function handle_callback(): void
{
    $state       = (string) ($_GET['state'] ?? '');
    $cookieState = (string) ($_COOKIE['oauth_state'] ?? '');

    // CSRF-Schutz: state aus dem Cookie muss zum zurückgegebenen state passen.
    if ($state === '' || $cookieState === '' || !hash_equals($cookieState, $state)) {
        render_message('error', ['error' => 'Ungültiger oder fehlender state-Parameter.']);
        return;
    }

    $token = exchange_code((string) $_GET['code']);
    if ($token === null) {
        render_message('error', ['error' => 'Token-Austausch mit GitHub fehlgeschlagen.']);
        return;
    }

    render_message('success', ['token' => $token, 'provider' => 'github']);
}

/** Tauscht den Authorization-Code gegen ein Access-Token. */
function exchange_code(string $code): ?string
{
    $ch = curl_init('https://github.com/login/oauth/access_token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'client_id'     => OAUTH_CLIENT_ID,
            'client_secret' => OAUTH_CLIENT_SECRET,
            'code'          => $code,
            'redirect_uri'  => redirect_uri(),
        ]),
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === false) {
        return null;
    }
    $data = json_decode($response, true);
    return isset($data['access_token']) && is_string($data['access_token'])
        ? $data['access_token']
        : null;
}

/** Eigene Callback-URL (muss exakt der GitHub-OAuth-App-Einstellung entsprechen). */
function redirect_uri(): string
{
    return 'https://' . $_SERVER['HTTP_HOST'] . '/callback';
}

/** Erlaubt nur bekannte Scopes; Default: repo (deckt private & öffentliche Repos). */
function requested_scope(): string
{
    $scope = (string) ($_GET['scope'] ?? 'repo');
    return in_array($scope, ['repo', 'public_repo'], true) ? $scope : 'repo';
}

/**
 * Gibt das Ergebnis per postMessage an das öffnende CMS-Fenster zurück.
 * Das Token geht ausschließlich an erlaubte Origins (ALLOWED_ORIGINS).
 */
function render_message(string $status, array $payload): void
{
    $message = 'authorization:github:' . $status . ':' . json_encode($payload);
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!doctype html>
<html lang="de">
  <head><meta charset="utf-8" /><title>Anmeldung …</title></head>
  <body>
    <p>Anmeldung wird abgeschlossen …</p>
    <script>
      (function () {
        var message = <?= json_encode($message) ?>;
        var allowed = <?= json_encode(ALLOWED_ORIGINS) ?>;

        function receiveMessage(e) {
          if (allowed.indexOf(e.origin) === -1) {
            return; // Token niemals an fremde Fenster ausliefern.
          }
          window.opener.postMessage(message, e.origin);
          window.removeEventListener('message', receiveMessage, false);
        }

        if (!window.opener) {
          document.body.textContent =
            'Dieses Fenster wurde nicht vom CMS geöffnet. Bitte über /admin anmelden.';
          return;
        }
        window.addEventListener('message', receiveMessage, false);
        // Handshake anstoßen: das CMS antwortet mit seiner Origin.
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>
<?php
}
