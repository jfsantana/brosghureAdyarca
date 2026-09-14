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
                ['title' => 'Propósito', 'text' => 'Suministro de Óptima Calidad Industrial'],
                ['title' => 'Proyección', 'text' => 'Liderazgo Nacional, América Latina y el Caribe'],
            ],
        ],
        [
            'id' => 'Page1',
            'name' => 'Quienes Somos',
            'type' => 'content',
            'title' => 'MAS DE 14 AÑOS IMPULSANDO LA INDUSTRIA NACIONAL',
            'SubTitleText' => 'Sobre Nosotros',
            'text' => 'Con una trayectoria sólida de más de 14 años, en Adyar Industries nos hemos consolidado como un referente en la importación y distribución de materias primas de alta calidad para las principales industrias de Venezuela. Nuestra experiencia y conocimiento del mercado nos permiten ofrecer soluciones integrales y personalizadas a nuestros clientes, adaptándonos a sus necesidades específicas y contribuyendo al crecimiento de sus negocios.',
            'background' => 'assets/img/fondopagina2.png',
            'company' => 'ADYAR INDUSTRIES, C.A.',
            'sections' => [
                ['title' => 'Misión', 'text' => 'Distribuir y abastecer materias primas de óptima calidad, ofreciendo un excelente servicio al sector productivo industrial, químico y petroquímico del país.'],
                ['title' => 'Visión', 'text' => 'Ser líderes en la distribución y comercialización de materias primas a nivel nacional, América Latina y el Caribe. Cumpliendo con estándares internacionales de calidad y seguridad, con una infraestructura y tec- nología especializada.'],
            ],
            'firmaSeo' => 'assets/img/firmaAdrian.png',
        ],
        [
            'id' => 'Page2',
            'name' => 'Nuestros Valores',
            'type' => 'content',
            'title' => 'INFRAESTRUCTURA DE CLASE MUNDIAL Y VALORES INQUEBRANTABLES',
            // 'text' => 'Arquitectura, diseño interior, dirección de obra y soluciones integrales para proyectos residenciales y comerciales.',
            'background' => 'assets/img/pagina2.jpg',
            'valoresImg' => 'assets/img/valores.png',
            'Imagen1' => 'assets/img/montacarga1.jpg',
            'Imagen2' => 'assets/img/DSC08808-Enhanced-NR2.jpg',
            'Imagen3' => 'assets/img/DSC02377-Enhanced-NR2.jpg',
            'company' => 'ADYAR INDUSTRIES, C.A.',
            'sections' => [
                ['title' => 'Clientes Satisfechos', 'text' => '99%'],
                ['title' => 'Clientes Atendidos', 'text' => '10K+'],
                ['title' => 'Importaciones Anuales', 'text' => '1500+ Ton.'],
                ],
        ],
        [
            'id' => 'Page3',
            'name' => 'Nuestros Servicios',
            'type' => 'content',
            'title' => 'NUESTRO SERVICIOS',
            'text' => 'Contenido pendiente de desarrollar.',
            'background' => 'assets/img/fondopagina2.png',
            'company' => 'ADYAR INDUSTRIES, C.A.',
        ],
        [
            'id' => 'Page4',
            'name' => 'Page4',
            'type' => 'content',
            'title' => 'Nuestros Servicios 2/2',
            'text' => 'Contenido pendiente de desarrollar.',
            'background' => 'assets/img/fondopagina2.png',
            'company' => 'ADYAR INDUSTRIES, C.A.',
        ],
        [
            'id' => 'Page5',
            'name' => 'Page5',
            'type' => 'content',
            'title' => 'Contactos',
            'text' => 'Contenido pendiente de desarrollar.',
            'background' => 'assets/img/fondopagina2.png',
            'company' => 'ADYAR INDUSTRIES, C.A.',
        ],
    ],
];

echo json_encode($brochure, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);