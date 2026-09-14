<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET, OPTIONS');
    echo json_encode(['error' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

$aboutApiUrl = 'https://v1.adyarca.com/wp-json/wp/v2/pages/114';
$mission = 'Brindar materias primas de alta calidad que satisfagan las necesidades de nuestros clientes y aporten al desarrollo sostenible de la industria.';
$vision = 'Ser el líder en la importación y distribución de materias primas en América Latina, destacando por nuestro compromiso con la calidad y el medio ambiente.';

function fetchRemotePage(string $url): ?array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($response === false || $status < 200 || $status >= 300) {
        return null;
    }

    $data = json_decode($response, true);
    return is_array($data) ? $data : null;
}

function extractSection(string $html, string $label, string $fallback): string
{
    $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($html)) ?? '');
    $pattern = '/'.preg_quote($label, '/').'.*?(.*?)(?=Nuestra|Nuestro|$)/isu';

    if (preg_match($pattern, $plainText, $matches) === 1) {
        $text = trim(html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'), " .\t\n\r\0\x0B");
        if ($text !== '') {
            return $text;
        }
    }

    return $fallback;
}

$aboutPage = fetchRemotePage($aboutApiUrl);
if ($aboutPage !== null) {
    $renderedContent = (string) ($aboutPage['content']['rendered'] ?? '');
    $mission = extractSection($renderedContent, 'Nuestra Misión', $mission);
    $vision = extractSection($renderedContent, 'Nuestra Visión', $vision);
}

$brochure = [
    'title' => 'ADYARCA — Brochure digital',
    'downloadUrl' => 'assets/pdf/brochure.pdf',
    'pages' => [
        [
            'id' => 'Portada',
            'name' => 'Portada',
            'type' => 'cover',
            'title' => '14 AÑOS: EL MOTOR DE LA INDUSTRIA VENEZOLANA',
            'text' => 'La Revista de la Materia Prima Química en Venezuela',
            'company' => 'ADYAR INDUSTRIES, C.A.',
            'edition' => 'AÑO 1, NRO. 1  ·  JULIO 2024  ·  DISTRIBUCIÓN GRATUITA',
            'background' => 'assets/img/fondo portara.jpg',
            'teamImage' => 'assets/img/equipo.png',
            'commitment' => 'Soluciones Integrales y Personalizadas',
            'sectors' => 'Materia Prima para Industria Química y Petroquímica',
            'sections' => [
                ['title' => 'Misión', 'text' => 'Suministro de Óptima Calidad Industrial'],
                ['title' => 'Visión', 'text' => 'Liderazgo Nacional, América Latina y el Caribe'],
            ],
        ],
        [
            'id' => 'Page1',
            'name' => 'Page1',
            'type' => 'content',
            'title' => 'Quiénes somos',
            'text' => 'Somos un estudio multidisciplinario que convierte ideas en espacios memorables, funcionales y duraderos.',
        ],
        [
            'id' => 'Page2',
            'name' => 'Page2',
            'type' => 'content',
            'title' => 'Servicios',
            'text' => 'Arquitectura, diseño interior, dirección de obra y soluciones integrales para proyectos residenciales y comerciales.',
        ],
        [
            'id' => 'Page3',
            'name' => 'Page3',
            'type' => 'content',
            'title' => 'Nuestros Servicios 1/2',
            'text' => 'Contenido pendiente de desarrollar.',
        ],
        [
            'id' => 'Page4',
            'name' => 'Page4',
            'type' => 'content',
            'title' => 'Nuestros Servicios 2/2',
            'text' => 'Contenido pendiente de desarrollar.',
        ],
        [
            'id' => 'Page5',
            'name' => 'Page5',
            'type' => 'content',
            'title' => 'Contactos',
            'text' => 'Contenido pendiente de desarrollar.',
        ],
    ],
];

echo json_encode($brochure, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);