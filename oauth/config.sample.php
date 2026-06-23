<?php
/**
 * Vorlage für die Konfiguration des OAuth-Vermittlers.
 * --------------------------------------------------
 * Auf dem Server zu  config.php  kopieren und mit den echten Werten der
 * GitHub-OAuth-App füllen.  config.php gehört NICHT ins Git und ist über
 * .htaccess gegen direkten Abruf gesperrt.
 */

declare(strict_types=1);

// Aus der GitHub-OAuth-App (Settings → Developer settings → OAuth Apps).
define('OAUTH_CLIENT_ID', 'HIER_CLIENT_ID_EINTRAGEN');
define('OAUTH_CLIENT_SECRET', 'HIER_CLIENT_SECRET_EINTRAGEN');

// Origins, an die das Token ausgeliefert werden darf (die CMS-Domain).
define('ALLOWED_ORIGINS', [
    'https://gemeinsam-wirkt.net',
    'https://www.gemeinsam-wirkt.net',
]);
